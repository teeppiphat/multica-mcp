export function levenshtein(a: string, b: string): number {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

export function closestMatch(
  input: string,
  candidates: string[],
): string | undefined {
  const normalized = input.trim().toLowerCase();
  if (!normalized || candidates.length === 0) return undefined;

  let best: { value: string; distance: number } | undefined;
  for (const candidate of candidates) {
    const distance = levenshtein(normalized, candidate.toLowerCase());
    if (!best || distance < best.distance) {
      best = { value: candidate, distance };
    }
  }

  if (!best) return undefined;
  const threshold = Math.max(2, Math.floor(normalized.length / 3));
  return best.distance <= threshold ? best.value : undefined;
}
