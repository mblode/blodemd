export default function RuntimeHome() {
  return (
    <div className="runtime">
      <div className="runtime-card">
        <span className="runtime-pill">Docs Runtime</span>
        <h1>Tenant docs are served by hostname.</h1>
        <p>
          This app powers customer documentation sites. Visit a tenant domain or
          open a local preview at <code>/sites/atlas</code>.
        </p>
        <div className="runtime-actions">
          <a className="runtime-link" href="/sites/atlas">
            Open Atlas docs
          </a>
          <a className="runtime-link" href="/sites/orbit">
            Open Orbit docs
          </a>
        </div>
      </div>
    </div>
  );
}
