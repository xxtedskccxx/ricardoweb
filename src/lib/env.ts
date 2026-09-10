import "server-only";
import { z } from "zod";

/**
 * Server-only environment — the `server-only` import makes this a build
 * error if any Client Component ever imports it, not just a convention. It
 * is the single place SUPABASE_SERVICE_ROLE_KEY and CLOUDINARY_API_SECRET
 * are read.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_FOLDER: z.string().min(1).default("altamar/dev"),
});

let cached: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(
      `Missing or invalid environment variables: ${missing}. Copy .env.example to .env.local and fill in real values.`,
    );
  }

  cached = parsed.data;
  return cached;
}
