import path from "node:path";
import { ensureArray, normalizePath } from "@repo/common";
import type { DocsConfig, DocsOpenApiSource } from "@repo/models";
import {
  extractOpenApiOperations,
  loadOpenApiSpec,
  type OpenApiOperation,
  type OpenApiSpec,
  openApiIdentifier,
  openApiSlug,
} from "@repo/prebuild";

export interface OpenApiEntry {
  slug: string;
  identifier: string;
  operation: OpenApiOperation;
  spec: OpenApiSpec;
  source: DocsOpenApiSource;
  sourceKey: string;
}

export interface OpenApiRegistry {
  entries: OpenApiEntry[];
  bySlug: Map<string, OpenApiEntry>;
  byIdentifier: Map<string, OpenApiEntry>;
  bySource: Map<string, OpenApiEntry[]>;
}

const toSourceObject = (
  value: string | DocsOpenApiSource
): DocsOpenApiSource => {
  if (typeof value === "string") {
    return { source: value };
  }
  return value;
};

export const collectOpenApiSources = (config: DocsConfig) => {
  const sources: DocsOpenApiSource[] = [];

  for (const item of ensureArray(config.openapi)) {
    if (!item) {
      continue;
    }
    sources.push(toSourceObject(item));
  }

  const groups = config.navigation.groups ?? [];
  for (const group of groups) {
    if (!group.openapi) {
      continue;
    }
    sources.push(toSourceObject(group.openapi));
  }

  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.source}::${source.directory ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const buildOpenApiRegistry = async (
  config: DocsConfig,
  projectRoot: string
): Promise<OpenApiRegistry> => {
  const entries: OpenApiEntry[] = [];
  const bySlug = new Map<string, OpenApiEntry>();
  const byIdentifier = new Map<string, OpenApiEntry>();
  const bySource = new Map<string, OpenApiEntry[]>();

  for (const source of collectOpenApiSources(config)) {
    const absolutePath = path.join(projectRoot, source.source);
    const spec = await loadOpenApiSpec(absolutePath);
    const directory = source.directory ?? "api";
    const { operations } = extractOpenApiOperations(spec, directory);
    const sourceKey = `${source.source}::${source.directory ?? ""}`;

    for (const operation of operations) {
      const slug = openApiSlug(operation.method, operation.path, directory);
      const identifier = openApiIdentifier(operation.method, operation.path);
      const entry: OpenApiEntry = {
        slug: normalizePath(slug),
        identifier,
        operation,
        spec,
        source,
        sourceKey,
      };
      entries.push(entry);
      bySlug.set(entry.slug, entry);
      byIdentifier.set(entry.identifier, entry);
      if (!bySource.has(sourceKey)) {
        bySource.set(sourceKey, []);
      }
      bySource.get(sourceKey)?.push(entry);
    }
  }

  return { entries, bySlug, byIdentifier, bySource };
};
