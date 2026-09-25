import * as React from 'react';

import {
  Badge,
  Button,
  type ButtonProps,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Progress,
  Status,
} from '@burtson-labs/ui';

import { Code } from './code';

/** A working, local example. State changes stay inside this preview. */
export function Playground() {
  const labelId = React.useId();
  const [variant, setVariant] = React.useState<ButtonProps['variant']>('default');
  const [loading, setLoading] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [label, setLabel] = React.useState('Save changes');
  const [clicks, setClicks] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  // A click shows what the button does with a real async action: loading while
  // it runs, then done. Nothing leaves this page.
  const run = () => {
    setRunning(true);
    timer.current = window.setTimeout(() => {
      setRunning(false);
      setClicks((n) => n + 1);
    }, 900);
  };
  const message = running
    ? 'Running… the button shows its loading state and ignores further clicks.'
    : clicks
      ? `Done (${clicks} ${clicks === 1 ? 'click' : 'clicks'}). A demo action: nothing is sent anywhere.`
      : 'Click to see the loading state a real action would show.';
  return (
    <section className="playground" aria-labelledby="playground-title">
      <div className="section-intro">
        <div>
          <p className="overline">Playground</p>
          <h2 id="playground-title">Try the components</h2>
        </div>
        <p>
          Change a label, variant or state and copy the resulting code. The accent picker re-themes
          every example.
        </p>
      </div>
      <div className="playground-grid">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Action playground</CardTitle>
              <Badge variant="outline">Interactive</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 pt-5">
            <div className="flex min-h-32 flex-col items-center justify-center gap-5 rounded-lg border border-dashed bg-surface-muted p-5">
              <Button
                variant={variant}
                loading={loading || running}
                disabled={disabled}
                onClick={run}
              >
                {label || 'Save changes'}
              </Button>
              <p role="status" className="text-center text-xs text-muted-foreground">
                {message}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label htmlFor={labelId} className="grid gap-1.5 text-xs font-medium">
                Label
                <Input
                  id={labelId}
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium">
                Variant
                <select
                  className="h-9 rounded-md border border-input bg-surface px-3 text-sm"
                  value={variant ?? 'default'}
                  onChange={(event) => setVariant(event.target.value as ButtonProps['variant'])}
                >
                  {[
                    'default',
                    'brand',
                    'soft',
                    'secondary',
                    'outline',
                    'ghost',
                    'destructive',
                    'link',
                  ].map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={loading}
                  onChange={(event) => setLoading(event.target.checked)}
                />
                Loading
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={disabled}
                  onChange={(event) => setDisabled(event.target.checked)}
                />
                Disabled
              </label>
            </div>
            <Code
              code={`<Button variant="${variant}"${loading ? ' loading' : ''}${disabled ? ' disabled' : ''}>\n  ${label.replace(/[<>&{}]/g, '') || 'Save changes'}\n</Button>`}
            />
          </CardContent>
        </Card>
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Release readiness</CardTitle>
                <Badge variant="success">Healthy</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                  82<span className="text-xl text-muted-foreground">%</span>
                </span>
                <span className="text-xs text-muted-foreground">Sample project</span>
              </div>
              <Progress value={82} aria-label="Sample release readiness" />
              <div className="grid gap-3 text-sm">
                <Status status="success">Build checks complete</Status>
                <Status status="info">Review in progress</Status>
              </div>
            </CardContent>
          </Card>
          <div className="rounded-xl border bg-surface-muted p-5">
            <p className="font-semibold">Where it is used</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Consistent controls for agent workspaces, infrastructure dashboards, and client
              applications. Built from source you own.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">Keyboard friendly</Badge>
              <Badge variant="outline">Light + dark</Badge>
              <Badge variant="outline">Burtson Icons</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
