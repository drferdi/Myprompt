// Drferdi Transformer Engine V2 — API Key Encryption (AES-256-GCM)
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const HEX_KEY_PATTERN = /^[0-9a-fA-F]{64}$/

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY environment variable is required')

  if (HEX_KEY_PATTERN.test(key)) {
    return Buffer.from(key, 'hex')
  }

  return createHash('sha256').update(key, 'utf8').digest()
}

export function encrypt(plaintext: string): {
  encrypted: string
  iv: string
  authTag: string
} {
  const key = getEncryptionKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  }
}

export function decrypt(encrypted: string, iv: string, authTag: string): string {
  const key = getEncryptionKey()
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
