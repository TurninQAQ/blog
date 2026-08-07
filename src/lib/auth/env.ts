import { z } from "zod";

const postgresUrlSchema = z
  .string()
  .trim()
  .min(1, "DATABASE_URL is required")
  .refine(
    (value) =>
      value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "DATABASE_URL must be a PostgreSQL connection string",
  );

const databaseEnvSchema = z.object({
  DATABASE_URL: postgresUrlSchema,
});

const authEnvSchema = databaseEnvSchema.extend({
  ADMIN_EMAIL: z
    .string()
    .trim()
    .toLowerCase()
    .email("ADMIN_EMAIL must be a valid email address"),
  ADMIN_PASSWORD_HASH: z
    .string()
    .trim()
    .min(1, "ADMIN_PASSWORD_HASH is required")
    .transform((value) => value.replace(/\\\$/g, "$"))
    .refine(
      (value) => value.startsWith("$argon2"),
      "ADMIN_PASSWORD_HASH must be an Argon2 hash",
    ),
  ADMIN_SESSION_SECRET: z
    .string()
    .min(32, "ADMIN_SESSION_SECRET must be at least 32 characters"),
});

type RuntimeEnv = Record<string, string | undefined>;

function normalizeAdminPasswordHash(value: string) {
  return value.trim().replace(/\\\$/g, "$");
}

function resolveAdminPasswordHash(env: RuntimeEnv) {
  const encodedHash = env.ADMIN_PASSWORD_HASH_B64?.trim();

  if (encodedHash) {
    return normalizeAdminPasswordHash(
      Buffer.from(encodedHash, "base64").toString("utf8"),
    );
  }

  return normalizeAdminPasswordHash(env.ADMIN_PASSWORD_HASH ?? "");
}

function parseEnv<T>(
  schema: z.ZodType<T>,
  env: RuntimeEnv,
  keys: readonly string[],
) {
  const parsed = schema.safeParse(
    Object.fromEntries(keys.map((key) => [key, env[key]])),
  );

  if (parsed.success) {
    return parsed.data;
  }

  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid admin environment: ${details}`);
}

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;

export function getDatabaseEnv(env: RuntimeEnv = process.env): DatabaseEnv {
  return parseEnv(databaseEnvSchema, env, ["DATABASE_URL"]);
}

export function getDatabaseUrl(env: RuntimeEnv = process.env) {
  return getDatabaseEnv(env).DATABASE_URL;
}

export function getAuthEnv(env: RuntimeEnv = process.env): AuthEnv {
  const resolvedEnv = {
    ...env,
    ADMIN_PASSWORD_HASH: resolveAdminPasswordHash(env),
  };

  return parseEnv(authEnvSchema, resolvedEnv, [
    "DATABASE_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD_HASH",
    "ADMIN_SESSION_SECRET",
  ]);
}
