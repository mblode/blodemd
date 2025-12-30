import clsx from "clsx";

export const StatusPill = ({
  status,
}: {
  status:
    | "Valid Configuration"
    | "Pending Verification"
    | "Invalid Configuration";
}) => {
  const classes = clsx("status-pill", {
    "status-pill--success": status === "Valid Configuration",
    "status-pill--warning": status === "Pending Verification",
    "status-pill--danger": status === "Invalid Configuration",
  });

  return <span className={classes}>{status}</span>;
};
