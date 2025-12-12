import * as crypto from 'crypto';

export class CFB8Decipher {
  private readonly key: Buffer;
  private readonly iv: Buffer;
  private savedIv: Buffer | null = null;

  constructor(key: Buffer, iv: Buffer) {
    this.key = key;
    this.iv = Buffer.from(iv);
  }

  public save() {
    this.savedIv = Buffer.from(this.iv);
  }

  public restore() {
    if (!this.savedIv) throw new Error('No saved state');
    this.savedIv.copy(this.iv);
  }

  public update(buffer: Buffer): Buffer {
    const output = Buffer.allocUnsafe(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const cipher = crypto.createCipheriv('aes-256-ecb', this.key, null);
      cipher.setAutoPadding(false);
      const encryptedIv = cipher.update(this.iv);

      output[i] = buffer[i] ^ encryptedIv[0];

      this.iv.copy(this.iv, 0, 1);
      this.iv[15] = buffer[i];
    }
    return output;
  }
}
