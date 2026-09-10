import { describe, expect, it, vi, afterEach } from "vitest";
import {
  signParams,
  buildProductFolderPath,
  verifyCloudinaryResource,
  destroyCloudinaryResource,
  InvalidImageError,
  type CloudinaryCredentials,
} from "@/lib/cloudinary/core";

const creds: CloudinaryCredentials = {
  cloudName: "test-cloud",
  apiKey: "test-key",
  apiSecret: "test-secret",
};

describe("signParams", () => {
  it("is deterministic for the same input", () => {
    const a = signParams("folder=x&timestamp=123", "secret");
    const b = signParams("folder=x&timestamp=123", "secret");
    expect(a).toBe(b);
  });

  it("produces a different signature for a different secret", () => {
    const a = signParams("folder=x&timestamp=123", "secret-a");
    const b = signParams("folder=x&timestamp=123", "secret-b");
    expect(a).not.toBe(b);
  });

  it("produces a different signature for different params", () => {
    const a = signParams("folder=x&timestamp=123", "secret");
    const b = signParams("folder=y&timestamp=123", "secret");
    expect(a).not.toBe(b);
  });

  it("never contains the secret itself in its output", () => {
    const secret = "super-secret-value";
    const sig = signParams("folder=x&timestamp=123", secret);
    expect(sig).not.toContain(secret);
  });
});

describe("buildProductFolderPath", () => {
  it("is deterministic for the same product id", () => {
    const a = buildProductFolderPath("altamar/dev", "product-1");
    const b = buildProductFolderPath("altamar/dev", "product-1");
    expect(a).toBe(b);
  });

  it("differs for different product ids", () => {
    const a = buildProductFolderPath("altamar/dev", "product-1");
    const b = buildProductFolderPath("altamar/dev", "product-2");
    expect(a).not.toBe(b);
  });

  it("nests under products/<id>", () => {
    expect(buildProductFolderPath("altamar/dev", "abc")).toBe(
      "altamar/dev/products/abc",
    );
  });
});

describe("verifyCloudinaryResource", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces Cloudinary's real error message on a failed fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        clone: () => ({
          json: async () => ({ error: { message: "Unknown API key placeholder" } }),
        }),
      }),
    );

    await expect(
      verifyCloudinaryResource(creds, "some-public-id"),
    ).rejects.toThrow(/Unknown API key placeholder/);
  });

  it("rejects an unsupported format and does not persist it", async () => {
    const destroyFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/destroy")) return destroyFetch();
        return Promise.resolve({
          ok: true,
          json: async () => ({
            public_id: "x",
            width: 800,
            height: 600,
            format: "bmp",
            bytes: 1000,
          }),
        });
      }),
    );

    await expect(verifyCloudinaryResource(creds, "x")).rejects.toThrow(
      InvalidImageError,
    );
    expect(destroyFetch).toHaveBeenCalled();
  });

  it("rejects an oversized image", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/destroy")) {
          return Promise.resolve({ ok: true });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            public_id: "x",
            width: 800,
            height: 600,
            format: "jpg",
            bytes: 20 * 1024 * 1024,
          }),
        });
      }),
    );

    await expect(verifyCloudinaryResource(creds, "x")).rejects.toThrow(
      /tamaño máximo/,
    );
  });

  it("rejects zero-dimension metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/destroy")) {
          return Promise.resolve({ ok: true });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            public_id: "x",
            width: 0,
            height: 0,
            format: "jpg",
            bytes: 1000,
          }),
        });
      }),
    );

    await expect(verifyCloudinaryResource(creds, "x")).rejects.toThrow(
      /dimensiones válidas/,
    );
  });

  it("accepts a valid resource and returns its real metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          public_id: "altamar/dev/products/p1/photo",
          width: 1920,
          height: 1080,
          format: "JPG",
          bytes: 500_000,
        }),
      }),
    );

    const result = await verifyCloudinaryResource(creds, "photo");
    expect(result).toEqual({
      publicId: "altamar/dev/products/p1/photo",
      width: 1920,
      height: 1080,
      format: "jpg",
      bytes: 500_000,
    });
  });
});

describe("destroyCloudinaryResource", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true when Cloudinary confirms deletion", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    await expect(destroyCloudinaryResource(creds, "x")).resolves.toBe(true);
  });

  it("returns false (not throw) when Cloudinary rejects deletion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        clone: () => ({ json: async () => ({ error: { message: "not found" } }) }),
      }),
    );
    await expect(destroyCloudinaryResource(creds, "x")).resolves.toBe(false);
  });
});
