interface ProofStat {
  href?: string;
  label: string;
  value: number | null;
}

interface ProofStatsProps {
  stats: ProofStat[];
}

const formatter = new Intl.NumberFormat("en-AU");

/**
 * Local mirror of `@blode/proof-stats`. Values come from live server fetches;
 * a `null` value is hidden, and the strip renders nothing when all are null.
 */
export const ProofStats = ({ stats }: ProofStatsProps) => {
  const visible = stats.filter(
    (stat): stat is ProofStat & { value: number } => stat.value !== null
  );
  if (visible.length === 0) {
    return null;
  }
  return (
    <dl className="flex flex-wrap justify-center gap-x-16 gap-y-8 text-center">
      {visible.map((stat) => (
        <div className="flex flex-col-reverse gap-1" key={stat.label}>
          <dt className="text-muted-foreground text-sm">
            {stat.href ? (
              <a
                className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                href={stat.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {stat.label}
              </a>
            ) : (
              stat.label
            )}
          </dt>
          <dd className="font-semibold text-4xl tabular-nums md:text-5xl">
            {formatter.format(stat.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
};
