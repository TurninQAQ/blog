"use client";

import dynamic from "next/dynamic";

const SignalNetworkCanvas = dynamic(
  () =>
    import("./SignalNetworkCanvas").then((module) => module.SignalNetworkCanvas),
  {
    ssr: false,
  },
);

export function LabBackgroundClient() {
  return <SignalNetworkCanvas />;
}
