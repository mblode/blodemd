import { tenantData } from "@/lib/tenants";

export default function PreviewsPage() {
  return (
    <div className="dashboard-panel">
      <h2>Preview deployments</h2>
      {tenantData.flatMap((tenant) =>
        tenant.previews.map((preview) => (
          <div
            key={`${tenant.slug}-${preview.url}`}
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
        ))
      )}
    </div>
  );
}
