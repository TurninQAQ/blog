import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type ProbeState = {
  count: number;
  updatedAt: string;
};

const defaultProbePath = join(
  process.cwd(),
  ".next",
  "cache",
  "skeleton-probe.json",
);

const emptyProbe: ProbeState = {
  count: 0,
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function isProbeState(value: unknown): value is ProbeState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProbeState>;
  return (
    typeof candidate.count === "number" &&
    Number.isInteger(candidate.count) &&
    candidate.count >= 0 &&
    typeof candidate.updatedAt === "string"
  );
}

export function createProbeStore(probePath: string) {
  let writeQueue: Promise<void> = Promise.resolve();

  async function readProbe(): Promise<ProbeState> {
    try {
      const contents = await readFile(probePath, "utf8");
      const parsed = JSON.parse(contents) as unknown;

      if (isProbeState(parsed)) {
        return parsed;
      }
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return emptyProbe;
      }

      throw error;
    }

    return emptyProbe;
  }

  async function writeProbe(): Promise<ProbeState> {
    const operation = writeQueue.then(async () => {
      const current = await readProbe();
      const next = {
        count: current.count + 1,
        updatedAt: new Date().toISOString(),
      };

      await mkdir(dirname(probePath), { recursive: true });
      await writeFile(probePath, JSON.stringify(next), "utf8");

      return next;
    });

    writeQueue = operation.then(
      () => undefined,
      () => undefined,
    );

    return operation;
  }

  return { readProbe, writeProbe };
}

const defaultStore = createProbeStore(defaultProbePath);

export function readProbe() {
  return defaultStore.readProbe();
}

export function writeProbe() {
  return defaultStore.writeProbe();
}
