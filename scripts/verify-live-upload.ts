import { chromium } from "@playwright/test";
import path from "node:path";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let productUrl = "";

  try {
    await page.goto("http://localhost:3000/admin/login");
    await page.getByLabel("Correo").fill("dev@altamar.local");
    await page.getByLabel("Contraseña").fill("DevPassword123!");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.waitForURL(/\/admin$/, { timeout: 15_000 });

    await page.goto("http://localhost:3000/admin/productos/nuevo");
    await page.getByLabel("Título").fill("Producto Verificacion Real Cloudinary");
    await page.getByLabel("Tipo").fill("Artículo");
    await page.getByLabel("Precio").fill("50");
    await page.getByRole("button", { name: "Crear borrador" }).click();
    await page.waitForURL(/\/admin\/productos\/[0-9a-f-]+$/, { timeout: 15_000 });
    productUrl = page.url();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(__dirname, "..", "tests", "fixtures", "test-upload.jpg"),
    );

    // Real upload: must NOT show the provider-rejection error, and must show
    // the image actually persisted (no more "Aún no hay imágenes" placeholder).
    const errorText = page.getByText(/Cloudinary rechaz/);
    const placeholder = page.getByText(
      "Aún no hay imágenes. La portada será la primera que subas.",
    );

    await page.waitForTimeout(1000);
    const hasError = await errorText.isVisible().catch(() => false);
    if (hasError) {
      throw new Error("Upload showed a Cloudinary rejection error — not a real success.");
    }

    await placeholder.waitFor({ state: "hidden", timeout: 20_000 });

    const img = page.locator('img[src*="res.cloudinary.com"]').first();
    await img.waitFor({ state: "visible", timeout: 20_000 });
    const src = await img.getAttribute("src");
    if (!src || !src.includes("cloudinary")) {
      throw new Error(`Persisted image src does not look like a real Cloudinary URL: ${src}`);
    }

    console.log("SUCCESS: real image uploaded, verified, and rendered from Cloudinary.");
    console.log("Image src:", src);
  } finally {
    if (productUrl) {
      await page.getByRole("button", { name: "Eliminar producto" }).click().catch(() => {});
      await page.getByRole("button", { name: "Sí, eliminar" }).click().catch(() => {});
    }
    await browser.close();
  }
}

main().catch((err) => {
  console.error("FAILURE:", err.message);
  process.exit(1);
});
