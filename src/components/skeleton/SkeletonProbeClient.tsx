"use client";

import { useEffect, useState } from "react";

type ProbeResult = {
  status: string;
  count: number;
  updatedAt: string;
};

function formatResult(result: ProbeResult | null, fallback: string) {
  if (!result) {
    return fallback;
  }

  return `状态=${result.status} 次数=${result.count} 更新时间=${result.updatedAt}`;
}

export function SkeletonProbeClient() {
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("正在读取探针...");

  useEffect(() => {
    let active = true;

    async function readInitialProbe() {
      try {
        const response = await fetch("/api/skeleton-probe", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Probe read failed: ${response.status}`);
        }

        const data = (await response.json()) as ProbeResult;
        if (active) {
          setResult(data);
          setMessage("探针已就绪");
        }
      } catch {
        if (active) {
          setMessage("探针读取失败");
        }
      }
    }

    readInitialProbe();

    return () => {
      active = false;
    };
  }, []);

  async function writeProbe() {
    setPending(true);
    setMessage("正在写入探针...");

    try {
      const response = await fetch("/api/skeleton-probe", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Probe write failed: ${response.status}`);
      }

      const data = (await response.json()) as ProbeResult;
      setResult(data);
      setMessage("探针写入已保存");
    } catch {
      setMessage("探针写入失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 flex max-w-[720px] flex-col gap-4 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/72 p-4">
      <button
        type="button"
        onClick={writeProbe}
        disabled={pending}
        className="min-h-11 self-start rounded-lab border border-[var(--lab-border-active)] px-4 py-2 text-[16px] leading-[1.5] text-lab-text transition-colors hover:bg-lab-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent disabled:cursor-not-allowed disabled:border-[var(--lab-border-hairline)] disabled:text-lab-muted"
      >
        写入探针
      </button>
      <p
        data-testid="skeleton-probe-result"
        role="status"
        aria-live="polite"
        className="font-mono text-[14px] leading-[1.4] text-lab-text-muted"
      >
        {formatResult(result, message)}
      </p>
    </div>
  );
}
