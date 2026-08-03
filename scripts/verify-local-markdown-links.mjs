import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function extractInlineDestinations(source) {
  const destinations = [];
  const opener = /!?\[[^\]\n]*\]\(\s*/g;

  for (const match of source.matchAll(opener)) {
    let cursor = (match.index ?? 0) + match[0].length;

    if (source[cursor] === "<") {
      cursor += 1;
      let destination = "";

      while (cursor < source.length && source[cursor] !== "\n") {
        if (source[cursor] === ">" && source[cursor - 1] !== "\\") {
          destinations.push(destination);
          break;
        }

        destination += source[cursor];
        cursor += 1;
      }

      continue;
    }

    let destination = "";
    let depth = 0;

    while (cursor < source.length && source[cursor] !== "\n") {
      const character = source[cursor];

      if (character === "\\" && cursor + 1 < source.length) {
        destination += source[cursor + 1];
        cursor += 2;
        continue;
      }

      if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        if (depth === 0) {
          destinations.push(destination);
          break;
        }

        depth -= 1;
      } else if (/\s/.test(character) && depth === 0) {
        destinations.push(destination);
        break;
      }

      destination += character;
      cursor += 1;
    }
  }

  return destinations;
}

function localPathFromDestination(destination) {
  const trimmed = destination.trim();

  if (
    trimmed === "" ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("?") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/") ||
    /^[A-Za-z][A-Za-z\d+.-]*:/.test(trimmed)
  ) {
    return null;
  }

  const pathOnly = trimmed.split(/[?#]/, 1)[0];

  if (pathOnly === "") {
    return null;
  }

  try {
    return decodeURIComponent(pathOnly);
  } catch {
    return undefined;
  }
}

async function verifyMarkdownFiles(paths) {
  const broken = [];
  const unreadable = [];
  let checked = 0;

  for (const inputPath of paths) {
    const documentPath = resolve(inputPath);
    let source;

    try {
      source = await readFile(documentPath, "utf8");
    } catch {
      unreadable.push(inputPath);
      continue;
    }

    for (const destination of extractInlineDestinations(source)) {
      const localPath = localPathFromDestination(destination);

      if (localPath === null) {
        continue;
      }

      checked += 1;

      if (localPath === undefined || isAbsolute(localPath)) {
        broken.push({ source: inputPath, target: destination });
        continue;
      }

      try {
        await access(resolve(dirname(documentPath), localPath));
      } catch {
        broken.push({ source: inputPath, target: destination });
      }
    }
  }

  return { broken, checked, unreadable };
}

async function runSelfTest() {
  const root = await mkdtemp(join(tmpdir(), "markdown-link-verifier-"));

  try {
    await mkdir(join(root, "docs", "images"), { recursive: true });
    await writeFile(join(root, "docs", "target.md"), "# Target\n");
    await writeFile(join(root, "docs", "images", "sample.png"), "fixture\n");
    await writeFile(
      join(root, "docs", "valid.md"),
      [
        "[target](target.md?mode=read#section)",
        "![sample](<images/sample.png>)",
        "[external](https://example.com)",
        "[mail](mailto:test@example.com)",
        "[anchor](#section)",
      ].join("\n"),
    );
    await writeFile(
      join(root, "docs", "broken.md"),
      "[missing](missing%20target.md#section)\n",
    );

    const valid = await verifyMarkdownFiles([join(root, "docs", "valid.md")]);
    assert.equal(valid.broken.length, 0);
    assert.equal(valid.unreadable.length, 0);
    assert.equal(valid.checked, 2);

    const broken = await verifyMarkdownFiles([join(root, "docs", "broken.md")]);
    assert.equal(broken.broken.length, 1);
    assert.equal(broken.unreadable.length, 0);
    assert.equal(broken.checked, 1);

    const validCli = spawnSync(
      process.execPath,
      [scriptPath, join(root, "docs", "valid.md")],
      { encoding: "utf8" },
    );
    assert.equal(validCli.status, 0, validCli.stderr);

    const brokenCli = spawnSync(
      process.execPath,
      [scriptPath, join(root, "docs", "broken.md")],
      { encoding: "utf8" },
    );
    assert.equal(brokenCli.status, 1, brokenCli.stdout || brokenCli.stderr);
  } finally {
    await rm(root, { recursive: true, force: true });
  }

  await assert.rejects(access(root));
  console.log("Local Markdown link verifier self-test passed.");
}

function displayPath(path) {
  const fromCwd = relative(process.cwd(), resolve(path));
  return fromCwd === "" ? "." : fromCwd;
}

async function run(paths) {
  if (paths.length === 0) {
    console.error(
      "Usage: node scripts/verify-local-markdown-links.mjs <file.md> [...]",
    );
    process.exitCode = 2;
    return;
  }

  const result = await verifyMarkdownFiles(paths);

  for (const path of result.unreadable) {
    console.error(`${displayPath(path)}: unable to read Markdown document`);
  }

  for (const finding of result.broken) {
    console.error(
      `${displayPath(finding.source)}: broken local target: ${finding.target}`,
    );
  }

  console.log(
    `Local Markdown links: ${result.checked} checked, ${result.broken.length} broken across ${paths.length} document(s).`,
  );

  if (result.unreadable.length > 0) {
    process.exitCode = 2;
  } else if (result.broken.length > 0) {
    process.exitCode = 1;
  }
}

const scriptPath = fileURLToPath(import.meta.url);

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const args = process.argv.slice(2);

  if (args.length === 1 && args[0] === "--self-test") {
    try {
      await runSelfTest();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Local Markdown link verifier self-test failed: ${message}`);
      process.exitCode = 1;
    }
  } else {
    try {
      await run(args);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Local Markdown link verifier failed: ${message}`);
      process.exitCode = 2;
    }
  }
}
