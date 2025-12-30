import { z } from "zod";

const UrlOrPathSchema = z.string().min(1);

export const DocsColorsSchema = z
  .object({
    primary: z.string().min(1),
    light: z.string().optional(),
    dark: z.string().optional(),
    background: z.string().optional(),
    surface: z.string().optional(),
    border: z.string().optional(),
    muted: z.string().optional(),
  })
  .strict();

export const DocsFontsSchema = z
  .object({
    body: z.string().optional(),
    heading: z.string().optional(),
    mono: z.string().optional(),
    provider: z.enum(["google", "local", "custom"]).optional(),
    cssUrl: z.string().optional(),
  })
  .strict();

export const DocsLogoSchema = z
  .object({
    light: UrlOrPathSchema.optional(),
    dark: UrlOrPathSchema.optional(),
    alt: z.string().optional(),
  })
  .strict();

export const DocsNavLinkSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
  })
  .strict();

export const DocsNavAnchorSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
  })
  .strict();

export const DocsNavLocaleSchema = z
  .object({
    label: z.string().min(1),
    url: z.string().min(1),
    locale: z.string().optional(),
  })
  .strict();

export const DocsNavVersionSchema = z
  .object({
    label: z.string().min(1),
    url: z.string().min(1),
  })
  .strict();

export const DocsOpenApiSourceSchema = z
  .object({
    source: z.string().min(1),
    directory: z.string().optional(),
    basePath: z.string().optional(),
    include: z.array(z.string()).optional(),
  })
  .strict();

export const DocsNavGroupSchema = z
  .object({
    group: z.string().optional(),
    pages: z.array(z.string()).optional(),
    openapi: z.union([z.string().min(1), DocsOpenApiSourceSchema]).optional(),
    expanded: z.boolean().optional(),
  })
  .strict();

export const DocsNavigationSchema = z
  .object({
    groups: z.array(DocsNavGroupSchema).optional(),
    pages: z.array(z.string()).optional(),
    hidden: z.array(z.string()).optional(),
    global: z
      .object({
        links: z.array(DocsNavLinkSchema).optional(),
        anchors: z.array(DocsNavAnchorSchema).optional(),
      })
      .strict()
      .optional(),
    versions: z.array(DocsNavVersionSchema).optional(),
    languages: z.array(DocsNavLocaleSchema).optional(),
  })
  .strict();

export const DocsScriptsSchema = z
  .object({
    head: z.array(z.string()).optional(),
    body: z.array(z.string()).optional(),
  })
  .strict();

export const DocsFeatureFlagsSchema = z
  .object({
    search: z.boolean().optional(),
    toc: z.boolean().optional(),
    themeToggle: z.boolean().optional(),
    rightToc: z.boolean().optional(),
  })
  .strict();

export const DocsOpenApiProxySchema = z
  .object({
    enabled: z.boolean().optional(),
    allowedHosts: z.array(z.string()).optional(),
  })
  .strict();

export const DocsConfigSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    theme: z.string().optional(),
    colors: DocsColorsSchema.optional(),
    fonts: DocsFontsSchema.optional(),
    logo: DocsLogoSchema.optional(),
    favicon: UrlOrPathSchema.optional(),
    navigation: DocsNavigationSchema,
    scripts: DocsScriptsSchema.optional(),
    openapi: z
      .union([z.string(), z.array(z.string()), DocsOpenApiSourceSchema])
      .optional(),
    metadata: z
      .object({
        defaultTitle: z.string().optional(),
        titleTemplate: z.string().optional(),
        ogImage: UrlOrPathSchema.optional(),
      })
      .strict()
      .optional(),
    features: DocsFeatureFlagsSchema.optional(),
    openapiProxy: DocsOpenApiProxySchema.optional(),
  })
  .strict();

export type DocsConfig = z.infer<typeof DocsConfigSchema>;
export type DocsNavigation = z.infer<typeof DocsNavigationSchema>;
export type DocsNavGroup = z.infer<typeof DocsNavGroupSchema>;
export type DocsOpenApiSource = z.infer<typeof DocsOpenApiSourceSchema>;
