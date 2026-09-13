/**
 * Local development seed data ONLY. Clearly synthetic — never run against
 * a production database. Point DATABASE_URL at a development Neon branch.
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}
const sql = neon(url);

interface DevProduct {
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  type: string;
  price: number | null;
  currency: "USD" | "DOP";
  price_mode: "FIXED" | "NEGOTIABLE" | "CONTACT";
  location: string | null;
  status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";
  featured: boolean;
  homepage_position: number | null;
  attributes: { label: string; value: string }[];
  published_at: string | null;
}

const DEV_PRODUCTS: DevProduct[] = [
  {
    slug: "villa-frente-al-mar-punta-cana",
    title: "Villa Frente al Mar [DEV]",
    short_description: "Villa contemporánea con acceso privado a la playa.",
    description:
      "Villa contemporánea de dos niveles en Punta Cana con piscina privada, jardín tropical y acceso directo a la playa. Ideal para vivir todo el año o como propiedad vacacional. Datos de desarrollo/demostración — no representan inventario real.",
    type: "Villa",
    price: 4200000,
    currency: "USD",
    price_mode: "FIXED",
    location: "Punta Cana, La Altagracia",
    status: "AVAILABLE",
    featured: true,
    homepage_position: 1,
    attributes: [
      { label: "Habitaciones", value: "5" },
      { label: "Baños", value: "5.5" },
      { label: "Área", value: "650 m²" },
      { label: "Piscina", value: "Privada" },
    ],
    published_at: new Date().toISOString(),
  },
  {
    slug: "toyota-land-cruiser-300-santo-domingo",
    title: "Toyota Land Cruiser 300 [DEV]",
    short_description: "SUV full-size, transmisión automática, muy poco uso.",
    description:
      "Toyota Land Cruiser 300 2023, mantenimiento al día, único dueño, sin choques. Datos de desarrollo/demostración — no representan inventario real.",
    type: "Vehículo",
    price: 125000,
    currency: "USD",
    price_mode: "NEGOTIABLE",
    location: "Santo Domingo",
    status: "AVAILABLE",
    featured: true,
    homepage_position: 2,
    attributes: [
      { label: "Año", value: "2023" },
      { label: "Kilometraje", value: "24,000 km" },
      { label: "Transmisión", value: "Automática" },
      { label: "Combustible", value: "Diésel" },
    ],
    published_at: new Date().toISOString(),
  },
  {
    slug: "rolex-submariner-santo-domingo",
    title: "Rolex Submariner [DEV]",
    short_description: "Excelente condición, caja y papeles incluidos.",
    description:
      "Rolex Submariner en excelente estado, incluye caja original y documentación completa. Datos de desarrollo/demostración — no representan inventario real.",
    type: "Reloj",
    price: 12500,
    currency: "USD",
    price_mode: "FIXED",
    location: "Santo Domingo",
    status: "RESERVED",
    featured: true,
    homepage_position: 3,
    attributes: [
      { label: "Año", value: "2024" },
      { label: "Condición", value: "Excelente" },
      { label: "Incluye", value: "Caja y documentos" },
    ],
    published_at: new Date().toISOString(),
  },
  {
    slug: "terreno-las-terrenas",
    title: "Terreno en Las Terrenas [DEV]",
    short_description: "Terreno plano a 5 minutos de la playa.",
    description:
      "Terreno plano, listo para construcción, ubicado a cinco minutos de la playa en Las Terrenas. Datos de desarrollo/demostración — no representan inventario real.",
    type: "Terreno",
    price: null,
    currency: "USD",
    price_mode: "CONTACT",
    location: "Las Terrenas, Samaná",
    status: "AVAILABLE",
    featured: false,
    homepage_position: null,
    attributes: [
      { label: "Área", value: "1,200 m²" },
      { label: "Uso de suelo", value: "Residencial" },
    ],
    published_at: new Date().toISOString(),
  },
  {
    slug: "yate-azimut-43-casa-de-campo",
    title: "Yate Azimut 43 [DEV]",
    short_description: "Yate deportivo, dos motores, excelente estado.",
    description:
      "Yate Azimut 43 pies, dos motores de 480 HP, mantenimiento reciente. Datos de desarrollo/demostración — no representan inventario real.",
    type: "Yate",
    price: 390000,
    currency: "USD",
    price_mode: "FIXED",
    location: "Marina Casa de Campo, La Romana",
    status: "SOLD",
    featured: false,
    homepage_position: null,
    attributes: [
      { label: "Año", value: "2019" },
      { label: "Motor", value: "2 x 480 HP" },
      { label: "Eslora", value: "43 pies" },
    ],
    published_at: new Date().toISOString(),
  },
  {
    slug: "borrador-sin-publicar-dev",
    title: "Borrador sin publicar [DEV]",
    short_description: null,
    description: null,
    type: "Artículo",
    price: null,
    currency: "USD",
    price_mode: "CONTACT",
    location: null,
    status: "DRAFT",
    featured: false,
    homepage_position: null,
    attributes: [],
    published_at: null,
  },
];

async function main() {
  console.log("Seeding development data (clearly marked [DEV])...");

  for (const product of DEV_PRODUCTS) {
    try {
      await sql`INSERT INTO products (slug,title,short_description,description,type,price,currency,price_mode,location,status,featured,homepage_position,attributes,published_at)
        VALUES (${product.slug},${product.title},${product.short_description},${product.description},${product.type},${product.price},${product.currency},${product.price_mode},${product.location},${product.status},${product.featured},${product.homepage_position},${JSON.stringify(product.attributes)}::jsonb,${product.published_at})
        ON CONFLICT (slug) DO UPDATE SET title=excluded.title,short_description=excluded.short_description,description=excluded.description,type=excluded.type,price=excluded.price,currency=excluded.currency,price_mode=excluded.price_mode,location=excluded.location,status=excluded.status,featured=excluded.featured,homepage_position=excluded.homepage_position,attributes=excluded.attributes,published_at=excluded.published_at`;
      console.log(`  ✓ ${product.title}`);
    } catch (error) {
      console.error(`Failed to seed "${product.slug}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log("Done. Note: no Cloudinary images were attached — configure");
  console.log("real Cloudinary credentials and upload via /admin to see photography.");
}

main().then(() => process.exit(0));
