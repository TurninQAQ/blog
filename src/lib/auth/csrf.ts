import "server-only";

import { NextResponse } from "next/server.js";

const FORBIDDEN_ORIGIN_MESSAGE = "管理员请求来源不被允许。";

export function parseStrictHttpOrigin(value: string) {
  try {
    const url = new URL(value);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";

    if (
      !isHttp ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.href !== `${url.origin}/`
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function resolveAdminSiteOrigin(request: Request) {
  const configuredOrigin = process.env.ADMIN_SITE_ORIGIN?.trim();

  if (configuredOrigin) {
    return parseStrictHttpOrigin(configuredOrigin);
  }

  try {
    return parseStrictHttpOrigin(new URL(request.url).origin);
  } catch {
    return null;
  }
}

function parseHttpRefererOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      url.hash
    ) {
      return null;
    }

    return parseStrictHttpOrigin(url.origin);
  } catch {
    return null;
  }
}

function isLoopbackOrigin(origin: string) {
  const hostname = new URL(origin).hostname;

  return (
    hostname === "localhost" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

function isLocalDevelopmentBindingOrigin(origin: string) {
  const hostname = new URL(origin).hostname;

  return (
    isLoopbackOrigin(origin) ||
    hostname === "0.0.0.0" ||
    hostname === "[::]" ||
    hostname === "::"
  );
}

function isLocalDevelopmentRequestOriginAllowed(
  request: Request,
  expectedOrigin: string,
  requestOrigin: string,
) {
  if (
    process.env.NODE_ENV !== "development" ||
    !isLocalDevelopmentBindingOrigin(expectedOrigin)
  ) {
    return false;
  }

  try {
    const actualUrl = new URL(request.url);
    const actualOrigin = parseStrictHttpOrigin(actualUrl.origin);
    const host = request.headers.get("host");
    const hostOrigin =
      host && host === host.trim()
        ? parseStrictHttpOrigin(`${actualUrl.protocol}//${host}`)
        : null;

    return (
      (actualOrigin !== null &&
        isLoopbackOrigin(actualOrigin) &&
        requestOrigin === actualOrigin) ||
      (hostOrigin !== null &&
        isLoopbackOrigin(hostOrigin) &&
        requestOrigin === hostOrigin)
    );
  } catch {
    return false;
  }
}

export function rejectCrossOriginAdminRequest(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = resolveAdminSiteOrigin(request);
  const requestOrigin =
    origin !== null
      ? parseStrictHttpOrigin(origin)
      : parseHttpRefererOrigin(request.headers.get("referer"));

  if (
    expectedOrigin &&
    (requestOrigin === expectedOrigin ||
      (requestOrigin !== null &&
        isLocalDevelopmentRequestOriginAllowed(
          request,
          expectedOrigin,
          requestOrigin,
        )))
  ) {
    return null;
  }

  return new NextResponse(FORBIDDEN_ORIGIN_MESSAGE, { status: 403 });
}
