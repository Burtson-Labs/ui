import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
} from '@burtson-labs/ui';

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Nightly audit</CardTitle>
        <CardDescription>Sentinel · 14 repositories</CardDescription>
        <CardAction>
          <Badge variant="success">Passing</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>History scanned</span>
          <span className="font-mono text-foreground">82%</span>
        </div>
        <Progress value={82} />
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">View report</Button>
        <Button size="sm" variant="ghost">
          Re-run
        </Button>
      </CardFooter>
    </Card>
  );
}
