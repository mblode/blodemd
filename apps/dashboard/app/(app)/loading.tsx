export default function Loading() {
  const statPlaceholders = ["stat-1", "stat-2", "stat-3"];
  const activityPlaceholders = ["activity-1", "activity-2", "activity-3"];

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-full bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-6">
            <div className="h-5 w-40 animate-pulse rounded-full bg-muted" />
            <div className="grid gap-3 sm:grid-cols-3">
              {statPlaceholders.map((item) => (
                <div
                  className="h-20 animate-pulse rounded-lg bg-muted"
                  key={item}
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/70 p-6">
            <div className="h-5 w-48 animate-pulse rounded-full bg-muted" />
            <div className="mt-6 space-y-3">
              {activityPlaceholders.map((item) => (
                <div
                  className="h-12 animate-pulse rounded-lg bg-muted"
                  key={item}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
