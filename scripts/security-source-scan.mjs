import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const executableExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);

const sensitiveIdentifierSuffix =
  /(?:^|_)(?:api_key|access_token|auth_token|client_secret|session_secret|password(?:_hash)?|private_key|secret|database_url|aws_secret_access_key|github_token|npm_token)$/;

function isSensitiveIdentifier(value) {
  const normalized = value
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/[-.]+/g, "_")
    .toLowerCase();

  return sensitiveIdentifierSuffix.test(normalized);
}

function hasHighEntropyShape(value) {
  return (
    value.length >= 16 &&
    !/\s/.test(value) &&
    new Set(value).size >= 4
  );
}

const credentialRules = [
  {
    id: "private-key",
    pattern:
      /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/g,
  },
  {
    id: "authenticated-url",
    pattern:
      /\b(?:https?|redis|rediss|mongodb(?:\+srv)?|mysql|postgres(?:ql)?):\/\/[^\s/:@]+:[^\s/@]+@[^\s"'`]+/gi,
  },
  {
    id: "aws-access-key-id",
    pattern:
      /\b(?:AKIA|ASIA|A3T[A-Z0-9]|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASCA)[A-Z0-9]{16}\b/g,
  },
  {
    id: "github-token",
    pattern:
      /\b(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{82,255})\b/g,
  },
  {
    id: "gitlab-token",
    pattern: /\bglpat-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: "slack-token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  },
  {
    id: "service-api-key",
    pattern:
      /\b(?:AIza[0-9A-Za-z_-]{35}|sk_live_[0-9A-Za-z]{16,}|sk_(?:proj|ant)-[0-9A-Za-z_-]{20,}|npm_[0-9A-Za-z]{36})\b/g,
  },
  {
    id: "jwt",
    pattern:
      /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
  },
  {
    id: "literal-secret-assignment",
    pattern:
      /(["'`]?)([A-Za-z_$][A-Za-z\d_$.-]*)\1\s*[:=]\s*(?:"([^"\r\n]{16,})"|'([^'\r\n]{16,})'|`([^`\r\n]{16,})`|([^\s,;}\]#"'`]{16,}))/g,
    matches(match, path) {
      const value = match.slice(3).find((candidate) => candidate !== undefined);
      const isUnquoted = match[6] !== undefined;

      return (
        isSensitiveIdentifier(match[2]) &&
        typeof value === "string" &&
        !(isUnquoted && executableExtensions.has(extname(path).toLowerCase())) &&
        hasHighEntropyShape(value)
      );
    },
  },
  {
    id: "nonempty-sensitive-env",
    pattern:
      /^(?:export\s+)?(?:ADMIN_PASSWORD_HASH|ADMIN_SESSION_SECRET|DATABASE_URL|AWS_SECRET_ACCESS_KEY|GITHUB_TOKEN|NPM_TOKEN)=([^\s#].+)$/gm,
  },
];

const executableSinkRules = [
  {
    id: "dangerously-set-inner-html",
    pattern: /\bdangerouslySetInnerHTML\s*=/g,
  },
  {
    id: "rehype-raw-import",
    pattern:
      /(?:\bfrom\s*|^\s*import\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)["']rehype-raw["']/gm,
  },
  {
    id: "eval-call",
    pattern: /\beval\s*\(/g,
  },
  {
    id: "function-constructor",
    pattern: /\bnew\s+Function\s*\(/g,
  },
];

const allowedFinding = {
  path: "src/tests/e2e/data-model-foundation.spec.ts",
  rule: "authenticated-url",
  value: [
    "postgresql://user",
    "password@localhost:5432/personal_tech_lab_blog",
  ].join(":"),
};

function trackedAndPendingFiles() {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      cwd: process.cwd(),
      encoding: "buffer",
      maxBuffer: 64 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.toString("utf8").trim();
    throw new Error(stderr || `git ls-files exited ${result.status}`);
  }

  const deleted = spawnSync("git", ["ls-files", "--deleted", "-z"], {
    cwd: process.cwd(),
    encoding: "buffer",
    maxBuffer: 64 * 1024 * 1024,
  });

  if (deleted.error) {
    throw deleted.error;
  }

  if (deleted.status !== 0) {
    const stderr = deleted.stderr?.toString("utf8").trim();
    throw new Error(stderr || `git ls-files --deleted exited ${deleted.status}`);
  }

  const deletedPaths = new Set(
    deleted.stdout.toString("utf8").split("\0").filter(Boolean),
  );

  return result.stdout
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter((path) => !deletedPaths.has(path))
    .sort((left, right) => left.localeCompare(right));
}

function lineNumberAt(source, index) {
  let line = 1;

  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source.charCodeAt(cursor) === 10) {
      line += 1;
    }
  }

  return line;
}

function isAllowed(path, rule, value) {
  return (
    path === allowedFinding.path &&
    rule === allowedFinding.rule &&
    value === allowedFinding.value
  );
}

function collectMatches(path, source, rules, findings) {
  for (const rule of rules) {
    rule.pattern.lastIndex = 0;

    for (const match of source.matchAll(rule.pattern)) {
      if (rule.matches && !rule.matches(match, path)) {
        continue;
      }

      if (isAllowed(path, rule.id, match[0])) {
        continue;
      }

      findings.push({
        path,
        line: lineNumberAt(source, match.index ?? 0),
        rule: rule.id,
      });
    }
  }
}

async function scan() {
  const findings = [];
  let scannedTextFiles = 0;
  let skippedBinaryFiles = 0;

  for (const path of trackedAndPendingFiles()) {
    const contents = await readFile(path);

    if (contents.includes(0)) {
      skippedBinaryFiles += 1;
      continue;
    }

    const source = contents.toString("utf8");
    scannedTextFiles += 1;
    collectMatches(path, source, credentialRules, findings);

    if (executableExtensions.has(extname(path).toLowerCase())) {
      collectMatches(path, source, executableSinkRules, findings);
    }
  }

  findings.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.line - right.line ||
      left.rule.localeCompare(right.rule),
  );

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`${finding.path}:${finding.line} [${finding.rule}]`);
    }

    console.error(
      `Security source scan found ${findings.length} issue(s) across ${scannedTextFiles} text file(s).`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Security source scan passed: ${scannedTextFiles} text file(s), ${skippedBinaryFiles} binary file(s) skipped.`,
  );
}

const scannerPath = fileURLToPath(import.meta.url);

function runScanner(root) {
  return spawnSync(process.execPath, [scannerPath], {
    cwd: root,
    encoding: "utf8",
  });
}

async function createGitFixture(files) {
  const root = await mkdtemp(join(tmpdir(), "security-source-scan-"));
  const initialized = spawnSync("git", ["init", "-q"], { cwd: root });

  assert.equal(initialized.status, 0, initialized.stderr?.toString("utf8"));

  for (const [path, contents] of Object.entries(files)) {
    const absolutePath = join(root, path);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, contents);
  }

  const added = spawnSync("git", ["add", "."], { cwd: root });
  assert.equal(added.status, 0, added.stderr?.toString("utf8"));
  return root;
}

async function runSelfTest() {
  const roots = [];
  const entropy = `${"0123456789".repeat(3)}01`;
  const upperSecret = ["SESSION", "SECRET"].join("_");
  const lowerSecret = ["session", "secret"].join("_");
  const privateKeyHeader = (prefix = "") =>
    ["-----BEGIN ", prefix, "PRIVATE KEY-----"].join("");

  try {
    const findingRoot = await createGitFixture({
      "config.yml": [
        `ADMIN_${upperSecret}: "${entropy}"`,
        `ADMIN_${upperSecret} = "${entropy}"`,
        `${lowerSecret}: "${entropy}"`,
        `credentials: { "SERVICE_API_KEY": "${entropy}" }`,
        `database_password: ${entropy}`,
      ].join("\n"),
    });
    roots.push(findingRoot);
    const finding = runScanner(findingRoot);

    assert.equal(finding.status, 1, finding.stdout || finding.stderr);
    assert.equal(
      finding.stderr.match(/\[literal-secret-assignment\]/g)?.length,
      5,
      finding.stderr,
    );

    for (const [label, prefix] of [
      ["unencrypted", ""],
      ["encrypted", "ENCRYPTED "],
    ]) {
      const privateKeyRoot = await createGitFixture({
        [`${label}-private-key.pem`]: privateKeyHeader(prefix),
      });
      roots.push(privateKeyRoot);
      const privateKeyFinding = runScanner(privateKeyRoot);

      assert.equal(
        privateKeyFinding.status,
        1,
        privateKeyFinding.stdout || privateKeyFinding.stderr,
      );
      assert.equal(
        privateKeyFinding.stderr.match(/\[private-key\]/g)?.length,
        1,
        privateKeyFinding.stderr,
      );
    }

    const cleanRoot = await createGitFixture({
      "config.yml": "ADMIN_SESSION_SECRET: \"\"\nlabel: public-value\n",
    });
    roots.push(cleanRoot);
    const clean = runScanner(cleanRoot);

    assert.equal(clean.status, 0, clean.stderr);

    const deletedRoot = await createGitFixture({
      "removed.txt": "no longer present\n",
    });
    roots.push(deletedRoot);
    await rm(join(deletedRoot, "removed.txt"));
    const deletedFile = runScanner(deletedRoot);

    assert.equal(deletedFile.status, 0, deletedFile.stderr);

    const gitFailureRoot = await mkdtemp(
      join(tmpdir(), "security-source-scan-not-git-"),
    );
    roots.push(gitFailureRoot);
    const gitFailure = runScanner(gitFailureRoot);

    assert.equal(gitFailure.status, 2, gitFailure.stderr);

    const readFailureRoot = await createGitFixture({});
    roots.push(readFailureRoot);
    await symlink("missing-target", join(readFailureRoot, "broken.txt"));
    const added = spawnSync("git", ["add", "broken.txt"], {
      cwd: readFailureRoot,
    });
    assert.equal(added.status, 0, added.stderr?.toString("utf8"));
    const readFailure = runScanner(readFailureRoot);

    assert.equal(readFailure.status, 2, readFailure.stderr);
    console.log("Security source scan self-test passed.");
  } finally {
    await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  }
}

if (process.argv.includes("--self-test")) {
  try {
    await runSelfTest();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Security source scan self-test failed: ${message}`);
    process.exitCode = 1;
  }
} else {
  try {
    await scan();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Security source scan failed: ${message}`);
    process.exitCode = 2;
  }
}
