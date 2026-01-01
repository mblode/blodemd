import { cn } from "@/lib/utils";

export const StatusPill = ({
  status,
}: {
  status:
    | "Valid Configuration"
    | "Pending Verification"
    | "Invalid Configuration";
}) => {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 font-semibold text-xs uppercase tracking-[0.2em]",
        status === "Valid Configuration" &&
          "bg-emerald-500/15 text-emerald-300",
        status === "Pending Verification" && "bg-amber-500/15 text-amber-200",
        status === "Invalid Configuration" && "bg-rose-500/15 text-rose-200"
      )}
    >
      {status}
    </span>
  );
};
