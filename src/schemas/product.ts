import { z } from "zod";

export const PRODUCT_STATUS = [
  "DRAFT",
  "AVAILABLE",
  "RESERVED",
  "SOLD",
] as const;
export const PRICE_MODE = ["FIXED", "NEGOTIABLE", "CONTACT"] as const;
export const CURRENCY = ["USD", "DOP"] as const;

export const attributeSchema = z.object({
  label: z.string().trim().min(1, "Requerido").max(40, "Máximo 40 caracteres"),
  value: z
    .string()
    .trim()
    .min(1, "Requerido")
    .max(120, "Máximo 120 caracteres"),
});

export const attributesSchema = z
  .array(attributeSchema)
  .max(20, "Máximo 20 especificaciones")
  .refine(
    (attrs) => {
      const keys = attrs.map((a) => a.label.toLowerCase());
      return new Set(keys).size === keys.length;
    },
    { message: "Las etiquetas de especificaciones deben ser únicas" },
  );

/**
 * Fields required to save a DRAFT — deliberately permissive so the owner
 * can start a listing and finish it later.
 */
export const productDraftSchema = z
  .object({
    title: z.string().trim().min(3).max(140),
    shortDescription: z.string().trim().max(200).optional().nullable(),
    description: z.string().trim().max(4000).optional().nullable(),
    type: z.string().trim().min(2).max(60),
    price: z.number().nonnegative().nullable(),
    currency: z.enum(CURRENCY),
    priceMode: z.enum(PRICE_MODE),
    location: z.string().trim().max(120).optional().nullable(),
    showLocation: z.boolean().default(false),
    locationLatitude: z.number().min(-90).max(90).nullable().optional(),
    locationLongitude: z.number().min(-180).max(180).nullable().optional(),
    featured: z.boolean(),
    attributes: attributesSchema,
  })
  .superRefine((data, ctx) => {
    const hasLatitude = data.locationLatitude != null;
    const hasLongitude = data.locationLongitude != null;

    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona un punto completo en el mapa",
        path: [hasLatitude ? "locationLongitude" : "locationLatitude"],
      });
    }
  })
  .refine((data) => data.priceMode === "CONTACT" || data.price !== null, {
    message: "El precio es obligatorio salvo en modo 'A consultar'",
    path: ["price"],
  });

export type ProductDraftInput = z.infer<typeof productDraftSchema>;

/**
 * The publication contract (spec §19). A product cannot transition to
 * AVAILABLE unless every one of these holds — enforced server-side in the
 * publish Server Action, never merely by a disabled frontend button.
 */
export const publicationContractSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().min(3),
  type: z.string().trim().min(2),
  description: z.string().trim().min(20, "Añade una descripción más completa"),
  priceMode: z.enum(PRICE_MODE),
  price: z.number().nonnegative().nullable(),
  imageCount: z.number().int().min(1, "Sube al menos una imagen"),
  hasCoverImage: z.literal(true, {
    error: "Selecciona una imagen de portada",
  }),
});

export const productFilterSchema = z.object({
  q: z.string().trim().max(120).optional(),
  tipo: z.string().trim().max(60).optional(),
  lugar: z.string().trim().max(120).optional(),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
  orden: z
    .enum(["recientes", "precio-asc", "precio-desc"])
    .default("recientes"),
  vendidos: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
