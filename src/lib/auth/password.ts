import { hash, verify, type Options } from "@node-rs/argon2";

const argon2idAlgorithm = 2;
const argon2Version13 = 1;

const passwordHashOptions = {
  algorithm: argon2idAlgorithm,
  version: argon2Version13,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const satisfies Options;

export async function hashAdminPassword(password: string) {
  if (!password) {
    throw new Error("Admin password must not be empty");
  }

  return hash(password, passwordHashOptions);
}

export async function verifyAdminPassword(
  passwordHash: string,
  password: string,
) {
  if (!passwordHash || !password) {
    return false;
  }

  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}
