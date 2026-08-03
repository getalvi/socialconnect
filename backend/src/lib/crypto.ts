import crypto from "crypto";

// MASTER_KEY must be a 32-byte value, base64 or hex encoded, set as an env var.
// Generate one with: openssl rand -base64 32
function getKey(): Buffer {
  const raw = process.env.MASTER_KEY;
  if (!raw) {
    throw new Error(
      "MASTER_KEY env var is not set. Generate one with `openssl rand -base64 32` and set it in your backend environment."
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("MASTER_KEY must decode to exactly 32 bytes (base64-encoded).");
  }
  return key;
}

// Encrypts a JS object into a single string: iv:authTag:ciphertext (all base64)
export function encryptCredential(data: unknown): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(data), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decryptCredential<T = Record<string, any>>(encrypted: string): T {
  const key = getKey();
  const [ivB64, tagB64, dataB64] = encrypted.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}
