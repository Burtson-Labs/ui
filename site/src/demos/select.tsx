import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@burtson-labs/ui';

export default function SelectDemo() {
  return (
    <Select defaultValue="gemma4:e4b">
      <SelectTrigger className="w-56" aria-label="Model">
        <SelectValue placeholder="Choose a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Installed</SelectLabel>
          <SelectItem value="gemma4:e4b">gemma4:e4b</SelectItem>
          <SelectItem value="qwen3:8b">qwen3:8b</SelectItem>
          <SelectItem value="llama3.3:70b">llama3.3:70b</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
