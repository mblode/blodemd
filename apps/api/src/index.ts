// oxlint-disable oxc/no-async-endpoint-handlers, eslint/complexity
import { Buffer } from "node:buffer";

import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import type {
  DomainVerification,
  Tenant,
  TenantResolution,
} from "@repo/contracts";
import {
  ApiKeyCreateSchema,
  DomainCreateSchema,
  ProjectUpdateSchema,
  PublishDeploymentCreateSchema,
  PublishDeploymentFileSchema,
  PublishDeploymentFinalizeSchema,
} from "@repo/contracts";
import {
  ApiKeyDao,
  DeploymentDao,
  DomainDao,
  mapDomainStatusFromContract,
  ProjectDao,
} from "@repo/db";
import type { Context } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

import { authenticateApiKey, createApiKeyToken } from "./lib/api-key-auth.js";
import {
  finalizeDeploymentManifest,
  uploadDeploymentFile,
} from "./lib/publish.js";
import { revalidateProject } from "./lib/revalidate.js";
import {
  addProjectDomain,
  deleteDomain,
  getProjectDomain,
  isVercelEnabled,
  removeProjectDomain,
  verifyProjectDomain,
} from "./lib/vercel.js";
import type { VercelProjectDomain } from "./lib/vercel.js";
import {
  mapApiKey,
  mapDeployment,
  mapDomain,
  mapProject,
} from "./mappers/records.js";

// Regex patterns for string normalization
const PORT_REGEX = /:\d+$/;
const PROTOCOL_REGEX = /^https?:\/\//;
const TRAILING_SLASHES_REGEX = /\/+$/;
const LEADING_SLASHES_REGEX = /^\/+/;
const BACKSLASH_TO_SLASH_REGEX = /\\/g;

const domainCreateBodySchema = DomainCreateSchema.omit({ projectId: true });
const apiKeyCreateBodySchema = ApiKeyCreateSchema.omit({ projectId: true });
const projectIdParamsSchema = z.object({ projectId: z.string().uuid() });
const slugParamsSchema = z.object({ slug: z.string().min(1) });
const domainParamsSchema = projectIdParamsSchema.extend({
  domainId: z.string().uuid(),
});
const deploymentParamsSchema = projectIdParamsSchema.extend({
  deploymentId: z.string().uuid(),
});
const slugDeploymentParamsSchema = slugParamsSchema.extend({
  deploymentId: z.string().uuid(),
});
const tenantResolveQuerySchema = z.object({
  host: z.string().min(1),
  path: z.string().optional(),
});

const validateJson = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid request body.",
          issues: result.error.issues,
        },
        400
      );
    }
  });

const validateParams = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  zValidator("param", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid route parameters.",
          issues: result.error.issues,
        },
        400
      );
    }
  });

const validateQuery = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid query parameters.",
          issues: result.error.issues,
        },
        400
      );
    }
  });

const badGateway = (c: Context, message: string) => c.text(message, 502);
const badRequest = (c: Context, message: string) => c.text(message, 400);
const notFound = (c: Context) => c.text("Not Found", 404);
const noContent = () => new Response(null, { status: 204 });
const unauthorized = (c: Context, message: string) => c.text(message, 401);

const logError = (message: string, error: unknown) => {
  console.error(message, error);
};

const logWarn = (message: string, error: unknown) => {
  console.warn(message, error);
};

const getHeadersRecord = (c: Context): Record<string, string> =>
  Object.fromEntries(c.req.raw.headers.entries());

const projectDao = new ProjectDao();
const domainDao = new DomainDao();
const deploymentDao = new DeploymentDao();
const apiKeyDao = new ApiKeyDao();

const rootDomain = process.env.PLATFORM_ROOT_DOMAIN ?? "blode.md";
const autoWwwRedirect = process.env.VERCEL_AUTO_WWW_REDIRECT === "true";
const preferCustomDomain = process.env.PREFER_CUSTOM_DOMAIN === "true";

const domainRecordTypes = new Set([
  "A",
  "AAAA",
  "CNAME",
  "TXT",
  "MX",
  "NS",
  "CAA",
]);

