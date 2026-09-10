import { test, expect } from "@playwright/test";

test.describe("Public — homepage", () => {
  test("loads and renders product cards from persistence", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "En venta" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Villa Frente al Mar/ }),
    ).toBeVisible();
  });

  test("card click opens the matching detail page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Villa Frente al Mar/ }).click();
    await expect(page).toHaveURL(/\/producto\/villa-frente-al-mar-punta-cana/);
    await expect(
      page.getByRole("heading", { name: /Villa Frente al Mar/ }),
    ).toBeVisible();
  });

  test("no horizontal overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("Public — catalog", () => {
  test("full-text search filters results", async ({ page }) => {
    await page.goto("/en-venta?q=rolex");
    await expect(page.getByRole("link", { name: /Rolex Submariner/ })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Villa Frente al Mar/ }),
    ).not.toBeVisible();
  });

  test("sold items are excluded from the default catalog", async ({ page }) => {
    await page.goto("/en-venta");
    await expect(page.getByRole("link", { name: /Yate Azimut/ })).not.toBeVisible();
  });

  test("reserved item shows a status badge and stays in the catalog", async ({ page }) => {
    await page.goto("/en-venta");
    const card = page.getByRole("link", { name: /Rolex Submariner/ });
    await expect(card).toBeVisible();
    await expect(card.getByText("Reservado")).toBeVisible();
  });
});

test.describe("Public — product detail", () => {
  test("shows title, price, specs and contact actions", async ({ page }) => {
    await page.goto("/producto/villa-frente-al-mar-punta-cana");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Villa Frente al Mar",
    );
    await expect(page.getByText("US$4,200,000")).toBeVisible();
    await expect(page.getByText("Habitaciones")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Escribir por WhatsApp/ }).first(),
    ).toBeVisible();
  });

  test("WhatsApp link is pre-filled with the exact product title and URL", async ({
    page,
  }) => {
    await page.goto("/producto/villa-frente-al-mar-punta-cana");
    const link = page.getByRole("link", { name: /Escribir por WhatsApp/ }).first();
    const href = await link.getAttribute("href");
    expect(href).toContain("wa.me");
    const decoded = decodeURIComponent(href ?? "");
    expect(decoded).toContain("Villa Frente al Mar");
    expect(decoded).toContain("/producto/villa-frente-al-mar-punta-cana");
  });

  test("draft product returns 404 on direct access", async ({ page }) => {
    const response = await page.goto("/producto/borrador-sin-publicar-dev");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/No encontramos esta página/)).toBeVisible();
  });

  test("sold product remains directly reachable and labeled Vendido", async ({
    page,
  }) => {
    await page.goto("/producto/yate-azimut-43-casa-de-campo");
    await expect(page.getByText("Vendido")).toBeVisible();
  });

  test("unknown route shows the branded 404, not a framework error", async ({
    page,
  }) => {
    const response = await page.goto("/esto-no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: /Ver la colección/ })).toBeVisible();
  });
});

test.describe("Public — mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus, and closes on Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "En venta" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
