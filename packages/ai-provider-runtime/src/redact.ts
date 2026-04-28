export function maskApiKey(apiKey: string): string {
  if (apiKey.length === 0) {
    return '';
  }

  if (apiKey.length <= 8) {
    return '*'.repeat(Math.min(4, apiKey.length));
  }

  const head = apiKey.slice(0, 4);
  const tail = apiKey.slice(-4);
  return `${head}${'*'.repeat(apiKey.length - 8)}${tail}`;
}
