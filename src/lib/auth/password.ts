import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function deriveKey(password: string, salt: Buffer, options: { N: number; r: number; p: number; maxmem: number }, length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, length, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived as Buffer);
    });
  });
}

/** Store a self-contained scrypt hash. The plaintext password never leaves this module. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 128 * COST * BLOCK_SIZE + 1024 * 1024,
  }, KEY_LENGTH);

  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  const [algorithm, costRaw, blockSizeRaw, parallelRaw, saltRaw, hashRaw] =
    encodedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !costRaw ||
    !blockSizeRaw ||
    !parallelRaw ||
    !saltRaw ||
    !hashRaw
  ) {
    return false;
  }

  const cost = Number(costRaw);
  const blockSize = Number(blockSizeRaw);
  const parallelization = Number(parallelRaw);
  if (
    !Number.isInteger(cost) ||
    !Number.isInteger(blockSize) ||
    !Number.isInteger(parallelization) ||
    cost < 1_024 ||
    cost > 131_072 ||
    blockSize < 1 ||
    blockSize > 32 ||
    parallelization < 1 ||
    parallelization > 8
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(saltRaw, "base64url");
    const expected = Buffer.from(hashRaw, "base64url");
    if (salt.length < 16 || expected.length !== KEY_LENGTH) return false;

    const actual = await deriveKey(password, salt, {
      N: cost,
      r: blockSize,
      p: parallelization,
      maxmem: 128 * cost * blockSize + 1024 * 1024,
    }, expected.length);

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
