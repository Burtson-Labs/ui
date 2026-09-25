import { ResizablePanel, ResizablePanelGroup, ResizeHandle } from '@burtson-labs/ui';

const pane = 'flex h-full items-center justify-center p-3 text-[13px] text-muted-foreground';

export default function ResizableDemo() {
  return (
    <div className="h-72 w-full max-w-2xl overflow-hidden rounded-lg border bg-surface">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="explorer" defaultSize="28%" minSize="15%" maxSize="45%" collapsible>
          <div className={pane}>Explorer</div>
        </ResizablePanel>
        <ResizeHandle aria-label="Resize explorer" />
        <ResizablePanel id="main" minSize="30%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel id="editor" defaultSize="65%" minSize="20%">
              <div className={pane}>Editor</div>
            </ResizablePanel>
            <ResizeHandle aria-label="Resize terminal" withHandle />
            <ResizablePanel id="terminal" minSize="15%" collapsible>
              <div className="flex h-full items-center justify-center bg-code p-3 font-mono text-[13px] text-code-foreground/80">
                Terminal
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
