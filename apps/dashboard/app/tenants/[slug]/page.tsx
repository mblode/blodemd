import { notFound } from "next/navigation";
import { CustomDomain } from "@/components/custom-domain";
import { StatusPill } from "@/components/status-pill";
import { getTenant } from "@/lib/tenants";

export default function TenantDetail({ params }: { params: { slug: string } }) {
  const tenant = getTenant(params.slug);
  if (!tenant) {
    return notFound();
  }

  const pendingDomain = tenant.domains.find(
    (domain) => domain.status.status !== "Valid Configuration"
  );

  return (
    <div className="dashboard-panel">
      <h2>{tenant.name}</h2>
      <p>{tenant.description}</p>

      <div className="dashboard-panel">
        <h3>Domains</h3>
        {tenant.domains.map((domain) => (
          <div
            key={domain.domain}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <strong>{domain.domain}</strong>
              <div className="dashboard-card__meta">
                {tenant.primaryDomain === domain.domain ? "Primary" : "Custom"}
              </div>
            </div>
            <StatusPill status={domain.status.status} />
          </div>
        ))}
      </div>

      <CustomDomain
        defaultDomain={pendingDomain?.domain}
        status={pendingDomain?.status}
      />

      <div className="dashboard-panel">
        <h3>Preview deployments</h3>
        {tenant.previews.map((preview) => (
          <div
            key={preview.url}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <strong>{preview.name}</strong>
              <div className="dashboard-card__meta">{preview.url}</div>
            </div>
            <span
              className={
                preview.status === "Ready"
                  ? "status-pill status-pill--success"
                  : "status-pill status-pill--warning"
              }
            >
              {preview.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
