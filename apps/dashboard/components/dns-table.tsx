"use client";

import type { DomainRecord } from "@repo/models";
import { useState } from "react";

export const DnsTable = ({ records }: { records: DomainRecord[] }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!records.length) {
    return <p>No DNS records required.</p>;
  }

  return (
    <table className="dns-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Name</th>
          <th>Value</th>
          <th>TTL</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr key={`${record.type}-${record.name}-${index}`}>
            <td>{record.type}</td>
            <td>
              <code>{record.name}</code>
            </td>
            <td>
              <code>{record.value}</code>
            </td>
            <td>{record.ttl ?? "Auto"}</td>
            <td>
              <button
                className="dns-copy"
                onClick={() => handleCopy(record.value)}
                type="button"
              >
                {copied === record.value ? "Copied" : "Copy"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
