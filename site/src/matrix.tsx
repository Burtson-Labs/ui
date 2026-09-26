import AlertCircle from '@burtson-labs/icons/react/alert-circle';
import Check from '@burtson-labs/icons/react/check';
import Copy from '@burtson-labs/icons/react/copy';
import FileCode from '@burtson-labs/icons/react/file-code';
import Folder from '@burtson-labs/icons/react/folder';
import Home from '@burtson-labs/icons/react/home';
import Inbox from '@burtson-labs/icons/react/inbox';
import MessageSquare from '@burtson-labs/icons/react/message-square';
import MoreHorizontal from '@burtson-labs/icons/react/more-horizontal';
import Plus from '@burtson-labs/icons/react/plus';
import Search from '@burtson-labs/icons/react/search';
import Settings from '@burtson-labs/icons/react/settings';
import Sparkles from '@burtson-labs/icons/react/sparkles';
import Trash from '@burtson-labs/icons/react/trash';
import Zap from '@burtson-labs/icons/react/zap';
import * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  AppShell,
  AppShellBody,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
  AttachmentItem,
  AttachmentTray,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CheckboxCard,
  CheckboxCardGroup,
  CheckboxRow,
  cn,
  CodeBlock,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Composer,
  ConnectionBanner,
  ConnectionStatus,
  type ConnectionState,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  Conversation,
  CopyButton,
  DataTable,
  type DataTableColumn,
  type DataTableSort,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  EditorTabs,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  ErrorSummary,
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldHeader,
  FieldHint,
  FieldLabel,
  FieldSet,
  FormActions,
  IconButton,
  InlineSwitch,
  Input,
  Kbd,
  KbdGroup,
  Label,
  Markdown,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  Message,
  MessageActions,
  MessageAttachments,
  MessageEditor,
  MobileNav,
  NativeSelect,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NumberInput,
  OnboardingChecklist,
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderMain,
  PageHeaderTitle,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioCard,
  RadioGroup,
  RadioGroupItem,
  Reasoning,
  ResizablePanel,
  ResizablePanelGroup,
  ResizeHandle,
  ScrollArea,
  SearchInput,
  SecretInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Slider,
  SourceCitation,
  SourceList,
  Spinner,
  Spotlight,
  StatCard,
  StatStrip,
  Status,
  Steps,
  StreamingIndicator,
  Suggestions,
  Switch,
  SwitchList,
  SwitchRow,
  SyncStatus,
  type SyncState,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  Toaster,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolApproval,
  ToolCall,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Tour,
  TourAnchor,
  TreeView,
  UploadQueue,
} from '@burtson-labs/ui';

import AudioPlayerDemo from './demos/audio-player';
import ChatHistoryDemo from './demos/chat-history';
import ChatLayoutDemo from './demos/chat-layout';
import VoiceRecorderDemo from './demos/voice-recorder';

/*
 * The state matrix: every component in every state, one section per family,
 * for the visual pass and the Playwright smoke test. Not linked from the
 * docs. Theme and accent come from the URL through theme-init.js
 * (?theme=dark&accent=blue); the rest are read here:
 *
 *   /matrix                       every section
 *   /matrix?section=fields        one section
 *   /matrix?density=compact       compact where a component has a density
 *   /matrix?open=dialog           one overlay open (see OVERLAYS)
 */

const params = () => new URLSearchParams(window.location.search);

export const SECTIONS = [
  'actions',
  'fields',
  'navigation',
  'surfaces',
  'data',
  'chat',
  'overlays',
] as const;
export type MatrixSection = (typeof SECTIONS)[number];

export const OVERLAYS = [
  'dialog',
  'dialog-sheet',
  'alert-dialog',
  'sheet-right',
  'sheet-bottom',
  'popover',
  'tooltip',
  'dropdown-menu',
  'select',
  'menubar',
  'navigation-menu',
  'command-dialog',
  'tour',
  'spotlight',
  'toaster',
] as const;

function Cell({
  name,
  children,
  className,
  wide,
}: {
  name: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <figure
      data-matrix-cell={name}
      className={cn('grid min-w-0 content-start gap-2', wide && 'col-span-full', className)}
    >
      <figcaption className="font-mono text-[10px] leading-4 text-muted-foreground">
        {name}
      </figcaption>
      <div className="grid min-w-0 content-start items-start justify-items-start gap-2">
        {children}
      </div>
    </figure>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: MatrixSection;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-matrix-section={id}
      aria-labelledby={`${id}-title`}
      className="grid gap-5 border-b py-6 last:border-b-0"
    >
      <h2 id={`${id}-title`} className="text-sm font-semibold tracking-tight">
        {title}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-x-6 gap-y-6">
        {children}
      </div>
    </section>
  );
}

const BUTTON_VARIANTS = [
  'default',
  'brand',
  'soft',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
] as const;
const BUTTON_SIZES = ['xs', 'sm', 'default', 'lg'] as const;
const BADGE_VARIANTS = [
  'default',
  'secondary',
  'brand',
  'success',
  'warning',
  'destructive',
  'info',
  'outline',
] as const;
const ALERT_VARIANTS = ['default', 'brand', 'success', 'warning', 'destructive', 'info'] as const;
const CARD_VARIANTS = ['default', 'raised', 'subtle', 'interactive', 'terminal'] as const;
const STATUSES = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const;

