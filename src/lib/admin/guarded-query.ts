export async function runGuardedQuery<T>(
  authorize: () => Promise<unknown>,
  read: () => Promise<T>,
): Promise<T> {
  await authorize();
  return read();
}
