export function isValidSessionId(id: string | undefined): boolean {
  if (!id) return false
  return /^[a-zA-Z0-9_-]{20,}$/.test(id)
}

export function isValidBotId(id: string | undefined): boolean {
  return isValidSessionId(id)
}
