import { SkeletonProbeClient } from "@/components/skeleton/SkeletonProbeClient";

export default function SkeletonPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[1120px] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-mono text-[14px] leading-[1.4] text-lab-accent">
        本地运行探针
      </p>
      <h1 className="mt-4 text-[40px] font-semibold leading-[1.1] text-lab-text">
        骨架探针
      </h1>
      <p className="mt-6 max-w-[68ch] text-[16px] leading-[1.5] text-lab-text-muted">
        这个未公开页面用于验证浏览器界面、API 和本地运行时之间的读写链路。
      </p>
      <SkeletonProbeClient />
    </main>
  );
}
