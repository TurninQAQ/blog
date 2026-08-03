import { getAuthEnv } from "../src/lib/auth/env";
import { prisma } from "../src/lib/db/prisma";

const { ADMIN_EMAIL } = getAuthEnv();

const adminUser = await prisma.adminUser.upsert({
  where: {
    email: ADMIN_EMAIL,
  },
  update: {},
  create: {
    email: ADMIN_EMAIL,
  },
});

const cleanup = await prisma.adminUser.deleteMany({
  where: {
    email: {
      not: ADMIN_EMAIL,
    },
  },
});

await prisma.$disconnect();

console.log(
  JSON.stringify({
    adminEmail: adminUser.email,
    removedExtraAdmins: cleanup.count,
  }),
);