function Actions() {
  return (
    <Section id="actions" title="Actions and indicators">
      {BUTTON_VARIANTS.map((variant) => (
        <Cell key={variant} name={`Button/${variant}`}>
          <div className="flex flex-wrap items-center gap-2">
            {BUTTON_SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                <Plus /> {size}
              </Button>
            ))}
            <Button variant={variant} size="icon" aria-label="Settings">
              <Settings />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={variant} disabled>
              Disabled
            </Button>
            <Button variant={variant} loading>
              Loading
            </Button>
            <Button variant={variant} asChild>
              <a href="#actions">Link</a>
            </Button>
            <Button variant={variant} asChild disabled>
              <a href="#actions">Off link</a>
            </Button>
          </div>
        </Cell>
      ))}
      <Cell name="Button/icon-sizes">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="icon-sm" variant="outline" aria-label="Small">
            <Settings />
          </Button>
          <Button size="icon" variant="outline" aria-label="Default">
            <Settings />
          </Button>
          <Button size="icon-lg" variant="outline" aria-label="Large">
            <Settings />
          </Button>
          <IconButton label="Icon button">
            <Settings />
          </IconButton>
          <IconButton label="Ghost icon" variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </IconButton>
          <CopyButton value="secret" label="Copy" />
          <CopyButton value="secret" label="Copy outline" variant="outline" size="icon" />
        </div>
      </Cell>
      <Cell name="Badge">
        <div className="flex flex-wrap gap-1.5">
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
          <Badge variant="brand">
            <Check /> Icon
          </Badge>
          <Badge variant="outline" asChild>
            <a href="#actions">Link</a>
          </Badge>
        </div>
      </Cell>
      <Cell name="Status">
        <div className="flex flex-wrap gap-3">
          {STATUSES.map((s) => (
            <Status key={s} status={s} pulse={s === 'brand'}>
              {s}
            </Status>
          ))}
        </div>
      </Cell>
      <Cell name="Kbd">
        <div className="flex items-center gap-2 text-sm">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
          <span className="text-muted-foreground">in a sentence</span>
        </div>
      </Cell>
      <Cell name="Spinner+Skeleton">
        <div className="flex items-center gap-3">
          <Spinner />
          <Spinner className="size-6" label="Pulling model" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </Cell>
      <Cell name="Progress">
        <div className="grid w-56 gap-3">
          <Progress value={0} aria-label="Zero" />
          <Progress value={42} aria-label="Some" />
          <Progress value={100} aria-label="Done" />
          <Progress aria-label="Indeterminate" />
        </div>
      </Cell>
      <Cell name="Avatar">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <Avatar className="size-10">
            <AvatarFallback>GH</AvatarFallback>
          </Avatar>
          <Avatar className="size-6">
            <AvatarFallback>K</AvatarFallback>
          </Avatar>
        </div>
      </Cell>
      <Cell name="Separator">
        <div className="grid w-48 gap-3">
          <Separator />
          <div className="flex h-5 items-center gap-3 text-sm">
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
        </div>
      </Cell>
    </Section>
  );
}

const comboOptions = [
  { value: 'a', label: 'Ada Lovelace', description: 'ada@example.com' },
  { value: 'b', label: 'Grace Hopper', description: 'grace@example.com' },
  { value: 'c', label: 'Alan Turing', description: 'alan@example.com', disabled: true },
];

function ModelSelect({
  size,
  disabled,
  invalid,
  placeholder,
  defaultOpen,
  value = 'gemma4:e4b',
}: {
  size?: 'sm' | 'default';
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: boolean;
  defaultOpen?: boolean;
  value?: string;
}) {
  return (
    <Select
      defaultValue={placeholder ? undefined : value}
      disabled={disabled}
      defaultOpen={defaultOpen}
    >
      <SelectTrigger size={size} aria-label="Model" aria-invalid={invalid || undefined}>
        <SelectValue placeholder="Choose a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Installed</SelectLabel>
          <SelectItem value="gemma4:e4b">gemma4:e4b</SelectItem>
          <SelectItem value="qwen3:8b">qwen3:8b</SelectItem>
          <SelectItem value="llama3.3:70b" disabled>
            llama3.3:70b
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="cloud">Cloud model</SelectItem>
      </SelectContent>
    </Select>
  );
}

