import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const SettingsPlaceholder = ({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) => {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {actionLabel ? (
          <Button type="button" variant="secondary">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};
