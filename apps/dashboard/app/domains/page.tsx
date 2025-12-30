import { StatusPill } from "@/components/status-pill";
import { tenantData } from "@/lib/tenants";

export default function DomainsPage() {
  return (
    <div className="dashboard-panel">
      <h2>Domains</h2>
      {tenantData.flatMap((tenant) =>
        tenant.domains.map((domain) => (
          <div
            key={`${tenant.slug}-${domain.domain}`}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <strong>{domain.domain}</strong>
              <div className="dashboard-card__meta">{tenant.name}</div>
            </div>
            <StatusPill status={domain.status.status} />
          </div>
        ))
      )}
    </div>
  );
}
