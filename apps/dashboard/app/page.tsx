import { tenantData } from "@/lib/tenants";

export default function DashboardHome() {
  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Docs Control Center</h1>
          <p>Track tenants, domains, and previews in real time.</p>
        </div>
        <button className="dashboard-cta" type="button">
          New Tenant
        </button>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card__title">Active tenants</div>
          <div style={{ fontSize: "2rem" }}>{tenantData.length}</div>
          <div className="dashboard-card__meta">All tenants healthy</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card__title">Custom domains</div>
          <div style={{ fontSize: "2rem" }}>
            {tenantData.reduce(
              (acc, tenant) => acc + tenant.customDomains.length,
              0
            )}
          </div>
          <div className="dashboard-card__meta">1 pending verification</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card__title">Preview deployments</div>
          <div style={{ fontSize: "2rem" }}>
            {tenantData.reduce(
              (acc, tenant) => acc + tenant.previews.length,
              0
            )}
          </div>
          <div className="dashboard-card__meta">2 builds running</div>
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Recent deployments</h2>
        {tenantData.map((tenant) => (
          <div
            key={tenant.id}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <strong>{tenant.name}</strong>
              <div className="dashboard-card__meta">{tenant.updatedAt}</div>
            </div>
            <span className="status-pill status-pill--success">Live</span>
          </div>
        ))}
      </section>
    </>
  );
}