const toDomainStatus = (verified: boolean) =>
  mapDomainStatusFromContract(
    verified ? "Valid Configuration" : "Pending Verification"
  );

type VerificationRecord = NonNullable<
  VercelProjectDomain["verification"]
>[number];

const mapVerification = (domain: VercelProjectDomain | null) => {
  if (!domain) {
    return;
  }
  const records =
    domain.verification?.map((record: VerificationRecord) => ({
      name: record.domain,
      type: (domainRecordTypes.has(record.type) ? record.type : "TXT") as
        | "A"
        | "AAAA"
        | "CNAME"
        | "TXT"
        | "MX"
        | "NS"
        | "CAA",
      value: record.value,
    })) ?? [];

  return {
    records,
    verified: Boolean(domain.verified),
  };
};

const normalizeHost = (host: string) =>
  host.replace(PORT_REGEX, "").toLowerCase();

const normalizeHostnameInput = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(PROTOCOL_REGEX, "");
  const withoutPath = withoutProtocol.split("/")[0] ?? "";
  return normalizeHost(withoutPath);
};

const normalizePathPrefix = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(TRAILING_SLASHES_REGEX, "");
};

const slugifyPath = (value: string) => {
  const trimmed = value
    .replace(BACKSLASH_TO_SLASH_REGEX, "/")
    .replace(TRAILING_SLASHES_REGEX, "");
  return trimmed.replace(LEADING_SLASHES_REGEX, "");
};

const stripPrefix = (pathname: string, prefix: string | null) => {
  if (!prefix) {
    return slugifyPath(pathname);
  }
  const normalizedPath = slugifyPath(pathname);
  const normalizedPrefix = slugifyPath(prefix);
  if (!normalizedPrefix) {
    return normalizedPath;
  }
  if (normalizedPath === normalizedPrefix) {
    return "";
  }
  if (normalizedPath.startsWith(`${normalizedPrefix}/`)) {
    return normalizedPath.slice(normalizedPrefix.length + 1);
  }
  return normalizedPath;
};

const isPresent = <T>(value: T | null): value is T => value !== null;

const buildTenant = async (projectId: string): Promise<Tenant | null> => {
  const project = await projectDao.getById(projectId);
  if (!project) {
    return null;
  }

  const domains = await domainDao.listByProject(projectId);
  const deployment = await deploymentDao.getLatestPromotedByProject(projectId);
  const customDomains = domains.map((domain) => domain.hostname);
  const preferredCustomDomain =
    domains.find(
      (domain) =>
        domain.status === mapDomainStatusFromContract("Valid Configuration")
    ) ??
    domains[0] ??
    null;
  const primaryDomain =
    preferCustomDomain && preferredCustomDomain
      ? preferredCustomDomain.hostname
      : `${project.slug}.${rootDomain}`;

  return {
    activeDeploymentId: deployment?.manifestUrl ? deployment.id : undefined,
    activeDeploymentManifestUrl: deployment?.manifestUrl ?? undefined,
    customDomains,
    description: project.description ?? undefined,
    id: project.id,
    name: project.name,
    pathPrefix:
      domains.find((domain) => domain.pathPrefix)?.pathPrefix ?? undefined,
    primaryDomain,
    slug: project.slug,
    status: "active",
    subdomain: project.slug,
  };
};

const buildTenantResolution = (
  tenant: Tenant,
  strategy: TenantResolution["strategy"],
  host: string,
  basePath: string,
  rewrittenPath: string
): TenantResolution => ({
  basePath,
  host,
  rewrittenPath,
  strategy,
  tenant,
});

export const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    credentials: true,
    origin: (origin) => origin || "*",
  })
);

// oxlint-disable-next-line eslint-plugin-promise/prefer-await-to-callbacks
app.onError((error, c) => {
  logError("Unhandled API error", error);
  return c.text("Internal Server Error", 500);
});

app.notFound((c) => notFound(c));

app.get("/health", (c) =>
  c.json(
    {
      ok: true as const,
      timestamp: new Date().toISOString(),
    },
    200
  )
);

