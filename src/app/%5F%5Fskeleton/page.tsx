import { notFound } from "next/navigation";

import { isSkeletonProbeEnabled } from "@/lib/skeleton/probe-gate";
import SkeletonPage from "../__skeleton/page";

export const dynamic = "force-dynamic";

export default function EncodedSkeletonPage() {
  if (!isSkeletonProbeEnabled()) {
    notFound();
  }

  return <SkeletonPage />;
}
