import { Tabs, TabsContent, TabsList, TabsTrigger } from '@burtson-labs/ui';

export default function TabsDemo() {
  return (
    <Tabs defaultValue="changes" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="changes">Changes</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="branches">Branches</TabsTrigger>
      </TabsList>
      <TabsContent value="changes" className="text-sm text-muted-foreground">
        3 files changed, 42 insertions.
      </TabsContent>
      <TabsContent value="history" className="text-sm text-muted-foreground">
        Last commit 12 minutes ago.
      </TabsContent>
      <TabsContent value="branches" className="text-sm text-muted-foreground">
        main, local-stack, ui-scaffold
      </TabsContent>
    </Tabs>
  );
}