app.get("/tenants", async (c) => {
  const projects = await projectDao.list();
  const tenants = await Promise.all(
    projects.map((project) => buildTenant(project.id))
  );
  return c.json(tenants.filter(isPresent), 200);
});

app.get(
  "/tenants/resolve",
  validateQuery(tenantResolveQuerySchema),
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor this handler by extracting resolution strategies into separate functions
  async (c) => {
    const query = c.req.valid("query");
    const host = normalizeHost(query.host);
    const pathname = query.path ?? "/";

    const previewPrefix = host.includes("---") ? host.split("---")[0] : null;
    if (previewPrefix) {
      const project = await projectDao.getBySlugUnique(previewPrefix);
      if (project) {
        const tenant = await buildTenant(project.id);
        if (!tenant) {
          return notFound(c);
        }
        const slugPath = slugifyPath(pathname);
        const rewrittenPath = slugPath
          ? `/sites/${tenant.slug}/${slugPath}`
          : `/sites/${tenant.slug}/`;
        return c.json(
          buildTenantResolution(tenant, "preview", host, "", rewrittenPath),
          200
        );
      }
    }

    const domain = await domainDao.getByHostname(host);
    if (domain) {
      const tenant = await buildTenant(domain.projectId);
      if (!tenant) {
        return notFound(c);
      }
      const slugPath = stripPrefix(pathname, domain.pathPrefix ?? null);
      const rewrittenPath = slugPath
        ? `/sites/${tenant.slug}/${slugPath}`
        : `/sites/${tenant.slug}/`;
      return c.json(
        buildTenantResolution(
          tenant,
          "custom-domain",
          host,
          domain.pathPrefix ?? "",
          rewrittenPath
        ),
        200
      );
    }

    const localSuffixes = ["localhost", "127.0.0.1"];
    const localSuffix = localSuffixes.find((suffix) =>
      host.endsWith(`.${suffix}`)
    );
    if (localSuffix) {
      const subdomain = host.slice(0, -1 * (localSuffix.length + 1));
      if (subdomain) {
        const project = await projectDao.getBySlugUnique(subdomain);
        if (project) {
          const tenant = await buildTenant(project.id);
          if (!tenant) {
            return notFound(c);
          }
          const slugPath = slugifyPath(pathname);
          const rewrittenPath = slugPath
            ? `/sites/${tenant.slug}/${slugPath}`
            : `/sites/${tenant.slug}/`;
          return c.json(
            buildTenantResolution(tenant, "subdomain", host, "", rewrittenPath),
            200
          );
        }
      }
    }

    if (host.endsWith(`.${rootDomain}`)) {
      const subdomain = host.slice(0, -1 * (rootDomain.length + 1));
      if (
        subdomain &&
        !["www", "app", "admin", "dashboard"].includes(subdomain)
      ) {
        const project = await projectDao.getBySlugUnique(subdomain);
        if (project) {
          const tenant = await buildTenant(project.id);
          if (!tenant) {
            return notFound(c);
          }
          const slugPath = slugifyPath(pathname);
          const rewrittenPath = slugPath
            ? `/sites/${tenant.slug}/${slugPath}`
            : `/sites/${tenant.slug}/`;
          return c.json(
            buildTenantResolution(tenant, "subdomain", host, "", rewrittenPath),
            200
          );
        }
      }
    }

    if (host === rootDomain || localSuffixes.includes(host)) {
      const normalized = slugifyPath(pathname);
      const parts = normalized ? normalized.split("/") : [];
      const [projectSlug, ...rest] = parts;
      if (projectSlug) {
        const project = await projectDao.getBySlugUnique(projectSlug);
        if (project) {
          const tenant = await buildTenant(project.id);
          if (!tenant) {
            return notFound(c);
          }
          const remainder = rest.join("/");
          const rewrittenPath = remainder
            ? `/sites/${tenant.slug}/${remainder}`
            : `/sites/${tenant.slug}/`;
          return c.json(
            buildTenantResolution(
              tenant,
              "path",
              host,
              `/${tenant.slug}`,
              rewrittenPath
            ),
            200
          );
        }
      }
    }

    return notFound(c);
  }
);

