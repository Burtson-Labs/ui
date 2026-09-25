// Generate references from the same TypeScript source and inherited types we ship.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const paths = readdirSync(join(root, 'src/components'))
  .filter((f) => f.endsWith('.tsx'))
  .sort();
const program = ts.createProgram(
  paths.map((f) => join(root, 'src/components', f)),
  parsed.options,
);
const checker = program.getTypeChecker();
const out = join(root, 'site/src/generated/api');
mkdirSync(out, { recursive: true });
const nativePool = {};
const flags =
  ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
const describe = (symbol) => ts.displayPartsToString(symbol.getDocumentationComment(checker));
const typeText = (type, node) => checker.typeToString(type, node, flags);

function implementation(node) {
  if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node))
    return node;
  if (ts.isVariableDeclaration(node) && node.initializer) {
    if (ts.isCallExpression(node.initializer))
      return node.initializer.arguments.find(
        (a) => ts.isArrowFunction(a) || ts.isFunctionExpression(a),
      );
    return implementation(node.initializer);
  }
  return undefined;
}

function defaultsFor(node) {
  const result = {};
  const fn = implementation(node);
  if (!fn) return result;
  const collect = (binding) => {
    if (!ts.isObjectBindingPattern(binding)) return;
    for (const e of binding.elements)
      if (e.initializer)
        result[e.propertyName?.getText() ?? e.name.getText()] = e.initializer.getText();
  };
  const first = fn.parameters[0];
  if (first) collect(first.name);
  if (first && ts.isIdentifier(first.name) && fn.body && ts.isBlock(fn.body)) {
    for (const statement of fn.body.statements)
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (declaration.initializer?.getText() === first.name.text) collect(declaration.name);
        }
      }
  }
  return result;
}

function properties(type, node, defaults = {}) {
  const variants = type.isUnion() ? type.types : [type];
  if (variants.every((v) => !(v.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection))))
    return [];
  const names = new Set(variants.flatMap((v) => checker.getPropertiesOfType(v).map((p) => p.name)));
  return [...names]
    .filter((name) => !name.startsWith('__'))
    .sort()
    .map((name) => {
      const symbols = variants.map((v) => v.getProperty(name)).filter(Boolean);
      const types = [
        ...new Set(
          symbols.map((p) =>
            typeText(
              checker.getTypeOfSymbolAtLocation(
                p,
                p.valueDeclaration ?? p.declarations?.[0] ?? node,
              ),
              node,
            ),
          ),
        ),
      ];
      const declarations = symbols.flatMap((p) => p.declarations ?? []);
      const native =
        declarations.length > 0 &&
        declarations.every((d) =>
          /node_modules\/(?:@types\/react|csstype)\//.test(
            d.getSourceFile().fileName.replaceAll('\\', '/'),
          ),
        );
      const descriptions = [...new Set(symbols.map(describe).filter(Boolean))];
      const tags = symbols
        .flatMap((p) => p.getJsDocTags(checker))
        .filter((t) => t.name === 'default' || t.name === 'defaultValue');
      return {
        name,
        type: types.join(' | '),
        required:
          symbols.length === variants.length &&
          symbols.every((p) => !(p.flags & ts.SymbolFlags.Optional)),
        default: defaults[name] ?? (tags[0] ? ts.displayPartsToString(tags[0].text) : null),
        description: descriptions.join('\n'),
        native,
      };
    });
}

let count = 0;
for (const file of paths) {
  const source = program.getSourceFile(join(root, 'src/components', file));
  const module = checker.getSymbolAtLocation(source);
  const exports = checker
    .getExportsOfModule(module)
    .map((exported) => {
      const symbol =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const node = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? source;
      const isType = !(symbol.flags & ts.SymbolFlags.Value);
      const type = isType
        ? checker.getDeclaredTypeOfSymbol(symbol)
        : checker.getTypeOfSymbolAtLocation(symbol, node);
      const signatures = type.getCallSignatures();
      const component = !isType && /^[A-Z]/.test(exported.name) && signatures.length > 0;
      let props = [];
      if (component && signatures[0].parameters[0]) {
        const param = signatures[0].parameters[0];
        props = properties(
          checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration ?? node),
          node,
          defaultsFor(node),
        );
      } else if (isType) props = properties(type, node);
      return {
        name: exported.name,
        kind: component ? 'component' : isType ? 'type' : signatures.length ? 'function' : 'value',
        description: describe(symbol),
        signatures: component
          ? []
          : signatures.map((s) => checker.signatureToString(s, node, flags)),
        type: component ? null : typeText(type, node),
        props: props.filter((p) => !p.native),
        inherited: props
          .filter((p) => p.native)
          .map((p) => {
            const id = createHash('sha256').update(JSON.stringify(p)).digest('hex').slice(0, 16);
            nativePool[id] = p;
            return id;
          }),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const data =
    JSON.stringify(
      { component: file.replace('.tsx', ''), source: `src/components/${file}`, exports },
      null,
      2,
    ) + '\n';
  const target = join(out, file.replace('.tsx', '.json'));
  if (check) {
    let previous;
    try {
      previous = readFileSync(target, 'utf8');
    } catch {
      previous = '';
    }
    if (previous !== data) throw new Error(`Stale API reference: ${file}. Run npm run api.`);
  } else writeFileSync(target, data);
  count += exports.length;
}
const nativeTarget = join(out, '../api-native.json');
const nativeData = JSON.stringify(nativePool, null, 2) + '\n';
if (check) {
  if (readFileSync(nativeTarget, 'utf8') !== nativeData)
    throw new Error('Stale inherited API metadata. Run npm run api.');
} else writeFileSync(nativeTarget, nativeData);
process.stdout.write(
  `${check ? 'Checked' : 'Generated'} ${paths.length} API pages covering ${count} exports.\n`,
);
