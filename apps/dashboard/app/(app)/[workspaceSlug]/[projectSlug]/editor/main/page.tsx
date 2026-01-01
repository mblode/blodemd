import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EditorMainPage({
  params,
}: {
  params: { workspaceSlug: string; projectSlug: string };
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            {params.workspaceSlug} / {params.projectSlug}
          </p>
          <h1 className="font-semibold text-2xl">Editor</h1>
        </div>
        <Button variant="secondary">Ask agent</Button>
      </header>

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-3 p-6">
          <h2 className="font-semibold text-lg">Main editor</h2>
          <p className="text-muted-foreground text-sm">
            This is where the docs editor and preview canvas will live.
          </p>
          <div className="rounded-xl border border-border/60 border-dashed bg-background/60 p-10 text-center text-muted-foreground text-sm">
            Editor workspace placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
