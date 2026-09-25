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
    <div className="flex flex-wrap gap-2">
      <RenameDialog />
      <InviteDialog />
    </div>
  );
}

function InviteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite people</Button>
      </DialogTrigger>
      {/* A bottom sheet on phones, a centred window from 640px. */}
      <DialogContent mobile="sheet">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            They get an email with a link to join this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="invite-emails">Email addresses</Label>
          <Input id="invite-emails" placeholder="ada@example.com, grace@example.com" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Send invites</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameDialog() {
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
