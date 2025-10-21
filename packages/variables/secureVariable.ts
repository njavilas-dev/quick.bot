import { env } from '@quickbot.io/env'

const secretKey = typeof window === 'undefined' ? env.ENCRYPTION_SECRET : null

const xorEncrypt = (text: string, key: string): string => {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const keyChar = key[i % key.length]
    const encryptedChar = String.fromCharCode(text.charCodeAt(i) ^ keyChar.charCodeAt(0))
    result += encryptedChar
  }
  return btoa(result)
}

const xorDecrypt = (encryptedText: string, key: string): string => {
  const decodedText = atob(encryptedText)
  let result = ''
  for (let i = 0; i < decodedText.length; i++) {
    const keyChar = key[i % key.length]
    const decryptedChar = String.fromCharCode(decodedText.charCodeAt(i) ^ keyChar.charCodeAt(0))
    result += decryptedChar
  }
  return result
}

export const secureVariable = {
  encrypt: (value: string): string => {
    if (!secretKey) {
      throw new Error('ENCRYPTION_SECRET is not available. Cannot encrypt variable.')
    }
    return xorEncrypt(value, secretKey)
  },
  decrypt: (value: string): string => {
    if (!secretKey) {
      throw new Error('ENCRYPTION_SECRET is not available. Cannot decrypt variable.')
    }
    return xorDecrypt(value, secretKey)
  },
}
