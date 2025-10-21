export function getValidTemperature(model: string, temperature: number = 1): number {
  const name = String(model || '').toLowerCase().trim();
  const isReasoning = /^o\d/.test(name);
  if (isReasoning) {
    return 1;
  }
  const t: number = Number.isFinite(temperature) ? temperature : 1;
  return Math.max(0, Math.min(2, t));
}