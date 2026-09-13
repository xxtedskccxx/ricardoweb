import { jwtVerify, SignJWT } from "jose";

const SESSION_AGE_SECONDS = 60 * 60 * 8;

export interface AdminSession {
  sub: string;
  email: string;
  role: "admin";
}

function secretKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  session: Pick<AdminSession, "sub" | "email">,
  secret: string,
  now = new Date(),
): Promise<string> {
  return new SignJWT({ email: session.email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt(Math.floor(now.getTime() / 1000))
    .setExpirationTime(Math.floor(now.getTime() / 1000) + SESSION_AGE_SECONDS)
    .sign(secretKey(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      payload.role !== "admin"
    ) {
      return null;
    }
    return { sub: payload.sub, email: payload.email, role: "admin" };
  } catch {
    return null;
  }
}

export { SESSION_AGE_SECONDS };