function Fields() {
  const [slider, setSlider] = React.useState(40);
  const [combo, setCombo] = React.useState<string | null>('a');
  return (
    <Section id="fields" title="Fields">
      <Cell name="Input">
        <div className="grid w-64 gap-2">
          <Input placeholder="Placeholder" aria-label="Placeholder" />
          <Input defaultValue="A value" aria-label="Value" />
          <Input defaultValue="Disabled" disabled aria-label="Disabled" />
          <Input defaultValue="Invalid" aria-invalid aria-label="Invalid" />
          <Input type="search" placeholder="Search" aria-label="Search" />
          <Input type="file" aria-label="File" />
          <Input type="number" defaultValue={42} aria-label="Number" />
        </div>
      </Cell>
      <Cell name="Textarea">
        <div className="grid w-64 gap-2">
          <Textarea placeholder="Notes…" aria-label="Notes" />
          <Textarea defaultValue="Disabled" disabled aria-label="Disabled notes" />
          <Textarea defaultValue="Invalid" aria-invalid aria-label="Invalid notes" />
        </div>
      </Cell>
      <Cell name="SecretInput">
        <div className="grid w-64 gap-2">
          <SecretInput defaultValue="sk-live-abcdef" aria-label="API key" revealLabel="API key" />
          <SecretInput defaultValue="sk-live-abcdef" disabled aria-label="Disabled key" />
        </div>
      </Cell>
      <Cell name="Select">
        <div className="flex flex-wrap gap-2">
          <ModelSelect />
          <ModelSelect size="sm" />
          <ModelSelect placeholder />
          <ModelSelect disabled />
          <ModelSelect invalid />
        </div>
      </Cell>
      <Cell name="Combobox">
        <div className="grid w-64 gap-2">
          <Combobox
            options={comboOptions}
            value={combo}
            onValueChange={setCombo}
            placeholder="Pick a person"
          />
          <Combobox
            options={comboOptions}
            value={null}
            onValueChange={() => undefined}
            placeholder="Empty"
          />
          <Combobox
            options={comboOptions}
            value={null}
            onValueChange={() => undefined}
            placeholder="Disabled"
            disabled
          />
          <Combobox
            options={comboOptions}
            value={null}
            onValueChange={() => undefined}
            placeholder="Invalid"
            aria-invalid
          />
        </div>
      </Cell>
      <Cell name="Checkbox">
        <div className="grid gap-2">
          <Label>
            <Checkbox /> Unchecked
          </Label>
          <Label>
            <Checkbox defaultChecked /> Checked
          </Label>
          <Label>
            <Checkbox checked="indeterminate" /> Mixed
          </Label>
          <Label>
            <Checkbox disabled /> Disabled
          </Label>
          <Label>
            <Checkbox disabled defaultChecked /> Disabled checked
          </Label>
          <Label>
            <Checkbox aria-invalid /> Invalid
          </Label>
        </div>
      </Cell>
      <Cell name="RadioGroup">
        <RadioGroup defaultValue="b" aria-label="Plan">
          <Label>
            <RadioGroupItem value="a" /> Starter
          </Label>
          <Label>
            <RadioGroupItem value="b" /> Team
          </Label>
          <Label>
            <RadioGroupItem value="c" disabled /> Disabled
          </Label>
          <Label>
            <RadioGroupItem value="d" aria-invalid /> Invalid
          </Label>
        </RadioGroup>
      </Cell>
      <Cell name="Switch">
        <div className="grid gap-2">
          <Label>
            <Switch /> Off
          </Label>
          <Label>
            <Switch defaultChecked /> On
          </Label>
          <Label>
            <Switch disabled /> Disabled
          </Label>
          <Label>
            <Switch disabled defaultChecked /> Disabled on
          </Label>
        </div>
      </Cell>
      <Cell name="Slider">
        <div className="grid w-56 gap-3">
          <Slider value={slider} onValueChange={setSlider} aria-label="Strength" />
          <Slider value={70} onValueChange={() => undefined} disabled aria-label="Disabled" />
        </div>
      </Cell>
      <Cell name="CheckboxCard">
        <CheckboxCardGroup label="Notifications" description="Pick what reaches you.">
          <CheckboxCard title="Mentions" description="When someone @mentions you." defaultChecked />
          <CheckboxCard title="Digest" description="A summary every morning." />
          <CheckboxCard title="Everything" description="Every event, as it happens." disabled />
        </CheckboxCardGroup>
      </Cell>
      <Cell name="Field">
        <div className="grid w-64 gap-4">
          <Field>
            <FieldHeader>
              <FieldLabel htmlFor="mx-name">Agent name</FieldLabel>
              <FieldHint>Optional</FieldHint>
            </FieldHeader>
            <Input id="mx-name" defaultValue="release-captain" />
            <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="mx-url">Ollama URL</FieldLabel>
            <Input id="mx-url" defaultValue="http://localhost:11343" aria-invalid />
            <FieldError>Nothing answered on port 11343.</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="mx-model">Model</FieldLabel>
            <ModelSelect />
          </Field>
        </div>
      </Cell>
      <Cell name="Field/recipe" wide>
        <FieldSet
          legend="Pickup"
          description="Where and when the driver loads."
          className="w-full max-w-2xl"
        >
          <FieldGrid columns={3}>
            <Field label="Site" description="The shipper's yard or terminal.">
              <Input defaultValue="Phillips 66, Kansas City" />
            </Field>
            <Field label="Gallons" required error="Enter a whole number.">
              <NumberInput suffix="gal" defaultValue="7,500" width="full" />
            </Field>
            <Field label="Rate" optional hint="per mile">
              <NumberInput prefix="$" decimal defaultValue="4.25" width="full" />
            </Field>
            <Field label="Product">
              <NativeSelect defaultValue="diesel">
                <option value="diesel">Dyed diesel</option>
                <option value="gas">Gasoline</option>
              </NativeSelect>
            </Field>
            <Field label="Window" group>
              <div className="flex w-full items-center gap-2">
                <Input aria-label="From" defaultValue="08:00" width="full" />
                <span className="text-sm text-muted-foreground">to</span>
                <Input aria-label="To" defaultValue="11:00" width="full" />
              </div>
            </Field>
            <Field label="Model" description="Chosen from the kit Select.">
              <ModelSelect />
            </Field>
          </FieldGrid>
          <FormActions start={<Button variant="ghost">Cancel</Button>}>
            <Button variant="outline">Save draft</Button>
            <Button>Book load</Button>
          </FormActions>
        </FieldSet>
      </Cell>
      <Cell name="Field/widths" wide>
        <div className="flex w-full max-w-2xl flex-wrap items-end gap-3">
          <Input aria-label="xs" placeholder="xs" width="xs" />
          <Input aria-label="sm" placeholder="sm" width="sm" />
          <Input aria-label="md" placeholder="md" width="md" />
          <Input aria-label="lg" placeholder="lg" width="lg" />
          <SearchInput aria-label="Search loads" placeholder="Search loads" width="md" />
        </div>
      </Cell>
      <Cell name="NumberInput">
        <div className="grid gap-2">
          <NumberInput prefix="$" decimal defaultValue="1,250.00" aria-label="Amount" />
          <NumberInput suffix="min" defaultValue="45" width="xs" aria-label="Minutes" />
          <NumberInput suffix="%" defaultValue="12" width="xs" disabled aria-label="Disabled" />
          <NumberInput suffix="gal" defaultValue="abc" aria-invalid aria-label="Invalid" />
        </div>
      </Cell>
      <Cell name="NativeSelect">
        <div className="grid w-56 gap-2">
          <NativeSelect defaultValue="b" aria-label="Plan">
            <option value="a">Starter</option>
            <option value="b">Team</option>
          </NativeSelect>
          <NativeSelect disabled aria-label="Disabled plan">
            <option>Disabled</option>
          </NativeSelect>
          <NativeSelect aria-invalid aria-label="Invalid plan">
            <option>Invalid</option>
          </NativeSelect>
        </div>
      </Cell>
      <Cell name="CheckboxRow+RadioCard">
        <div className="grid w-64 gap-2">
          <CheckboxRow label="Send me a copy" description="One email per booking." defaultChecked />
          <CheckboxRow label="Disabled row" disabled />
          <RadioGroup defaultValue="b" aria-label="Plan cards" className="gap-2">
            <RadioCard value="a" title="Starter" description="Up to 5 loads a week." />
            <RadioCard value="b" title="Team" description="Unlimited loads, 3 seats." />
            <RadioCard value="c" title="Disabled" description="Not available." disabled />
          </RadioGroup>
        </div>
      </Cell>
      <Cell name="SwitchRow">
        <div className="grid w-72 gap-3">
          <SwitchList bordered>
            <SwitchRow
              inset
              label="ETA moves"
              description="When a truck runs late."
              defaultChecked
              before={
                <NumberInput suffix="min" defaultValue="15" width="xs" aria-label="Minutes late" />
              }
            />
            <SwitchRow
              inset
              label="Detention starts"
              badge={<Badge variant="brand">Always on</Badge>}
              defaultChecked
              disabled
            />
            <SwitchRow inset label="Quiet hours" description="No pushes overnight." />
          </SwitchList>
          <div className="flex flex-wrap gap-4">
            <InlineSwitch label="Only mine" defaultChecked />
            <InlineSwitch label="Late" />
            <InlineSwitch label="Disabled" disabled />
          </div>
        </div>
      </Cell>
      <Cell name="ErrorSummary" wide>
        <div className="w-full max-w-md">
          <ErrorSummary
            errors={[
              { id: 'mx-url', message: 'Ollama URL: nothing answered on port 11343.' },
              { id: 'mx-name', message: 'Agent name: lowercase letters, numbers and dashes only.' },
            ]}
          />
        </div>
      </Cell>
    </Section>
  );
}

const tree = [
  {
    id: 'src',
    label: 'src',
    icon: <Folder />,
    children: [
      { id: 'src/button.tsx', label: 'button.tsx', icon: <FileCode /> },
      { id: 'src/tree.tsx', label: 'tree.tsx', icon: <FileCode />, meta: 'M' },
    ],
  },
  { id: 'test', label: 'test', icon: <Folder />, hasChildren: true },
  { id: 'README.md', label: 'README.md', icon: <FileCode /> },
];

