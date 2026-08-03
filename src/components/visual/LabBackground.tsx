import type { ReactNode } from "react";
import { LabBackgroundClient } from "./LabBackgroundClient";

type LabBackgroundProps = {
  children: ReactNode;
  enableCanvas?: boolean;
};

export function LabBackground({
  children,
  enableCanvas = false,
}: LabBackgroundProps) {
  return (
    <div
      data-lab-background={enableCanvas ? "homepage" : "static"}
      className="lab-background relative isolate overflow-hidden"
    >
      <div
        data-lab-static="true"
        className="lab-background__static"
        aria-hidden="true"
      />
      {enableCanvas ? <LabBackgroundClient /> : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