app.get("/tenants/:slug", validateParams(slugParamsSchema), async (c) => {
  const { slug } = c.req.valid("param");
  const project = await projectDao.getBySlugUnique(slug);
  if (!project) {
    return notFound(c);
  }
  const tenant = await buildTenant(project.id);
  if (!tenant) {
    return notFound(c);
  }
  return c.json(tenant, 200);
});

app.get(
  "/projects/:projectId",
  validateParams(projectIdParamsSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const record = await projectDao.getById(projectId);
    if (!record) {
      return notFound(c);
    }
    return c.json(mapProject(record), 200);
  }
);

app.patch(
  "/projects/:projectId",
  validateParams(projectIdParamsSchema),
  validateJson(ProjectUpdateSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const body = c.req.valid("json");
    const existing = await projectDao.getById(projectId);
    if (!existing) {
      return notFound(c);
    }
    const record = await projectDao.update(projectId, body);
    return c.json(mapProject(record), 200);
  }
);

app.get(
  "/projects/:projectId/domains",
  validateParams(projectIdParamsSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const records = await domainDao.listByProject(projectId);
    return c.json(records.map(mapDomain), 200);
  }
);

app.post(
  "/projects/:projectId/domains",
  validateParams(projectIdParamsSchema),
  validateJson(domainCreateBodySchema),
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor this handler by extracting domain provisioning logic into separate functions
  async (c) => {
    const { projectId } = c.req.valid("param");
    const body = c.req.valid("json");
    const hostname = normalizeHostnameInput(body.hostname);
    if (!hostname) {
      return badRequest(c, "Domain hostname is required.");
    }
    if (hostname === rootDomain || hostname.endsWith(`.${rootDomain}`)) {
      return badRequest(c, "Domain must be external to the neue.com zone.");
    }

    let verification: DomainVerification | undefined;
    let status = mapDomainStatusFromContract("Pending Verification");
    let verifiedAt: Date | null = null;
    const pathPrefix = normalizePathPrefix(body.pathPrefix);

    if (isVercelEnabled()) {
      try {
        const domainResponse = await addProjectDomain(hostname);
        verification = mapVerification(domainResponse);
        const isVerified = Boolean(domainResponse.verified);
        status = toDomainStatus(isVerified);
        verifiedAt = isVerified ? new Date() : null;

        if (!isVerified) {
          const verifyResponse = await verifyProjectDomain(hostname).catch(
            () => null
          );
          if (verifyResponse) {
            verification = mapVerification(verifyResponse);
            const verifiedNow = Boolean(verifyResponse.verified);
            status = toDomainStatus(verifiedNow);
            verifiedAt = verifiedNow ? new Date() : null;
          }
        }

        if (autoWwwRedirect && !hostname.startsWith("www.")) {
          const parts = hostname.split(".");
          if (parts.length === 2) {
            await addProjectDomain(`www.${hostname}`, hostname).catch(
              () => null
            );
          }
        }
      } catch (error) {
        logError("Failed to provision Vercel domain", error);
        return badGateway(c, "Unable to provision domain");
      }
    }

    const record = await domainDao.create({
      hostname,
      pathPrefix,
      projectId,
      status,
      verifiedAt,
    });

    return c.json({ domain: mapDomain(record), verification }, 201);
  }
);

app.get(
  "/projects/:projectId/domains/:domainId/verification",
  validateParams(domainParamsSchema),
  async (c) => {
    const { domainId, projectId } = c.req.valid("param");
    const domain = await domainDao.getById(domainId);
    if (!domain || domain.projectId !== projectId) {
      return notFound(c);
    }

    if (!isVercelEnabled()) {
      return c.json(
        {
          records: [],
          verified:
            domain.status ===
            mapDomainStatusFromContract("Valid Configuration"),
        },
        200
      );
    }

    try {
      const domainResponse = await getProjectDomain(domain.hostname);
      const verification = mapVerification(domainResponse) ?? {
        records: [],
        verified: Boolean(domainResponse.verified),
      };
      if (verification.verified && !domain.verifiedAt) {
        await domainDao.update(domain.id, {
          status: toDomainStatus(true),
          verifiedAt: new Date(),
        });
      }
      return c.json(verification, 200);
    } catch (error) {
      logError("Failed to fetch domain verification", error);
      return badGateway(c, "Unable to fetch domain verification");
    }
  }
);

