import ShieldProof from '@burtson-labs/icons/react/shield-proof';
import StealthMask from '@burtson-labs/icons/react/stealth-mask';
import Terminal from '@burtson-labs/icons/react/terminal';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@burtson-labs/ui';

const products = [
  {
    icon: StealthMask,
    title: 'Bandit Stealth',
    text: 'Local-first coding agent for VS Code and the desktop.',
  },
  { icon: Terminal, title: 'Bandit CLI', text: 'The same agent in your terminal.' },
  { icon: ShieldProof, title: 'Sentinel', text: 'Repository audits with proof, not guesses.' },
];

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[22rem] gap-1">
              {products.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <NavigationMenuLink href="#" className="flex-row items-start gap-3">
                    <Icon className="mt-0.5 text-brand" />
                    <span className="grid gap-0.5">
                      <span className="font-semibold">{title}</span>
                      <span className="text-xs text-muted-foreground">{text}</span>
                    </span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
