import crypto from "crypto";
import env from "env-var";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  created_at: Date;
}

const tokenStore = new Map<string, StoredTokens>();

export class TokenService {
  private static readonly ENCRYPTION_KEY = env
    .get("ENCRYPTION_KEY")
    .default("your-secret-key-32-chars-long")
    .asString();

  static generateSessionId(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private static getEncryptionKey(): Buffer {
    return crypto.pbkdf2Sync(this.ENCRYPTION_KEY, "salt", 100000, 32, "sha256");
  }

  private static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  private static decrypt(encrypted: string): string {
    const [ivHex, encryptedData] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = this.getEncryptionKey();
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  static storeTokens(
    sessionId: string,
    tokens: Omit<StoredTokens, "created_at">
  ): void {
    const encryptedTokens: StoredTokens = {
      access_token: this.encrypt(tokens.access_token),
      refresh_token: this.encrypt(tokens.refresh_token),
      expires_in: tokens.expires_in,
      created_at: new Date(),
    };

    tokenStore.set(sessionId, encryptedTokens);
  }

  static getTokens(sessionId: string): Omit<StoredTokens, "created_at"> | null {
    const encryptedTokens = tokenStore.get(sessionId);
    if (!encryptedTokens) return null;

    return {
      access_token: this.decrypt(encryptedTokens.access_token),
      refresh_token: this.decrypt(encryptedTokens.refresh_token),
      expires_in: encryptedTokens.expires_in,
    };
  }

  static removeTokens(sessionId: string): void {
    tokenStore.delete(sessionId);
  }

  static hasTokens(sessionId: string): boolean {
    return tokenStore.has(sessionId);
  }
}
