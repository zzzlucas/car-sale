export interface ModelTargetLevelResult {
  level: number;
  reason: string;
}

export function resolveModelTargetLevel(
  model: string,
  level1Allowlist: string[]
): ModelTargetLevelResult {
  if (model.startsWith('Pro/')) {
    return { level: 10, reason: 'Pro/* model requires Level 10 key' };
  }

  if (level1Allowlist.includes(model)) {
    return { level: 1, reason: 'model in standard list, prefer Level 1 key' };
  }

  return { level: 10, reason: 'model not in Level 1 allowlist, prefer Level 10 key' };
}
