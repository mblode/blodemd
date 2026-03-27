import { randomUUID } from "node:crypto";

import type * as RepoDb from "@repo/db";
import { beforeAll, describe, expect, it } from "vitest";

import { cleanupProjectFixture, createProjectFixture } from "./test-helpers.js";

type DbModule = typeof RepoDb;

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/neue_docs_drizzle_test";
process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = "test";
process.env.PLATFORM_ROOT_DOMAIN = "blode.md";

let request: (input: string, init?: RequestInit) => Promise<Response>;
let dbModule: DbModule;

beforeAll(async () => {
  const apiModule = await import("./index.js");
  request = apiModule.app.request.bind(apiModule.app);
  dbModule = await import("@repo/db");
});

describe("tenants resolve", () => {
  it("resolves a subdomain to a tenant", async () => {
    const projectSlug = `project-${randomUUID().slice(0, 8)}`;
    const fixture = await createProjectFixture(dbModule, {
      description: "Test project",
      slug: projectSlug,
    });

    const response = await request(
      `/tenants/resolve?host=${projectSlug}.blode.md&path=/`
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tenant.slug).toBe(projectSlug);
    expect(body.strategy).toBe("subdomain");

    await cleanupProjectFixture(dbModule, fixture);
  });

  it("resolves a custom domain with a path prefix", async () => {
    const projectSlug = `project-${randomUUID().slice(0, 8)}`;
    const customDomain = `custom-${randomUUID().slice(0, 8)}.com`;
    const fixture = await createProjectFixture(dbModule, { slug: projectSlug });

    await dbModule.db.insert(dbModule.domains).values({
      hostname: customDomain,
      pathPrefix: "/docs",
      projectId: fixture.projectId,
    });

    const response = await request(
      `/tenants/resolve?host=${customDomain}&path=/docs/getting-started`
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.strategy).toBe("custom-domain");
    expect(body.basePath).toBe("/docs");

    await cleanupProjectFixture(dbModule, fixture);
  });
});
