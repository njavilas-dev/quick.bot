export function getValidMaxTokens(model: string, maxTokens?: number): number {
  const name = String(model || '').toLowerCase().trim();
  
  // Default max tokens for different model types
  let defaultMaxTokens = 2048;
  
  // Special handling for different model families if needed
  if (name.includes('gpt-4o') || name.includes('gpt-4-turbo')) {
    defaultMaxTokens = 4096;
  }
  
  // Use provided value if it's a valid number, otherwise use default
  const tokens = Number.isFinite(maxTokens) && maxTokens! > 0 ? maxTokens! : defaultMaxTokens;
  
  // Apply reasonable limits (min 1, max based on model capabilities)
  return Math.max(1, Math.min(4096, tokens));
}