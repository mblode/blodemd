"use client";

import type { DomainRecord } from "@repo/models";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const DnsTable = ({ records }: { records: DomainRecord[] }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!records.length) {
    return (
      <p className="text-muted-foreground text-sm">No DNS records required.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-[0.2em]">
          <tr>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">TTL</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {records.map((record) => (
            <tr key={`${record.type}-${record.name}-${record.value}`}>
              <td className="px-4 py-3 text-sm">{record.type}</td>
              <td className="px-4 py-3">
                <code className="rounded bg-muted/40 px-2 py-1 text-xs">
                  {record.name}
                </code>
              </td>
              <td className="px-4 py-3">
                <code className="rounded bg-muted/40 px-2 py-1 text-xs">
                  {record.value}
                </code>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {record.ttl ?? "Auto"}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  onClick={() => handleCopy(record.value)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {copied === record.value ? "Copied" : "Copy"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
