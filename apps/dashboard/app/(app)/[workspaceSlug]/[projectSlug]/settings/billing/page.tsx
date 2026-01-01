import { Card, CardContent } from "@/components/ui/card";

export default function SettingsSectionPage() {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="space-y-2 p-6 text-muted-foreground text-sm">
        <p>Billing is managed at the workspace level.</p>
        <p>Switch to workspace settings to update plan details.</p>
      </CardContent>
    </Card>
  );
}
