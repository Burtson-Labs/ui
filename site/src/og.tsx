// The link-preview card, rendered with the real components by scripts/og.mjs.
import BurtsonLabsVial from '@burtson-labs/icons/react/burtson-labs-vial';
import Sparkles from '@burtson-labs/icons/react/sparkles';
import { createRoot } from 'react-dom/client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  Progress,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@burtson-labs/ui';

import './styles.css';

function Touch() {
  return (
    <div className="grid size-[180px] place-items-center bg-background">
      <BurtsonLabsVial className="size-28 text-brand" aria-hidden />
    </div>
  );
}

function Og() {
  return (
    <div className="relative flex h-[630px] w-[1200px] overflow-hidden bg-background p-16">
      <div className="absolute -right-40 -bottom-56 size-[46rem] rounded-full bg-brand/20 blur-3xl" />
      <div className="relative z-10 flex w-[560px] flex-col">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <BurtsonLabsVial className="size-10 text-brand" aria-hidden />
          <div>
            Burtson UI
            <div className="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground">
              BURTSON LABS · OPEN SOURCE
            </div>
          </div>
        </div>
        <h1 className="mt-14 text-6xl leading-[1.02] font-bold tracking-tight">
          Components for
          <br />
          <span className="text-brand">every app we ship.</span>
        </h1>
        <p className="mt-6 text-2xl leading-snug text-muted-foreground">
          Accessible React on Radix and Tailwind, with Burtson Icons built in. Free under MIT.
        </p>
        <div className="mt-auto flex gap-3 font-mono text-lg">
          <span className="rounded-full border border-brand bg-brand-soft px-4 py-2 text-accent-foreground">
            ui.burtson.ai
          </span>
          <span className="rounded-full border bg-card px-4 py-2">npm i @burtson-labs/ui</span>
        </div>
      </div>
      <div className="relative z-10 ml-auto grid w-[470px] content-center gap-4">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle>Nightly audit</CardTitle>
            <CardDescription>Sentinel · 14 repositories</CardDescription>
            <CardAction>
              <Badge variant="success">Passing</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3 px-5">
            <Progress value={82} />
            <div className="flex gap-2">
              <Button size="sm">View report</Button>
              <Button size="sm" variant="outline">
                Re-run
              </Button>
            </div>
          </CardContent>
        </Card>
        <Alert variant="brand">
          <Sparkles />
          <AlertTitle>New model available</AlertTitle>
          <AlertDescription>gemma4:e4b is ready for the agent loop.</AlertDescription>
        </Alert>
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">
          <Tabs defaultValue="changes">
            <TabsList>
              <TabsTrigger value="changes">Changes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
          <Label>
            <Switch defaultChecked /> Sandbox
          </Label>
          <Label>
            <Checkbox defaultChecked /> Scrub env
          </Label>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(location.search.includes('touch') ? <Touch /> : <Og />);
