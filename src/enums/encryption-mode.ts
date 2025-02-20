/**
 * {@link https://github.com/mcpews/mcpews/blob/master/src/lib/protocol.ts}
 */
export enum EncryptionMode {
  Aes256cfb8 = 'cfb8',
  Aes256cfb = 'cfb',
  /** @deprecated Alias of Aes256cfb */
  Aes256cfb128 = 'cfb128',
}