import Link from "next/link";
import { tenantData } from "@/lib/tenants";

export default function TenantsPage() {
  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Tenants</h1>
          <p>Each tenant is isolated by domain and configuration.</p>
        </div>
      </header>
      <div className="dashboard-grid">
        {tenantData.map((tenant) => (
          <Link
            className="dashboard-card"
            href={`/tenants/${tenant.slug}`}
            key={tenant.slug}
          >
            <div className="dashboard-card__title">{tenant.name}</div>
            <div className="dashboard-card__meta">{tenant.description}</div>
            <div className="dashboard-card__meta">{tenant.primaryDomain}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
