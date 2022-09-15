import { encrypt, decrypt } from "./encryption";

test("encrypt/decrypt", async () => {
  const secret = "testsecret";
  const original = "testpayload";
  const encrypted = await encrypt(original, secret);
  const decrypted = await decrypt(encrypted, secret);
  expect(decrypted).toBe(original);
});
