import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { getServerEnv } from "@/lib/env";

let client: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!client) client = neon(getServerEnv().DATABASE_URL);
  return client;
}

export async function dbQuery<T extends object = Record<string, unknown>>(
  queryText: string,
  params: unknown[] = [],
): Promise<T[]> {
  return (await getDb().query(queryText, params)) as unknown as T[];
}
