import Link from "next/link";

export default function Home() {
  return (
    <div>
      <header className="hero">
        <div className="container">
          <nav className="navbar">
            <strong>Atlas</strong>
            <div className="nav-links">
              <span>Product</span>
              <span>Docs</span>
              <span>Pricing</span>
              <span>Changelog</span>
            </div>
            <div className="nav-cta">
              <Link className="button" href="/">
                Log in
              </Link>
              <Link className="button button-primary" href="/">
                Request demo
              </Link>
            </div>
          </nav>

          <div className="hero-grid">
            <div>
              <span className="hero-pill">Mintlify-style documentation</span>
              <h1>Docs that launch fast and scale to every tenant.</h1>
              <p>
                Atlas gives you a multi-tenant docs platform with MDX, OpenAPI
                references, custom domains, and instant previews — all in a
                single Vercel deployment.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/">
                  Get started
                </Link>
                <Link className="button" href="/">
                  View the platform docs
                </Link>
              </div>
            </div>
            <div className="hero-panel">
              <strong>Tenant-ready in minutes</strong>
              <p>
                Define docs in <code>docs.json</code>, push to Git, and Atlas
                handles previews, domains, and caching.
              </p>
              <pre>
                <code>{`{
  "navigation": {
    "groups": [
      {
        "group": "Getting Started",
        "pages": ["index", "quickstart"]
      }
    ]
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <h2>Built for documentation platforms.</h2>
          <p>
            Everything you need to run a Mintlify-class documentation service:
            tenant routing, custom domains, and a dashboard your team can trust.
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Multi-tenant routing</h3>
              <p>
                Resolve tenants by subdomain, custom domain, or path-based
                routes with edge middleware.
              </p>
            </div>
            <div className="feature-card">
              <h3>Custom domains</h3>
              <p>
                Provision domains via Vercel APIs and guide users through DNS
                verification.
              </p>
            </div>
            <div className="feature-card">
              <h3>OpenAPI references</h3>
              <p>Generate interactive API docs with a built-in playground.</p>
            </div>
            <div className="feature-card">
              <h3>Preview deployments</h3>
              <p>
                Use tenant-aware preview URLs to validate every change before it
                lands.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer container">
        <span>Atlas © 2025</span>
        <span>Powered by Vercel Platforms</span>
      </footer>
    </div>
  );
}
