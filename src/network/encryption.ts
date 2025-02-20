import * as crypto from 'crypto';
import { EncryptionMode } from '../enums';
import type { Cipher, Decipher, ECDH } from 'crypto';


const algorithmMap: Record<EncryptionMode, string> = {
  [EncryptionMode.Aes256cfb]: 'aes-256-cfb',
  [EncryptionMode.Aes256cfb8]: 'aes-256-cfb8',
  [EncryptionMode.Aes256cfb128]: 'aes-256-cfb',
}

const asn1Header = Buffer.from('3076301006072a8648ce3d020106052b81040022036200', 'hex');

/**
 * Thanks to: {@link https://github.com/mcpews/mcpews/blob/master/src/lib/encrypt.ts}
 */
export class Encryption {
  public readonly ecdh: ECDH = crypto.createECDH('secp384r1');
  public readonly publicKey: Buffer = this.ecdh.generateKeys();

  public cipher: Cipher | null = null;
  public decipher: Decipher | null = null;
  
  private _enabled: boolean = false;

  public get enabled(): boolean {
    return this._enabled;
  }

  public initialize(mode: EncryptionMode, secretKey: Buffer, salt: Buffer) {   
    const key = this.hashBuffer('sha256', Buffer.concat([salt, secretKey]));
    const initialVector = key.subarray(0, 16);
    const algorithm = algorithmMap[mode];

    this.cipher = crypto.createCipheriv(algorithm, key, initialVector);
    this.decipher = crypto.createDecipheriv(algorithm, key, initialVector);
    this.cipher.setAutoPadding(false);
    this.decipher.setAutoPadding(false);

    this._enabled = true;
  }

  public encrypt(data: string): Buffer {
    if (!this.cipher) throw new Error('Encryption is not initialized');

    return this.cipher.update(data, 'utf-8');
  }

  public decrypt(data: Buffer): string {
    if (!this.decipher) throw new Error('Encryption is not initialized');

    return this.decipher.update(data).toString('utf-8');
  }

  public beginKeyExchange() {
    const salt = crypto.randomBytes(16);
    
    return {
      publicKey: this.toOpenSSLKey(this.publicKey).toString('base64'),
      salt: salt.toString('base64'),
      complete: (mode: EncryptionMode, clientPublicKey: string) => {
        const secretKey = this.ecdh.computeSecret(
          this.fromOpenSSLKey(Buffer.from(clientPublicKey, 'base64'))
        );
        this.initialize(mode, secretKey, salt);
      }
    }
  }

  private hashBuffer(algorithm: string, buffer: Buffer): Buffer {
    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    return hash.digest();
  }

  private toOpenSSLKey(key: Buffer): Buffer {
    return Buffer.concat([asn1Header, key]);
  }

  private fromOpenSSLKey(key: Buffer): Buffer {
    return key.subarray(asn1Header.length);
  }  
}