app.post(
  "/projects/:projectId/domains/:domainId/verify",
  validateParams(domainParamsSchema),
  async (c) => {
    const { domainId, projectId } = c.req.valid("param");
    const domain = await domainDao.getById(domainId);
    if (!domain || domain.projectId !== projectId) {
      return notFound(c);
    }

    if (!isVercelEnabled()) {
      return c.json(
        {
          records: [],
          verified:
            domain.status ===
            mapDomainStatusFromContract("Valid Configuration"),
        },
        200
      );
    }

    try {
      const domainResponse = await verifyProjectDomain(domain.hostname);
      const verification = mapVerification(domainResponse) ?? {
        records: [],
        verified: Boolean(domainResponse.verified),
      };
      if (verification.verified) {
        await domainDao.update(domain.id, {
          status: toDomainStatus(true),
          verifiedAt: new Date(),
        });
      }
      return c.json(verification, 200);
    } catch (error) {
      logError("Failed to verify domain", error);
      return badGateway(c, "Unable to verify domain");
    }
  }
);

app.delete(
  "/projects/:projectId/domains/:domainId",
  validateParams(domainParamsSchema),
  async (c) => {
    const { domainId, projectId } = c.req.valid("param");
    const domain = await domainDao.getById(domainId);
    if (!domain || domain.projectId !== projectId) {
      return notFound(c);
    }

    if (isVercelEnabled()) {
      try {
        await removeProjectDomain(domain.hostname, true);
        await deleteDomain(domain.hostname).catch((error: unknown) => {
          logWarn("Failed to delete Vercel domain", error);
        });
      } catch (error) {
        logError("Failed to remove Vercel domain", error);
        return badGateway(c, "Unable to remove domain");
      }
    }

    await domainDao.delete(domain.id);
    return noContent();
  }
);

app.get(
  "/projects/:projectId/deployments",
  validateParams(projectIdParamsSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const records = await deploymentDao.listByProject(projectId);
    return c.json(records.map(mapDeployment), 200);
  }
);

app.patch(
  "/projects/:projectId/deployments/:deploymentId",
  validateParams(deploymentParamsSchema),
  async (c) => {
    const { deploymentId, projectId } = c.req.valid("param");
    const deployment = await deploymentDao.getByProjectId(
      projectId,
      deploymentId
    );
    if (!deployment) {
      return notFound(c);
    }
    const record = await deploymentDao.update(deployment.id, {
      promotedAt: new Date(),
      status: "successful",
    });
    return c.json(mapDeployment(record), 200);
  }
);

app.post(
  "/projects/slug/:slug/deployments",
  validateParams(slugParamsSchema),
  validateJson(PublishDeploymentCreateSchema),
  async (c) => {
    const { slug } = c.req.valid("param");
    const body = c.req.valid("json");
    const apiKey = await authenticateApiKey(getHeadersRecord(c), apiKeyDao);
    if (!apiKey) {
      return unauthorized(c, "Invalid API key.");
    }

    const project = await projectDao.getBySlugUnique(slug);
    if (!project || project.id !== apiKey.projectId) {
      return notFound(c);
    }

    if (body.environment === "preview") {
      return badRequest(c, "Preview deployments are not supported.");
    }

    const record = await deploymentDao.create({
      branch: body.branch ?? "main",
      changes: body.changes ?? null,
      commitMessage: body.commitMessage ?? null,
      environment: "production",
      projectId: project.id,
      status: "building",
    });
    return c.json(mapDeployment(record), 201);
  }
);

