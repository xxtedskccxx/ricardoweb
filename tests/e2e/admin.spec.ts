import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "dev@altamar.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "DevPassword123!";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill(ADMIN_EMAIL);
  await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
}

test.describe("Admin — authentication boundary", () => {
  test("unauthenticated visitor is redirected away from /admin", async ({ page }) => {
    await page.goto("/admin/productos");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("invalid credentials show a generic error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Correo").fill("nobody@example.com");
    await page.getByLabel("Contraseña").fill("wrong-password");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("valid admin can log in and reach the dashboard", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
  });

  test("logout clears the session and re-blocks /admin", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin/productos");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("Admin — product lifecycle", () => {
  test("create draft, publication is rejected until requirements are met, then delete", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/admin/productos/nuevo");
    await page.getByLabel("Título").fill("Producto E2E Temporal");
    await page.getByLabel("Tipo").fill("Artículo");
    await page.getByLabel("Precio").fill("100");
    await page.getByRole("button", { name: "Crear borrador" }).click();

    await expect(page).toHaveURL(/\/admin\/productos\/[0-9a-f-]+$/, {
      timeout: 15_000,
    });
    await expect(page.getByText("Borrador")).toBeVisible();

    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText(/No se puede publicar/)).toBeVisible();
    await expect(page.getByText(/Sube al menos una imagen/)).toBeVisible();

    await page.getByRole("button", { name: "Eliminar producto" }).click();
    await expect(
      page.getByRole("heading", { name: /Eliminar/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await expect(page).toHaveURL(/\/admin\/productos$/);
    await expect(page.getByText("Producto E2E Temporal")).not.toBeVisible();
  });

  test("status transitions on an existing product", async ({ page }) => {
    await login(page);
    await page.goto("/admin/productos");
    await page.getByRole("link", { name: /Toyota Land Cruiser 300/ }).click();
    await expect(
      page.getByRole("heading", { name: /Toyota Land Cruiser 300/ }),
    ).toBeVisible();

    // Normalize to a known baseline first — there is no per-test DB reset,
    // so a prior run may have left this seeded product in any status.
    const availableButton = page.getByRole("button", { name: "Marcar disponible" });
    if (await availableButton.isVisible()) {
      await availableButton.click();
      await expect(page.getByText("Disponible").first()).toBeVisible();
    }

    await page.getByRole("button", { name: "Marcar reservado" }).click();
    await expect(page.getByText("Reservado").first()).toBeVisible();

    await page.getByRole("button", { name: "Marcar disponible" }).click();
    await expect(page.getByText("Disponible").first()).toBeVisible();
  });
});

test.describe("Admin — responsive layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("dashboard and editor fit mobile without page overflow", async ({ page }) => {
    await login(page);

    for (const route of ["/admin", "/admin/productos", "/admin/productos/nuevo"]) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${route} should not overflow horizontally`).toBe(false);
    }
  });
});
