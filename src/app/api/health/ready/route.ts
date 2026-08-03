import { NextResponse } from "next/server.js";

import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readinessResponse(status: "ready" | "unavailable", responseStatus = 200) {
  return NextResponse.json(
    { status },
    {
      status: responseStatus,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return readinessResponse("ready");
  } catch {
    return readinessResponse("unavailable", 503);
  }
}
