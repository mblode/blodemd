"use client";

import type { DomainStatus } from "@repo/models";
import { useState } from "react";
import { DnsTable } from "./dns-table";
import { StatusPill } from "./status-pill";

export const CustomDomain = ({
  defaultDomain,
  status,
}: {
  defaultDomain?: string;
  status?: DomainStatus;
}) => {
  const [domain, setDomain] = useState(defaultDomain ?? "");
  const [currentStatus, setCurrentStatus] = useState<DomainStatus | undefined>(
    status
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentStatus(
      currentStatus ?? {
        status: "Pending Verification",
        dnsRecords: [
          {
            type: "TXT",
            name: `_vercel.${domain}`,
            value: "vc-domain-verify=example",
          },
        ],
      }
    );
  };

  return (
    <div className="dashboard-panel">
      <h2>Custom domain</h2>
      <form className="domain-form" onSubmit={handleSubmit}>
        <input
          onChange={(event) => setDomain(event.target.value)}
          placeholder="docs.example.com"
          value={domain}
        />
        <button type="submit">Add domain</button>
      </form>
      {currentStatus ? (
        <div className="dashboard-panel">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{domain}</strong>
            <StatusPill status={currentStatus.status} />
          </div>
          <DnsTable records={currentStatus.dnsRecords} />
        </div>
      ) : null}
    </div>
  );
};
