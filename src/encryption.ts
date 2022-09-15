let _crypto: Crypto;

(async () => {
  if (typeof crypto === "undefined") {
    const { webcrypto } = await import("node:crypto");
    _crypto = webcrypto as Crypto;
  } else {
    _crypto = global.crypto;
  }
})();

/**
 * Implementation of symmetric encryption/decryption of string values. Blatantly ripped off from:
 * @see https://github.com/bradyjoslin/webcrypto-example/blob/master/script.js
 */

async function getSecretKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return _crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
}

async function deriveKey(
  key: CryptoKey,
  salt: BufferSource,
  keyUsage: KeyUsage[],
): Promise<CryptoKey> {
  return _crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    { name: "AES-GCM", length: 256 },
    false,
    keyUsage,
  );
}

/**
 * Symmetrically encrypt any string value with AES-256-GCM.
 *
 * @param data Value to encrypt.
 * @param secret AES secret.
 * @returns AES cipher text which can be used to decrypt the original value.
 */
export async function encrypt(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = _crypto.getRandomValues(new Uint8Array(16));
  const iv = _crypto.getRandomValues(new Uint8Array(12));

  const secretKey = await getSecretKey(secret);
  const aesKey = await deriveKey(secretKey, salt, ["encrypt"]);

  const encrypted = await _crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoder.encode(data),
  );
  const encryptedContentArr = new Uint8Array(encrypted);

  const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContentArr.byteLength);
  buffer.set(salt, 0);
  buffer.set(iv, salt.byteLength);
  buffer.set(encryptedContentArr, salt.byteLength + iv.byteLength);

  return btoa(String.fromCharCode.apply(null, buffer as unknown as number[]));
}

/**
 * OperationError:
 *  Decryption failed.
 *  This could be due to a ciphertext authentication failure, bad padding, incorrect CryptoKey, or another algorithm-specific reason.
 *  Input length was 100, output length expected to be 100 for AES-GCM
 */

/**
 * Symmetrically decrypt any string value with AES-256-GCM.
 *
 * @param encrypted AES cipher text.
 * @param secret AES secret.
 * @returns Original decrypted value.
 */
export async function decrypt(encrypted: string, secret: string): Promise<string> {
  const decoder = new TextDecoder();
  // const encryptedBuf = Buffer.from(encrypted, "base64").toString();
  // const encryptedBuf = Buffer.from(encrypted, "base64").toString("ascii");
  const encryptedBuf = Buffer.from(encrypted, "base64").toString("binary");
  // const encryptedBuf = atob(encrypted);
  const buffer = Uint8Array.from(encryptedBuf, (c) => c.charCodeAt(0));
  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 16 + 12);
  const data = buffer.slice(16 + 12);

  const secretKey = await getSecretKey(secret);
  const aesKey = await deriveKey(secretKey, salt, ["decrypt"]);
  const decrypted = await _crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    data,
  );
  return decoder.decode(decrypted);
}
