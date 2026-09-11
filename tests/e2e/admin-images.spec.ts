import { test, expect } from "@playwright/test";
import path from "node:path";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill("dev@altamar.local");
  await page.getByLabel("Contraseña").fill("DevPassword123!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
}

test.describe("Admin — image upload error handling", () => {
  test("a real image uploads successfully, verifies, and persists as the cover", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Título").fill("Producto E2E Imágenes");
    await page.getByLabel("Tipo").fill("Artículo");
    await page.getByLabel("Precio").fill("50");
    await page.getByRole("button", { name: "Crear borrador" }).click();
    await expect(page).toHaveURL(/\/admin\/productos\/[0-9a-f-]+$/, {
      timeout: 15_000,
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(__dirname, "..", "fixtures", "test-upload.jpg"),
    );

    // Real signed upload to Cloudinary + server-side Admin API
    // re-verification must succeed: the empty-gallery placeholder is
    // replaced by a real persisted cover image, with no provider error.
    await expect(
      page.getByText("Aún no hay imágenes. La portada será la primera que subas."),
    ).toBeHidden({ timeout: 20_000 });
    await expect(page.getByText(/Cloudinary rechaz/)).not.toBeVisible();
    await expect(page.getByText("Portada")).toBeVisible();

    const img = page.locator('img[src*="res.cloudinary.com"]').first();
    await expect(img).toBeVisible();

    // Clean up the temporary product.
    await page.getByRole("button", { name: "Eliminar producto" }).click();
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await expect(page).toHaveURL(/\/admin\/productos$/);
  });

  test("a file that isn't really an image is rejected with Cloudinary's real error, not a crash, and leaves no broken row", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Título").fill("Producto E2E Archivo Invalido");
    await page.getByLabel("Tipo").fill("Artículo");
    await page.getByLabel("Precio").fill("50");
    await page.getByRole("button", { name: "Crear borrador" }).click();
    await expect(page).toHaveURL(/\/admin\/productos\/[0-9a-f-]+$/, {
      timeout: 15_000,
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(__dirname, "..", "fixtures", "invalid-file.png"),
    );

    // Cloudinary itself rejects the non-image payload — the client must
    // surface that real provider error, not a generic failure string.
    const errorText = page.getByText(/Cloudinary rechaz/);
    await expect(errorText).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText("Aún no hay imágenes. La portada será la primera que subas."),
    ).toBeVisible();

    // Retry must be present and clickable without throwing.
    const retryButton = page.getByRole("button", { name: "Reintentar" });
    await expect(retryButton).toBeVisible();
    await retryButton.click();
    await expect(errorText).toBeVisible({ timeout: 15_000 });

    // Clean up the temporary product.
    await page.getByRole("button", { name: "Eliminar producto" }).click();
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await expect(page).toHaveURL(/\/admin\/productos$/);
  });

  test("client-side rejects an oversized file before ever contacting Cloudinary", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Título").fill("Producto E2E Tamaño");
    await page.getByLabel("Tipo").fill("Artículo");
    await page.getByLabel("Precio").fill("50");
    await page.getByRole("button", { name: "Crear borrador" }).click();
    await expect(page).toHaveURL(/\/admin\/productos\/[0-9a-f-]+$/, {
      timeout: 15_000,
    });

    const fileInput = page.locator('input[type="file"]');
    const oversized = Buffer.alloc(16 * 1024 * 1024, 1);
    await fileInput.setInputFiles({
      name: "too-big.jpg",
      mimeType: "image/jpeg",
      buffer: oversized,
    });

    await expect(page.getByText(/Supera el tamaño máximo/)).toBeVisible();

    await page.getByRole("button", { name: "Eliminar producto" }).click();
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await expect(page).toHaveURL(/\/admin\/productos$/);
  });
});
