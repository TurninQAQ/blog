import { hashAdminPassword } from "../src/lib/auth/password";

const chunks: Buffer[] = [];

for await (const chunk of process.stdin) {
  chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
}

const password = Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");

if (!password) {
  console.error("Usage: printf '%s' '<password>' | npm run admin:hash-password");
  process.exit(1);
}

const hash = await hashAdminPassword(password);
console.log(hash);
