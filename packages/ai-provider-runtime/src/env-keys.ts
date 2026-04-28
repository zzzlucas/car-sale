export function parseEnvKeys(values: string[]): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];

  for (const value of values) {
    for (const part of value.split(/[\r\n,]+/)) {
      const key = part.trim();
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      keys.push(key);
    }
  }

  return keys;
}
