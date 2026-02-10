import * as crypto from 'crypto';

export class CFB8Cipher {
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(key: Buffer, iv: Buffer) {
    this.key = key;
    this.iv = Buffer.from(iv);
  }

  public update(buffer: Buffer): Buffer {
    const output = Buffer.allocUnsafe(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const cipher = crypto.createCipheriv('aes-256-ecb', this.key, null);
      cipher.setAutoPadding(false);
      const encryptedIv = cipher.update(this.iv);

      output[i] = buffer[i] ^ encryptedIv[0];

      this.iv.copy(this.iv, 0, 1);
      this.iv[15] = output[i];
    }
    return output;
  }
}
