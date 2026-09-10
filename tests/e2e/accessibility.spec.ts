import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill("dev@altamar.local");
  await page.getByLabel("Contraseña").fill("DevPassword123!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
}

test.describe("Accessibility", () => {
  test("homepage has no serious/critical axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("catalog has no serious/critical axe violations", async ({ page }) => {
    await page.goto("/en-venta");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("product detail has no serious/critical axe violations", async ({ page }) => {
    await page.goto("/producto/villa-frente-al-mar-punta-cana");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("admin product form has no serious/critical axe violations", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/admin/productos/nuevo");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
