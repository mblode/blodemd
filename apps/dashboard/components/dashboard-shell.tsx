import Link from "next/link";
import { tenantData } from "@/lib/tenants";

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">Mintlify-Style Platform</div>
        <nav className="dashboard-nav">
          <Link className="dashboard-link" href="/">
            Overview
          </Link>
          <Link className="dashboard-link" href="/tenants">
            Tenants
          </Link>
          <Link className="dashboard-link" href="/domains">
            Domains
          </Link>
          <Link className="dashboard-link" href="/previews">
            Previews
          </Link>
          <Link className="dashboard-link" href="/settings">
            Settings
          </Link>
        </nav>
        <div>
          <div className="dashboard-section">Active tenants</div>
          <div className="dashboard-tenant-list">
            {tenantData.map((tenant) => (
              <Link
                className="dashboard-link"
                href={`/tenants/${tenant.slug}`}
                key={tenant.slug}
              >
                {tenant.name}
              </Link>
            ))}
          </div>
        </div>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
};