app.post(
  "/projects/slug/:slug/deployments/:deploymentId/files",
  validateParams(slugDeploymentParamsSchema),
  validateJson(PublishDeploymentFileSchema),
  async (c) => {
    const { deploymentId, slug } = c.req.valid("param");
    const body = c.req.valid("json");
    const apiKey = await authenticateApiKey(getHeadersRecord(c), apiKeyDao);
    if (!apiKey) {
      return unauthorized(c, "Invalid API key.");
    }

    const project = await projectDao.getBySlugUnique(slug);
    if (!project || project.id !== apiKey.projectId) {
      return notFound(c);
    }

    const deployment = await deploymentDao.getByProjectId(
      project.id,
      deploymentId
    );
    if (!deployment) {
      return notFound(c);
    }

    if (!["building", "queued"].includes(deployment.status)) {
      return badRequest(c, "Deployment is not accepting files.");
    }

    try {
      const content = Buffer.from(body.contentBase64, "base64");
      const record = await uploadDeploymentFile({
        content,
        contentType: body.contentType,
        deploymentId: deployment.id,
        projectSlug: project.slug,
        relativePath: body.path,
      });
      return c.json(record, 200);
    } catch (error) {
      logError("Failed to upload deployment file", error);
      return badRequest(
        c,
        error instanceof Error ? error.message : "Unable to upload file."
      );
    }
  }
);

app.post(
  "/projects/slug/:slug/deployments/:deploymentId/finalize",
  validateParams(slugDeploymentParamsSchema),
  validateJson(PublishDeploymentFinalizeSchema),
  async (c) => {
    const { deploymentId, slug } = c.req.valid("param");
    const body = c.req.valid("json");
    const apiKey = await authenticateApiKey(getHeadersRecord(c), apiKeyDao);
    if (!apiKey) {
      return unauthorized(c, "Invalid API key.");
    }

    const project = await projectDao.getBySlugUnique(slug);
    if (!project || project.id !== apiKey.projectId) {
      return notFound(c);
    }

    const deployment = await deploymentDao.getByProjectId(
      project.id,
      deploymentId
    );
    if (!deployment) {
      return notFound(c);
    }

    try {
      const manifest = await finalizeDeploymentManifest({
        deploymentId: deployment.id,
        projectSlug: project.slug,
      });
      const shouldPromote = body.promote !== false;
      const updated = await deploymentDao.update(deployment.id, {
        fileCount: manifest.fileCount,
        manifestUrl: manifest.manifestUrl,
        promotedAt: shouldPromote ? new Date() : null,
        status: "successful",
      });

      if (shouldPromote) {
        try {
          await revalidateProject(project.slug);
        } catch (error) {
          logWarn("Failed to revalidate docs project", error);
        }
      }

      return c.json(mapDeployment(updated), 200);
    } catch (error) {
      await deploymentDao.update(deployment.id, { status: "failed" });
      logError("Failed to finalize deployment", error);
      return badRequest(
        c,
        error instanceof Error
          ? error.message
          : "Unable to finalize deployment."
      );
    }
  }
);

app.get(
  "/projects/:projectId/api-keys",
  validateParams(projectIdParamsSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const records = await apiKeyDao.listByProject(projectId);
    return c.json(records.map(mapApiKey), 200);
  }
);

app.post(
  "/projects/:projectId/api-keys",
  validateParams(projectIdParamsSchema),
  validateJson(apiKeyCreateBodySchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const body = c.req.valid("json");
    const { prefix, token, tokenHash } = createApiKeyToken();
    const record = await apiKeyDao.create({
      name: body.name,
      prefix,
      projectId,
      tokenHash,
    });
    return c.json(
      {
        apiKey: mapApiKey(record),
        token,
      },
      201
    );
  }
);

const start = () => {
  try {
    const port = Number(process.env.PORT ?? 4000);
    serve({
      fetch: app.fetch,
      hostname: "0.0.0.0",
      port,
    });
  } catch (error) {
    logError("Failed to start API server", error);
    process.exit(1);
  }
};

if (
  process.env.NODE_ENV !== "test" &&
  process.env.VITEST !== "true" &&
  !process.env.VERCEL
) {
  start();
}

export default app;
