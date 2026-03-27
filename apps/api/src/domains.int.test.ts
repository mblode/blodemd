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
process.env.PLATFORM_ROOT_DOMAIN = "neue.com";

let request: (input: string, init?: RequestInit) => Promise<Response>;
let dbModule: DbModule;

beforeAll(async () => {
  const apiModule = await import("./index.js");
  request = apiModule.app.request.bind(apiModule.app);
  dbModule = await import("@repo/db");
});

describe("domains API", () => {
  it("normalizes domain input and path prefixes", async () => {
    const projectSlug = `project-${randomUUID().slice(0, 8)}`;
    const fixture = await createProjectFixture(dbModule, { slug: projectSlug });

    const response = await request(`/projects/${fixture.projectId}/domains`, {
      body: JSON.stringify({
        hostname: "https://docs.example.com/docs",
        pathPrefix: "docs",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.domain.hostname).toBe("docs.example.com");
    expect(body.domain.pathPrefix).toBe("/docs");
    expect(body.domain.status).toBe("Pending Verification");

    await cleanupProjectFixture(dbModule, fixture);
  });

  it("rejects neue.com as a custom domain", async () => {
    const projectSlug = `project-${randomUUID().slice(0, 8)}`;
    const fixture = await createProjectFixture(dbModule, { slug: projectSlug });

    const response = await request(`/projects/${fixture.projectId}/domains`, {
      body: JSON.stringify({
        hostname: "neue.com",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);

    await cleanupProjectFixture(dbModule, fixture);
  });
});
