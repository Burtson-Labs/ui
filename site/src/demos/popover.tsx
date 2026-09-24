import { Button, Input, Label, Popover, PopoverContent, PopoverTrigger } from '@burtson-labs/ui';

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Limits</Button>
      </PopoverTrigger>
      <PopoverContent className="grid gap-3">
        <p className="text-sm font-medium">Run limits</p>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label htmlFor="turns">Max turns</Label>
          <Input id="turns" defaultValue="40" className="col-span-2 h-8" />
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label htmlFor="timeout">Timeout</Label>
          <Input id="timeout" defaultValue="10m" className="col-span-2 h-8" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
