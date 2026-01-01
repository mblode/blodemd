import { loadDocsConfig } from "@repo/previewing";
import { NextResponse } from "next/server";
import { getDefaultTenant, getTenantBySlug } from "@/lib/tenants";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
  };

  if (!(payload?.url && payload?.method)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const tenantSlug = request.headers.get("x-tenant-slug") ?? "";
  const tenant =
    (await getTenantBySlug(tenantSlug)) ?? (await getDefaultTenant());

  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 400 });
  }

  const configResult = await loadDocsConfig(tenant.docsPath);
  if (!configResult.ok) {
    return NextResponse.json({ error: "Invalid docs config" }, { status: 400 });
  }

  const config = configResult.config;
  if (!config.openapiProxy?.enabled) {
    return NextResponse.json({ error: "Proxy disabled" }, { status: 403 });
  }

  const url = new URL(payload.url);
  if (!["http:", "https:"].includes(url.protocol)) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }
  const allowedHosts = config.openapiProxy.allowedHosts ?? [];
  if (allowedHosts.length && !allowedHosts.includes(url.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const method = payload.method.toUpperCase();
  const response = await fetch(payload.url, {
    method,
    headers: payload.headers,
    body: method === "GET" ? undefined : payload.body,
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "text/plain",
    },
  });
}
