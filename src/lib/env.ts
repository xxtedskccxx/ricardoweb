import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
});

const cloudinaryEnvSchema = z.object({
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_FOLDER: z.string().min(1).default("altamar/dev"),
});

let cachedServer: z.infer<typeof serverEnvSchema> | null = null;
let cachedCloudinary: z.infer<typeof cloudinaryEnvSchema> | null = null;

function parseOrThrow<T>(schema: z.ZodType<T>, message: string): T {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`${message}: ${missing}. Revisa las variables de entorno.`);
  }
  return parsed.data;
}

export function getServerEnv() {
  if (!cachedServer) {
    cachedServer = parseOrThrow(
      serverEnvSchema,
      "Faltan variables de base de datos o autenticación",
    );
  }
  return cachedServer;
}

/** Cloudinary is validated only when an upload or image cleanup is requested. */
export function getCloudinaryEnv() {
  if (!cachedCloudinary) {
    cachedCloudinary = parseOrThrow(
      cloudinaryEnvSchema,
      "Faltan variables de Cloudinary",
    );
  }
  return cachedCloudinary;
}
