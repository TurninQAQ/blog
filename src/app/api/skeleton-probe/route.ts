import { NextResponse } from "next/server.js";

import { isSkeletonProbeEnabled } from "@/lib/skeleton/probe-gate";
import { readProbe, writeProbe } from "@/lib/skeleton/probe-store";

export const runtime = "nodejs";

function probeResponse(state: Awaited<ReturnType<typeof readProbe>>) {
  return NextResponse.json({
    status: "ok",
    count: state.count,
    updatedAt: state.updatedAt,
  });
}

function disabledProbeResponse() {
  return new NextResponse(null, { status: 404 });
}

export async function GET() {
  if (!isSkeletonProbeEnabled()) {
    return disabledProbeResponse();
  }

  return probeResponse(await readProbe());
}

export async function POST() {
  if (!isSkeletonProbeEnabled()) {
    return disabledProbeResponse();
  }

  return probeResponse(await writeProbe());
}