function Navigation({ open, density }: { open: string | null; density?: 'compact' }) {
  const [tab, setTab] = React.useState('changes');
  const [page, setPage] = React.useState(3);
  const [size, setSize] = React.useState(25);
  return (
    <Section id="navigation" title="Navigation">
      <Cell name="Tabs">
        <Tabs value={tab} onValueChange={setTab} className="w-64">
          <TabsList>
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="off" disabled>
              Off
            </TabsTrigger>
          </TabsList>
          <TabsContent value="changes" className="text-sm text-muted-foreground">
            3 files changed.
          </TabsContent>
          <TabsContent value="history" className="text-sm text-muted-foreground">
            Last commit 12 minutes ago.
          </TabsContent>
        </Tabs>
      </Cell>
      <Cell name="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#navigation">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#navigation">Agents</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>release-captain</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Cell>
      <Cell name="Pagination" wide>
        <div className="grid w-full max-w-2xl gap-4">
          <Pagination
            page={page}
            pageCount={13}
            onPageChange={setPage}
            total={312}
            pageSize={size}
            onPageSizeChange={setSize}
          />
          <Pagination
            page={1}
            pageCount={1}
            onPageChange={() => undefined}
            total={7}
            pageSize={25}
          />
          <Pagination page={0} pageCount={0} onPageChange={() => undefined} />
        </div>
      </Cell>
      <Cell name="Steps" wide>
        <div className="grid w-full max-w-2xl gap-6">
          <Steps
            current={1}
            items={[
              { title: 'Connect', description: 'Sign in to the provider.' },
              { title: 'Choose a model', description: 'Local or cloud.' },
              { title: 'Test', description: 'Send a first message.' },
              { title: 'Done' },
            ]}
          />
          <Steps
            current={4}
            items={[{ title: 'Connect' }, { title: 'Model' }, { title: 'Test' }, { title: 'Done' }]}
          />
          <Steps
            orientation="vertical"
            current={1}
            items={[
              { title: 'Connect', description: 'Sign in to the provider.' },
              { title: 'Choose a model' },
              { title: 'Test' },
            ]}
          />
        </div>
      </Cell>
      <Cell name="NavigationMenu" wide>
        <NavigationMenu defaultValue={open === 'navigation-menu' ? 'products' : undefined}>
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-72 gap-1">
                  <li>
                    <NavigationMenuLink href="#navigation">
                      <span className="font-medium">Bandit Stealth</span>
                      <span className="text-xs text-muted-foreground">
                        The agent IDE that stays on your machine.
                      </span>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#navigation" active>
                      <span className="font-medium">Sentinel</span>
                      <span className="text-xs text-muted-foreground">Repository audits.</span>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#navigation" className={navigationMenuTriggerStyle}>
                Docs
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Cell>
      <Cell name="Menubar">
        <Menubar defaultValue={open === 'menubar' ? 'file' : undefined}>
          <MenubarMenu value="file">
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New file <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Open…</MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>Save</MenubarItem>
              <MenubarItem variant="destructive">
                <Trash /> Delete
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu value="edit">
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu value="view">
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Zoom in</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Cell>
      <Cell name="Toolbar" wide>
        <Toolbar aria-label="List tools" className="w-full max-w-2xl">
          <ToolbarGroup>
            <Input type="search" placeholder="Search" aria-label="Search" className="h-8 w-48" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <Button variant="ghost" size="sm">
              Filter
            </Button>
            <ModelSelect size="sm" />
          </ToolbarGroup>
          <ToolbarSpacer />
          <Button size="sm">
            <Plus /> New
          </Button>
        </Toolbar>
      </Cell>
      <Cell name="MobileNav" wide>
        <div className="w-full max-w-md overflow-hidden rounded-lg border">
          <MobileNav
            value="inbox"
            items={[
              { id: 'home', label: 'Home', icon: <Home /> },
              { id: 'inbox', label: 'Inbox', icon: <Inbox />, badge: 3 },
              { id: 'chat', label: 'Chat', icon: <MessageSquare />, badge: true },
              { id: 'settings', label: 'Settings', icon: <Settings />, href: '#navigation' },
            ]}
          />
        </div>
      </Cell>
      <Cell name="EditorTabs" wide>
        <div className="w-full max-w-2xl overflow-hidden rounded-lg border">
          <EditorTabs
            aria-label="Open editors"
            tabs={[
              { id: 'a', label: 'app.tsx', icon: <FileCode /> },
              { id: 'b', label: 'tree.tsx', icon: <FileCode />, dirty: true },
              { id: 'c', label: 'README.md', preview: true },
              { id: 'd', label: 'pinned.ts', closeable: false },
            ]}
            activeId="a"
            onActiveChange={() => undefined}
            onClose={() => undefined}
            actions={
              <IconButton label="More" size="icon-sm" variant="ghost">
                <MoreHorizontal />
              </IconButton>
            }
          />
        </div>
      </Cell>
      <Cell name="TreeView">
        <TreeView
          aria-label="Files"
          className="w-56 rounded-lg border bg-surface px-1"
          nodes={tree}
          expanded={['src']}
          onExpandedChange={() => undefined}
          selected={['src/tree.tsx']}
          onSelectedChange={() => undefined}
          density={density === 'compact' ? 'compact' : 'default'}
        />
      </Cell>
    </Section>
  );
}

