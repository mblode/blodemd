import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-semibold text-2xl">Platform settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure billing, authentication providers, and deployment defaults.
        </p>
      </header>
      <Card className="border-border/60 bg-card/70">
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Settings panels will be wired once the API layer is online.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
