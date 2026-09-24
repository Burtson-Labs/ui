import { Avatar, AvatarFallback, AvatarImage } from '@burtson-labs/ui';

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10">
        <AvatarImage src="https://github.com/Burtson-Labs.png" alt="Burtson Labs" />
        <AvatarFallback>BL</AvatarFallback>
      </Avatar>
      <Avatar className="size-10">
        <AvatarFallback>MB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AS</AvatarFallback>
      </Avatar>
    </div>
  );
}
