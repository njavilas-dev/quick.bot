import { pbkdf2Sync, randomBytes } from 'crypto'

export function crypt(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function verify(password: string, hashedPassword: string): boolean {
  const [salt, originalHash] = hashedPassword.split(':')
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === originalHash
}
