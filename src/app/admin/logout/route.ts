import { NextResponse, type NextRequest } from "next/server.js";

import {
  rejectCrossOriginAdminRequest,
  resolveAdminSiteOrigin,
} from "@/lib/auth/csrf";
import { destroyAdminSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const INTERNAL_SERVER_ERROR = "Internal Server Error";

function resolveLoginUrl(request: NextRequest) {
  const origin = resolveAdminSiteOrigin(request);

  if (!origin) {
    return null;
  }

  return new URL("/admin/login", origin);
}

function invalidOriginResponse() {
  return new NextResponse(INTERNAL_SERVER_ERROR, { status: 500 });
}

function redirectToLogin(loginUrl: URL) {
  return NextResponse.redirect(loginUrl, {
    status: 303,
  });
}

export async function GET(request: NextRequest) {
  const loginUrl = resolveLoginUrl(request);

  if (!loginUrl) {
    return invalidOriginResponse();
  }

  return redirectToLogin(loginUrl);
}

export async function POST(request: NextRequest) {
  const loginUrl = resolveLoginUrl(request);

  if (!loginUrl) {
    return invalidOriginResponse();
  }

  const csrfFailure = rejectCrossOriginAdminRequest(request);

  if (csrfFailure) {
    return csrfFailure;
  }

  await destroyAdminSession();

  return redirectToLogin(loginUrl);
}