function Surfaces({ density }: { density?: 'compact' }) {
  const cardDensity = density === 'compact' ? 'compact' : 'default';
  return (
    <Section id="surfaces" title="Surfaces and feedback">
      {CARD_VARIANTS.map((variant) => (
        <Cell key={variant} name={`Card/${variant}`}>
          <Card variant={variant} density={cardDensity} className="w-full max-w-xs">
            <CardHeader>
              <CardEyebrow>Sentinel</CardEyebrow>
              <CardTitle>Nightly audit</CardTitle>
              <CardDescription>14 repositories, 82% history scanned.</CardDescription>
              <CardAction>
                <Badge variant="success">Passing</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="text-sm">
              <Progress value={82} aria-label="History scanned" />
            </CardContent>
            <CardFooter>
              <Button size="sm" variant={variant === 'terminal' ? 'secondary' : 'default'}>
                View report
              </Button>
              <Button size="sm" variant="ghost">
                Re-run
              </Button>
            </CardFooter>
          </Card>
        </Cell>
      ))}
      <Cell name="Card/densities" wide>
        <div className="flex w-full flex-wrap gap-3">
          {(['compact', 'default', 'roomy'] as const).map((d) => (
            <Card key={d} density={d} className="w-56">
              <CardHeader>
                <CardTitle>{d}</CardTitle>
                <CardDescription>Header, content, footer.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">Body text.</CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Action
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Cell>
      {ALERT_VARIANTS.map((variant) => (
        <Cell key={variant} name={`Alert/${variant}`}>
          <Alert variant={variant} className="max-w-sm">
            <AlertCircle />
            <AlertTitle>Something to know</AlertTitle>
            <AlertDescription>A sentence that explains it and what to do next.</AlertDescription>
          </Alert>
          <Alert variant={variant} className="max-w-sm">
            <AlertTitle>No icon</AlertTitle>
            <AlertDescription>Single-column layout.</AlertDescription>
          </Alert>
        </Cell>
      ))}
      <Cell name="Toast" wide>
        <ToastProvider>
          <ToastViewport className="static w-full max-w-sm flex-col p-0" />
          <Toast open variant="default" duration={Infinity}>
            <ToastTitle>Saved</ToastTitle>
            <ToastDescription>All changes are stored.</ToastDescription>
            <ToastClose />
          </Toast>
          <Toast open variant="success" duration={Infinity}>
            <ToastTitle>Message sent</ToastTitle>
            <ToastAction altText="Undo sending">Undo</ToastAction>
            <ToastClose />
          </Toast>
          <Toast open variant="destructive" duration={Infinity}>
            <ToastTitle>Copy blocked by the browser</ToastTitle>
            <ToastDescription>Select the text and copy it by hand.</ToastDescription>
            <ToastClose />
          </Toast>
        </ToastProvider>
      </Cell>
      <Cell name="EmptyState" wide>
        <EmptyState className="w-full max-w-md">
          <EmptyStateIcon>
            <Inbox />
          </EmptyStateIcon>
          <EmptyStateTitle>No runs yet</EmptyStateTitle>
          <EmptyStateDescription>
            Runs appear here once an agent has done some work. Start one from the command bar.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button size="sm">
              <Plus /> New run
            </Button>
            <Button size="sm" variant="ghost">
              Learn more
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </Cell>
      <Cell name="PageHeader" wide>
        <PageHeader className="w-full">
          <PageHeaderMain>
            <PageHeaderEyebrow>Workspace</PageHeaderEyebrow>
            <PageHeaderTitle>Agents</PageHeaderTitle>
            <PageHeaderDescription>
              Everything that runs on your behalf, with its permissions and history.
            </PageHeaderDescription>
          </PageHeaderMain>
          <PageHeaderActions>
            <Button variant="outline">Import</Button>
            <Button>
              <Plus /> New agent
            </Button>
          </PageHeaderActions>
        </PageHeader>
      </Cell>
      <Cell name="StatCard" wide>
        <div className="grid w-full gap-3 sm:grid-cols-3">
          <StatCard label="Runs today" value="1,284" detail="+12% vs yesterday" icon={<Zap />} />
          <StatCard
            label="Failures"
            value="3"
            trend={<span className="text-destructive">2 more than yesterday</span>}
          />
          <StatCard label="Median time" value="2m 14s" />
        </div>
      </Cell>
      <Cell name="StatStrip" wide>
        <StatStrip
          className="w-full max-w-md"
          stats={[
            { label: 'Runs today', value: '1,284', detail: '+12%', href: '#surfaces' },
            { label: 'Failures', value: '3', detail: '2 more', onSelect: () => undefined },
            { label: 'Median', value: '2m 14s' },
          ]}
        />
      </Cell>
      <Cell name="OnboardingChecklist">
        <OnboardingChecklist
          className="w-full max-w-sm"
          title="Get set up"
          description="Three things before your first run."
          items={[
            { id: 'a', title: 'Open a repository', done: true },
            {
              id: 'b',
              title: 'Connect a model',
              description: 'Local Ollama or a cloud key.',
              done: false,
              action: (
                <Button size="xs" variant="outline">
                  Connect
                </Button>
              ),
            },
            { id: 'c', title: 'Ask a question', done: false },
          ]}
          onDismiss={() => undefined}
        />
      </Cell>
      <Cell name="Accordion">
        <Accordion type="single" collapsible defaultValue="a" className="w-64">
          <AccordionItem value="a">
            <AccordionTrigger>What runs locally?</AccordionTrigger>
            <AccordionContent>Everything, unless you add a cloud provider.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Can I bring my own model?</AccordionTrigger>
            <AccordionContent>Yes, any Ollama or OpenAI-compatible endpoint.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c" disabled>
            <AccordionTrigger>Disabled item</AccordionTrigger>
            <AccordionContent>Hidden.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Cell>
      <Cell name="Collapsible">
        <Collapsible defaultOpen className="w-64">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Advanced options
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="grid gap-2 p-2 text-sm text-muted-foreground">
            <span>Timeout: 30s</span>
            <span>Retries: 2</span>
          </CollapsibleContent>
        </Collapsible>
      </Cell>
      <Cell name="ScrollArea">
        <ScrollArea className="h-32 w-56 rounded-md border p-3 text-sm">
          {Array.from({ length: 16 }, (_, i) => (
            <p key={i} className="py-0.5">
              Line {i + 1} of a long list that scrolls.
            </p>
          ))}
        </ScrollArea>
      </Cell>
      <Cell name="Resizable" wide>
        <div className="h-40 w-full max-w-2xl overflow-hidden rounded-lg border bg-surface">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel id="mx-explorer" defaultSize="30%" minSize="15%">
              <div className="p-3 text-[13px] text-muted-foreground">Explorer</div>
            </ResizablePanel>
            <ResizeHandle aria-label="Resize explorer" withHandle />
            <ResizablePanel id="mx-main" minSize="30%">
              <div className="p-3 text-[13px] text-muted-foreground">Editor</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </Cell>
      <Cell name="AppShell" wide>
        <AppShell className="min-h-0 w-full max-w-2xl overflow-hidden rounded-lg border">
          <AppShellHeader>
            <span className="text-sm font-semibold">Product</span>
          </AppShellHeader>
          <AppShellBody className="grid-cols-[10rem_1fr]">
            <AppShellSidebar className="p-3 text-sm text-muted-foreground">Sidebar</AppShellSidebar>
            <AppShellMain>
              <AppShellContent className="text-sm">Content</AppShellContent>
            </AppShellMain>
          </AppShellBody>
        </AppShell>
      </Cell>
    </Section>
  );
}

interface Member {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Invited' | 'Suspended';
  role: string;
  runs: number;
}
const members: Member[] = Array.from({ length: 6 }, (_, i) => ({
  id: `u${i}`,
  name: [
    'Ada Lovelace',
    'Grace Hopper',
    'Alan Turing',
    'Katherine Johnson',
    'Edsger Dijkstra',
    'Barbara Liskov',
  ][i]!,
  email: `person${i}@example.com`,
  status: (['Active', 'Invited', 'Suspended'] as const)[i % 3]!,
  role: i === 0 ? 'Owner' : 'Member',
  runs: (i * 97 + 31) % 450,
}));
const statusVariant = { Active: 'success', Invited: 'info', Suspended: 'warning' } as const;
const memberColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', sortable: true, cell: (m) => m.name, card: 'title' },
  {
    id: 'email',
    header: 'Email',
    cell: (m) => <span className="text-muted-foreground">{m.email}</span>,
    card: 'subtitle',
    hideBelow: 'lg',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (m) => <Badge variant={statusVariant[m.status]}>{m.status}</Badge>,
    card: 'aside',
  },
  { id: 'role', header: 'Role', cell: (m) => m.role },
  { id: 'runs', header: 'Runs', sortable: true, numeric: true, cell: (m) => m.runs },
];
const numericColumns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', cell: (m) => m.name },
  { id: 'runs', header: 'Runs', numeric: true, cell: (m) => m.runs },
  { id: 'runs2', header: 'Last week', numeric: true, cell: (m) => m.runs * 7 },
  { id: 'runs3', header: 'Last month', numeric: true, cell: (m) => m.runs * 30 },
  { id: 'runs4', header: 'This year', numeric: true, cell: (m) => m.runs * 365 },
];

function Data({ density }: { density?: 'compact' }) {
  const [sort, setSort] = React.useState<DataTableSort | null>({
    columnId: 'name',
    direction: 'asc',
  });
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState<string[]>(['u1']);
  const rows = members.filter((m) => m.name.toLowerCase().includes(filter.toLowerCase()));
  const tableDensity = density === 'compact' ? 'compact' : 'default';
  return (
    <Section id="data" title="Data">
      <Cell name="Table" wide>
        <Table className="max-w-xl" scrollLabel="Recent agent runs" density={tableDensity}>
          <TableCaption>Recent agent runs</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Run</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead numeric>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow selected>
              <TableCell className="font-mono">run-4821</TableCell>
              <TableCell>release-captain</TableCell>
              <TableCell>
                <Badge variant="success">Passed</Badge>
              </TableCell>
              <TableCell numeric>2m 14s</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono">run-4820</TableCell>
              <TableCell>dependency-bot</TableCell>
              <TableCell>
                <Badge variant="destructive">Failed</Badge>
              </TableCell>
              <TableCell numeric>41s</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell numeric>2m 55s</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Cell>
      <Cell name="Table/scrolls" wide>
        <div className="w-full max-w-sm">
          <Table scrollLabel="Wide numbers" density={tableDensity} pinFirstColumn>
            <TableHeader>
              <TableRow>
                {['Name', 'Runs', 'Last week', 'Last month', 'This year', 'All time'].map((h) => (
                  <TableHead key={h} numeric={h !== 'Name'}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.slice(0, 3).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.name}</TableCell>
                  {[1, 7, 30, 365, 3650].map((k) => (
                    <TableCell key={k} numeric>
                      {(m.runs * k).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Cell>
      <Cell name="DataTable" wide>
        <DataTable
          aria-label="Workspace members"
          columns={memberColumns}
          rows={rows}
          getRowId={(m) => m.id}
          getRowLabel={(m) => m.name}
          sort={sort}
          onSortChange={setSort}
          filter={filter}
          onFilterChange={setFilter}
          selected={selected}
          onSelectedChange={setSelected}
          onRowAction={() => undefined}
          density={tableDensity}
          rowActions={(m) => (
            <IconButton label={`Actions for ${m.name}`} variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </IconButton>
          )}
          paginate={{ pageSize: 5, pageSizeOptions: [5, 10, 25] }}
          rowNoun="members"
          toolbar={
            <Button size="sm" variant="outline">
              Export
            </Button>
          }
        />
      </Cell>
      <Cell name="DataTable/numeric" wide>
        <div className="w-full max-w-md">
          <DataTable
            aria-label="Run counts"
            columns={numericColumns}
            rows={members.slice(0, 3)}
            getRowId={(m) => m.id}
            density={tableDensity}
          />
        </div>
      </Cell>
      <Cell name="DataTable/loading" wide>
        <DataTable
          aria-label="Loading members"
          columns={memberColumns}
          rows={[]}
          getRowId={(m) => m.id}
          loading
        />
      </Cell>
      <Cell name="DataTable/empty" wide>
        <DataTable
          aria-label="No members"
          columns={memberColumns}
          rows={[]}
          getRowId={(m) => m.id}
          empty="No members match that search."
        />
      </Cell>
      <Cell name="DataTable/error" wide>
        <DataTable
          aria-label="Failed members"
          columns={memberColumns}
          rows={[]}
          getRowId={(m) => m.id}
          error="Could not load members."
          onRetry={() => undefined}
        />
      </Cell>
    </Section>
  );
}

const CONNECTION: ConnectionState[] = [
  'connected',
  'connecting',
  'reconnecting',
  'offline',
  'error',
  'unknown',
];
const SYNC: SyncState[] = ['synced', 'syncing', 'pending', 'offline', 'error', 'unknown'];
const sources = [
  {
    id: 's1',
    title: 'Fuel surcharge schedule, effective Monday',
    url: 'https://example.com/fuel',
    snippet: 'Diesel is up 6¢ in PADD 2, so the table moves to $0.41/mi.',
    meta: 'page 4',
  },
  { id: 's2', title: 'Dispatch runbook (internal)', snippet: 'Call the shipper before 6am.' },
];

function Chat() {
  const [editing, setEditing] = React.useState(true);
  return (
    <Section id="chat" title="Chat kit">
      <Cell name="Composer" wide>
        <div className="grid w-full max-w-xl gap-3">
          <Composer onSubmit={() => undefined} onAttach={() => undefined} />
          <Composer
            onSubmit={() => undefined}
            value="A message that is being written and can be sent."
            onValueChange={() => undefined}
            onAttach={() => undefined}
            attachments={
              <AttachmentTray>
                <AttachmentItem name="brief.pdf" size={182_000} state="ready" onRemove={() => 0} />
                <AttachmentItem name="photo.jpg" size={2_400_000} state="uploading" progress={40} />
              </AttachmentTray>
            }
            attachmentCount={2}
          />
          <Composer onSubmit={() => undefined} streaming onStop={() => undefined} value="" />
          <Composer onSubmit={() => undefined} disabled placeholder="Disabled" />
          <Suggestions
            items={['Summarise this thread', 'Draft a reply', 'Find the invoice']}
            onSelect={() => undefined}
          />
        </div>
      </Cell>
      <Cell name="Conversation" wide>
        <Conversation className="h-72 w-full max-w-xl rounded-lg border bg-surface">
          <Message from="system">Today</Message>
          <Message from="user" meta="9:41">
            What does the surcharge move to on Monday?
          </Message>
          <Message
            from="assistant"
            name="Assistant"
            meta="9:41"
            avatar={<Sparkles />}
            actions={
              <MessageActions
                copyText="Diesel is up 6¢"
                onRegenerate={() => undefined}
                feedback="up"
                onFeedback={() => undefined}
              />
            }
          >
            <Reasoning durationMs={3200} defaultOpen>
              Checked PADD 2 diesel against the surcharge table.
            </Reasoning>
            <Markdown>
              {
                '# Result\n\nDiesel is up **6¢** in PADD 2, so the table moves to **$0.41/mi**.\n\n- Effective Monday\n- Applies to `tank` and `dry` lanes\n\n```json\n{ "surcharge": 0.41 }\n```\n\n> Source: the schedule [PDF](https://example.com/fuel).'
              }
            </Markdown>
            <div className="mt-2 text-sm">
              Cited inline <SourceCitation index={1} source={sources[0]!} /> and again{' '}
              <SourceCitation index={2} source={sources[1]!} />.
            </div>
            <SourceList sources={sources} className="mt-3" />
          </Message>
          <Message from="assistant" name="Assistant">
            <Reasoning streaming>Working out the lane mix…</Reasoning>
            <StreamingIndicator />
          </Message>
        </Conversation>
      </Cell>
      <Cell name="MessageEditor+Attachments" wide>
        <div className="grid w-full max-w-xl gap-3">
          {editing ? (
            <MessageEditor
              defaultValue="What does the surcharge move to on Monday?"
              onSubmit={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit again
            </Button>
          )}
          <MessageAttachments
            files={[
              { name: 'brief.pdf', size: 182_000, type: 'application/pdf', href: '#chat' },
              { name: 'notes.txt', size: 1_200, type: 'text/plain' },
              {
                name: 'photo.png',
                type: 'image/png',
                href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Crect width='120' height='80' fill='%23888'/%3E%3C/svg%3E",
              },
            ]}
          />
        </div>
      </Cell>
      <Cell name="ToolCall" wide>
        <div className="grid w-full max-w-xl gap-2">
          <ToolCall name="get_load" status="pending" args={{ id: 'L-1042' }} />
          <ToolCall name="get_load" status="running" args={{ id: 'L-1042' }} />
          <ToolCall
            name="get_load"
            status="success"
            durationMs={1240}
            args={{ id: 'L-1042' }}
            result={{ id: 'L-1042', status: 'booked', stops: 3 }}
            defaultOpen
          />
          <ToolCall name="book_load" status="error" durationMs={410} error="Carrier declined." />
          <ToolApproval
            name="book_load"
            description="Approve L-1042 and send it to Gravitate."
            args={{ id: 'L-1042' }}
            onApprove={() => undefined}
            onDeny={() => undefined}
          />
          <ToolApproval name="book_load" description="Approved earlier." state="approved" />
          <ToolApproval name="book_load" description="Denied earlier." state="denied" />
        </div>
      </Cell>
      <Cell name="ConnectionStatus" wide>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1.5">
            {CONNECTION.map((s) => (
              <ConnectionStatus
                key={s}
                state={s}
                detail="ollama://localhost:11434"
                onRetry={() => undefined}
              />
            ))}
          </div>
          <div className="grid gap-1.5">
            {SYNC.map((s) => (
              <SyncStatus
                key={s}
                state={s}
                lastSynced={new Date(2026, 8, 25, 9, 41)}
                pendingCount={3}
                onRetry={() => undefined}
              />
            ))}
          </div>
        </div>
        <div className="grid w-full max-w-xl gap-2">
          <ConnectionBanner
            state="offline"
            description="Messages you send will go out when you reconnect."
            onRetry={() => undefined}
          />
          <ConnectionBanner state="error" onRetry={() => undefined} />
          <ConnectionBanner state="reconnecting" />
        </div>
      </Cell>
      <Cell name="Attachment" wide>
        <div className="grid w-full max-w-xl gap-3">
          <AttachmentTray>
            <AttachmentItem name="queued.pdf" size={1200} state="queued" onRemove={() => 0} />
            <AttachmentItem name="up.jpg" size={2_400_000} state="uploading" progress={40} />
            <AttachmentItem name="reading.docx" size={42_000} state="parsing" />
            <AttachmentItem name="ready.csv" size={8_400} state="ready" onRemove={() => 0} />
            <AttachmentItem
              name="failed.zip"
              size={90_000_000}
              state="failed"
              error="Too large (max 25 MB)."
              onRetry={() => 0}
              onRemove={() => 0}
            />
          </AttachmentTray>
          <UploadQueue
            files={[
              { id: '1', name: 'brief.pdf', size: 182_000, state: 'ready' },
              { id: '2', name: 'photo.jpg', size: 2_400_000, state: 'uploading', progress: 40 },
              { id: '3', name: 'big.zip', size: 90_000_000, state: 'failed', error: 'Too large.' },
            ]}
            onRemove={() => undefined}
            onRetry={() => undefined}
          />
        </div>
      </Cell>
      <Cell name="CodeBlock">
        <CodeBlock
          lang="ts"
          code={'export const answer = 42;\nconsole.log(answer);'}
          className="w-72"
        />
      </Cell>
      <Cell name="AudioPlayer" wide>
        <AudioPlayerDemo />
      </Cell>
      <Cell name="VoiceRecorder">
        <VoiceRecorderDemo />
      </Cell>
      <Cell name="ChatHistory">
        <ChatHistoryDemo />
      </Cell>
      <Cell name="ChatLayout" wide>
        <ChatLayoutDemo />
      </Cell>
    </Section>
  );
}

function ToasterCell({ open }: { open: string | null }) {
  React.useEffect(() => {
    if (open !== 'toaster') return;
    const closers = [
      toast({ title: 'Saved', description: 'All changes stored.', duration: 60_000 }),
      toast({ title: 'Message sent', variant: 'success', duration: 60_000 }),
      toast({
        title: 'Copy blocked by the browser',
        description: 'Select the text and copy it by hand.',
        variant: 'destructive',
        duration: 60_000,
      }),
    ];
    return () => closers.forEach((close) => close());
  }, [open]);
  return (
    <Cell name="Toaster">
      <Button
        size="sm"
        variant="outline"
        onClick={() => toast({ title: 'Saved', description: 'All changes stored.' })}
      >
        Raise a toast
      </Button>
      <Toaster />
    </Cell>
  );
}

function Overlays({ open }: { open: string | null }) {
  const [step, setStep] = React.useState(0);
  return (
    <Section id="overlays" title="Overlays">
      <Cell name="Dialog">
        <Dialog defaultOpen={open === 'dialog'}>
          <DialogTrigger asChild>
            <Button variant="outline">Rename agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename agent</DialogTitle>
              <DialogDescription>The name shows in the command bar and in logs.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="mx-dialog-name">Name</Label>
              <Input id="mx-dialog-name" defaultValue="release-captain" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog defaultOpen={open === 'dialog-sheet'}>
          <DialogTrigger asChild>
            <Button variant="outline">Invite (sheet on phones)</Button>
          </DialogTrigger>
          <DialogContent mobile="sheet">
            <DialogHeader>
              <DialogTitle>Invite people</DialogTitle>
              <DialogDescription>They get an email with a link to join.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="mx-invite">Email addresses</Label>
              <Input id="mx-invite" placeholder="ada@example.com" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button>Send invites</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Cell>
      <Cell name="AlertDialog">
        <AlertDialog defaultOpen={open === 'alert-dialog'}>
          <Button variant="destructive" asChild>
            <AlertDialogTrigger>Delete 3 keys</AlertDialogTrigger>
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete 3 keys?</AlertDialogTitle>
              <AlertDialogDescription>
                Apps using them stop working right away. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction destructive>Delete keys</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Cell>
      <Cell name="Sheet">
        <Sheet defaultOpen={open === 'sheet-right'}>
          <SheetTrigger asChild>
            <Button variant="outline">Settings sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Workspace settings</SheetTitle>
              <SheetDescription>Saved to .bandit/config.json.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-2 px-4">
              <Label htmlFor="mx-ws">Name</Label>
              <Input id="mx-ws" defaultValue="bandit-stealth" />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button>Save</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Sheet defaultOpen={open === 'sheet-bottom'}>
          <SheetTrigger asChild>
            <Button variant="outline">Bottom drawer</Button>
          </SheetTrigger>
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
      </Cell>
      <Cell name="Popover">
        <Popover defaultOpen={open === 'popover'}>
          <PopoverTrigger asChild>
            <Button variant="outline">Dimensions</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-3">
              <p className="text-sm font-semibold">Dimensions</p>
              <div className="grid grid-cols-[auto_1fr] items-center gap-2 text-sm">
                <Label htmlFor="mx-w">Width</Label>
                <Input id="mx-w" defaultValue="100%" className="h-8" />
                <Label htmlFor="mx-h">Height</Label>
                <Input id="mx-h" defaultValue="25px" className="h-8" />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </Cell>
      <Cell name="Tooltip">
        <Tooltip defaultOpen={open === 'tooltip'}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Copy">
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>
      </Cell>
      <Cell name="DropdownMenu">
        <DropdownMenu defaultOpen={open === 'dropdown-menu'} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuItem>
              <Settings /> Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>Status bar</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Activity bar</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="light">
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Link</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Cell>
      <Cell name="ContextMenu">
        <ContextMenu>
          <ContextMenuTrigger className="grid h-24 w-56 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem>
              Back <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled>Forward</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Cell>
      <Cell name="Select/open">
        <ModelSelect defaultOpen={open === 'select'} />
      </Cell>
      <Cell name="Command" wide>
        <Command className="w-full max-w-md rounded-lg border">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Search /> Search files <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings /> Settings <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem disabled>
                <Zap /> Run task (disabled)
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              <CommandItem>release-captain</CommandItem>
              <CommandItem>dependency-bot</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <CommandDialog defaultOpen={open === 'command-dialog'} title="Go to">
          <CommandInput placeholder="Search pages and actions…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
              <CommandItem>Loads</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Cell>
      <Cell name="Tour" wide>
        <div className="grid h-24 w-full max-w-xl grid-cols-3 gap-2">
          <TourAnchor id="mx-explorer-anchor">
            <div className="grid place-items-center rounded-md border bg-surface p-3 text-[13px] text-muted-foreground">
              Explorer
            </div>
          </TourAnchor>
          <TourAnchor id="mx-editor-anchor">
            <div className="grid place-items-center rounded-md border bg-surface p-3 text-[13px] text-muted-foreground">
              Editor
            </div>
          </TourAnchor>
          <TourAnchor id="mx-agent-anchor">
            <div className="grid place-items-center rounded-md border bg-surface p-3 text-[13px] text-muted-foreground">
              Agent
            </div>
          </TourAnchor>
        </div>
        <Tour
          steps={[
            {
              id: 'explorer',
              target: 'mx-explorer-anchor',
              title: 'Explorer',
              content: 'Find and open a file in the current repository.',
              side: 'bottom',
            },
            {
              id: 'editor',
              target: 'mx-editor-anchor',
              title: 'Editor',
              content: 'Move between open files.',
            },
          ]}
          open={open === 'tour'}
          step={step}
          onStepChange={setStep}
          onEnd={() => undefined}
        />
        <Spotlight
          target="mx-agent-anchor"
          open={open === 'spotlight'}
          onDismiss={() => undefined}
          title="Add a provider"
          side="bottom"
        >
          Use a local model or your own API key.
        </Spotlight>
      </Cell>
      <ToasterCell open={open} />
    </Section>
  );
}

export function Matrix() {
  const p = params();
  const section = p.get('section') as MatrixSection | null;
  const open = p.get('open');
  const density = p.get('density') === 'compact' ? 'compact' : undefined;
  const show = (s: MatrixSection) => !section || section === s;
  return (
    <main
      id="main"
      data-matrix
      data-density={density}
      className="mx-auto grid max-w-7xl gap-2 px-4 py-6 text-foreground"
    >
      <p className="font-mono text-[11px] text-muted-foreground">
        matrix · {section ?? 'all'} · {density ?? 'comfortable'}
        {open ? ` · open=${open}` : ''}
      </p>
      {show('actions') && <Actions />}
      {show('fields') && <Fields />}
      {show('navigation') && <Navigation open={open} density={density} />}
      {show('surfaces') && <Surfaces density={density} />}
      {show('data') && <Data density={density} />}
      {show('chat') && <Chat />}
      {show('overlays') && <Overlays open={open} />}
    </main>
  );
}
