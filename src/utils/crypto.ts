/**
 * Cryptographic utility for securing Admin Password using SHA-256 hashing.
 * The raw plaintext password is never exposed or saved.
 */
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  const msgUint8 = new TextEncoder().encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
