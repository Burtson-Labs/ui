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
    <div className="flex flex-wrap gap-2">
      <SideSheet />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open bottom drawer</Button>
        </SheetTrigger>
        {/* It has its own Done button, so no X in the corner. */}
        <SheetContent side="bottom" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Run 4821</SheetTitle>
            <SheetDescription>release-captain · finished 2m 14s ago</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Done</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SideSheet() {
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
