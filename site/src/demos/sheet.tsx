import {
  Button,
  Input,
  Label,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@burtson-labs/ui';

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Workspace settings</SheetTitle>
          <SheetDescription>Saved to .bandit/config.json.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-4">
          <Label htmlFor="ws-name">Name</Label>
          <Input id="ws-name" defaultValue="bandit-stealth" />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Save</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
