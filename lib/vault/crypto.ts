/**
 * FindMyCampus Sovereign Cryptographic Engine
 * 100% On-Device Web Crypto API (AES-GCM-256 + SHA-256)
 * Zero Cloud Transmission · Host-Machine Bound
 */

const KEY_STORAGE_NAME = "findmycampus_vault_master_key";
const ALGORITHM_NAME = "AES-GCM";
const KEY_LENGTH = 256;

let cachedKey: CryptoKey | null = null;

/**
 * Retrieves or creates a persistent AES-GCM-256 master key in local storage.
 * Exported securely as JWK to preserve device sovereignty across reloads.
 */
export async function getOrCreateVaultKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API is only available in secure browser contexts.");
  }

  try {
    const storedJwk = localStorage.getItem(KEY_STORAGE_NAME);
    if (storedJwk) {
      const jwk = JSON.parse(storedJwk);
      const importedKey = await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: ALGORITHM_NAME, length: KEY_LENGTH },
        false,
        ["encrypt", "decrypt"]
      );
      cachedKey = importedKey;
      return importedKey;
    }
  } catch (err) {
    console.warn("Failed to load existing vault key, generating fresh key:", err);
  }

  // Generate a brand new 256-bit AES-GCM key
  const newKey = await window.crypto.subtle.generateKey(
    { name: ALGORITHM_NAME, length: KEY_LENGTH },
    true, // extractable for local persistence
    ["encrypt", "decrypt"]
  );

  try {
    const exportedJwk = await window.crypto.subtle.exportKey("jwk", newKey);
    localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(exportedJwk));
  } catch (err) {
    console.error("Failed to store vault key to local storage:", err);
  }

  cachedKey = newKey;
  return newKey;
}

/**
 * Computes a cryptographic SHA-256 checksum (hex string) for a given binary buffer.
 */
export async function calculateSHA256(buffer: ArrayBuffer): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API is not available.");
  }
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Encrypts an ArrayBuffer payload with AES-GCM-256 using a fresh 96-bit (12-byte) IV.
 * Also computes the original plaintext SHA-256 checksum for tamper-proof verification.
 */
export async function encryptDocument(
  fileBuffer: ArrayBuffer
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array; checksum: string }> {
  const key = await getOrCreateVaultKey();

  // 12-byte (96-bit) standard IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Compute checksum of the plaintext before encryption
  const checksum = await calculateSHA256(fileBuffer);

  // Authenticated encryption
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM_NAME,
      iv: iv as BufferSource,
    },
    key,
    fileBuffer
  );

  return { ciphertext, iv, checksum };
}

/**
 * Decrypts an AES-GCM-256 ciphertext buffer using the stored IV and key.
 * Throws an error if authentication tag verification fails (tampered payload).
 */
export async function decryptDocument(
  ciphertext: ArrayBuffer,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const key = await getOrCreateVaultKey();

  return await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM_NAME,
      iv: iv as BufferSource,
    },
    key,
    ciphertext
  );
}

/**
 * Validates whether a decrypted buffer's SHA-256 matches its registered checksum.
 */
export async function verifyChecksum(
  buffer: ArrayBuffer,
  expectedChecksum: string
): Promise<boolean> {
  const computed = await calculateSHA256(buffer);
  return computed.toLowerCase() === expectedChecksum.toLowerCase();
}

