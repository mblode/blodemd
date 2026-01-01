import { Card, CardContent } from "@/components/ui/card";

export default function SettingsSectionPage() {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="space-y-2 p-6 text-muted-foreground text-sm">
        <p>Deployment defaults will appear once the pipeline is connected.</p>
        <p>Use git settings to enable automatic builds.</p>
      </CardContent>
    </Card>
  );
}
