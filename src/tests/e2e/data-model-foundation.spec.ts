import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

type PackageJson = {
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const root = process.cwd();

function readText(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function readJson<T>(path: string) {
  return JSON.parse(readText(path)) as T;
}

test.describe("Phase 2 data model foundation", () => {
  test("package pins, scripts, and forbidden auth dependencies are correct", () => {
    const pkg = readJson<PackageJson>("package.json");

    expect(pkg.type).toBe("module");
    expect(pkg.dependencies).toMatchObject({
      "@node-rs/argon2": "2.0.2",
      "@prisma/adapter-pg": "7.8.0",
      "@prisma/client": "7.8.0",
      pg: "8.22.0",
      zod: "4.4.3",
    });
    expect(pkg.devDependencies).toMatchObject({
      "@types/pg": "8.20.0",
      prisma: "7.8.0",
      tsx: "4.22.4",
    });

    for (const script of [
      "db:validate",
      "db:generate",
      "db:migrate",
      "admin:hash-password",
      "admin:bootstrap",
    ]) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }

    expect(pkg.dependencies?.["next-auth"]).toBeUndefined();
    expect(pkg.dependencies?.["@auth/prisma-adapter"]).toBeUndefined();
    expect(pkg.devDependencies?.["next-auth"]).toBeUndefined();
    expect(pkg.devDependencies?.["@auth/prisma-adapter"]).toBeUndefined();
  });

  test("Prisma schema captures content taxonomy and single-admin sessions", () => {
    expect(existsSync(join(root, "prisma/schema.prisma"))).toBe(true);

    const schema = readText("prisma/schema.prisma");

    for (const declaration of [
      "enum PublicationStatus",
      "model AdminUser",
      "model AdminSession",
      "model Post",
      "model Tag",
      "model Category",
      "model Series",
      "model PostTag",
    ]) {
      expect(schema).toContain(declaration);
    }

    expect(schema).toContain("email     String         @unique");
    expect(schema).toContain("tokenHash");
    expect(schema).toContain("expiresAt");
    expect(schema).toContain("categoryId");
    expect(schema).toContain("seriesId");
    expect(schema).toContain("seriesOrder");
    expect(schema).toContain("featured     Boolean           @default(false)");
    expect(schema).toContain("@@id([postId, tagId])");
    expect(schema).toContain("slug        String   @unique");
    expect(schema).not.toContain("model Account");
    expect(schema).not.toContain("model VerificationToken");
    expect(schema).not.toContain("role");
  });

  test("Post featured field has migration and generated client support", () => {
    const schema = readText("prisma/schema.prisma");
    const featuredMigration = readText(
      "prisma/migrations/20260706000000_add_post_featured/migration.sql",
    );
    const generatedPostModel = readText("src/generated/prisma/models/Post.ts");
    const generatedNamespace = readText(
      "src/generated/prisma/internal/prismaNamespace.ts",
    );

    expect(schema).toContain("featured     Boolean           @default(false)");
    expect(featuredMigration).toContain(
      'ALTER TABLE "Post" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;',
    );
    expect(featuredMigration).not.toContain("DROP COLUMN");
    expect(featuredMigration).not.toContain("DROP TABLE");
    expect(generatedPostModel).toContain("featured: boolean");
    expect(generatedPostModel).toContain("featured?: boolean");
    expect(generatedNamespace).toContain("featured: 'featured'");
  });

  test("server helpers and env example preserve secret boundaries", () => {
    for (const path of [
      ".env.example",
      "src/lib/db/prisma.ts",
      "src/lib/auth/env.ts",
      "src/lib/auth/password.ts",
      "scripts/generate-admin-password-hash.ts",
      "scripts/bootstrap-admin.ts",
    ]) {
      expect(existsSync(join(root, path))).toBe(true);
    }

    const envExample = readText(".env.example");
    for (const key of [
      "DATABASE_URL",
      "ADMIN_EMAIL",
      "ADMIN_PASSWORD_HASH",
      "ADMIN_SESSION_SECRET",
      "PLAYWRIGHT_ADMIN_PASSWORD",
    ]) {
      expect(envExample).toContain(`${key}=`);
    }
    expect(envExample).not.toContain("phase-2-smoke-password");
    expect(envExample).not.toContain("$argon2");

    const prismaHelper = readText("src/lib/db/prisma.ts");
    expect(prismaHelper).toContain("@/generated/prisma/client");
    expect(prismaHelper).not.toContain("@prisma/client");
    expect(prismaHelper).toContain("PrismaPg");

    const bootstrap = readText("scripts/bootstrap-admin.ts");
    expect(bootstrap).toContain("ADMIN_EMAIL");
    expect(bootstrap).toContain("adminUser.upsert");
    expect(bootstrap).toContain("deleteMany");
  });

  test("local tooling fails closed and avoids argv password leakage", () => {
    const prismaConfig = readText("prisma.config.ts");
    expect(prismaConfig).toContain("DATABASE_URL is required");
    expect(prismaConfig).not.toContain(
      "postgresql://user:password@localhost:5432/personal_tech_lab_blog",
    );

    const hashScript = readText("scripts/generate-admin-password-hash.ts");
    expect(hashScript).toContain("process.stdin");
    expect(hashScript).not.toContain("process.argv");
    expect(hashScript).toContain("printf");
  });
});
