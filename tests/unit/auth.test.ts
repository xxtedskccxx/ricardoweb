import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

const SECRET = "a-secure-test-secret-that-is-long-enough-123456";

describe("admin password hashing", () => {
  it("hashes and verifies the original password", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).not.toContain("correct horse");
    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
  });
});

describe("admin session tokens", () => {
  it("round-trips the minimal admin session", async () => {
    const token = await createSessionToken(
      { sub: "admin-id", email: "owner@example.com" },
      SECRET,
    );

    await expect(verifySessionToken(token, SECRET)).resolves.toMatchObject({
      sub: "admin-id",
      email: "owner@example.com",
      role: "admin",
    });
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createSessionToken(
      { sub: "admin-id", email: "owner@example.com" },
      SECRET,
    );

    await expect(
      verifySessionToken(token, "another-secure-secret-that-is-long-enough"),
    ).resolves.toBeNull();
  });
});
