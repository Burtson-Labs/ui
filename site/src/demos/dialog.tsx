import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@burtson-labs/ui';

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Rename agent</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename agent</DialogTitle>
          <DialogDescription>The name shows in the command bar and in logs.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="agent-name">Name</Label>
          <Input id="agent-name" defaultValue="release-captain" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
