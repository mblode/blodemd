import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isReservedPath, resolveTenant } from "./lib/tenancy";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/sites")) {
    return NextResponse.next();
  }

  if (isReservedPath(pathname)) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const resolution = await resolveTenant(host, pathname);

  if (!resolution) {
    return NextResponse.next();
  }

  const redirectToPrimary = process.env.REDIRECT_PRIMARY_DOMAIN === "true";
  if (
    redirectToPrimary &&
    resolution.strategy !== "preview" &&
    resolution.tenant.primaryDomain &&
    resolution.host !== resolution.tenant.primaryDomain
  ) {
    const redirectUrl = new URL(request.url);
    redirectUrl.hostname = resolution.tenant.primaryDomain;
    return NextResponse.redirect(redirectUrl, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = resolution.rewrittenPath;
  const response = NextResponse.rewrite(url);
  const basePath =
    resolution.strategy === "path"
      ? `/${resolution.tenant.slug}`
      : (resolution.tenant.pathPrefix ?? "");
  response.headers.set("x-tenant-id", resolution.tenant.id);
  response.headers.set("x-tenant-slug", resolution.tenant.slug);
  response.headers.set("x-tenant-domain", resolution.host);
  response.headers.set("x-tenant-strategy", resolution.strategy);
  response.headers.set("x-tenant-base-path", basePath);
  return response;
}
