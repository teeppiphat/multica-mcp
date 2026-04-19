export function extractModelHint(customArgs: string[] = []): string {
  if (customArgs.length === 0) return "default";

  for (let i = 0; i < customArgs.length; i += 1) {
    const arg = customArgs[i];
    const next = customArgs[i + 1];

    if ((arg === "--model" || arg === "-m") && next) {
      return next;
    }

    if (arg === "-c" && next) {
      const match = next.match(/^model="?([^"]+)"?$/);
      if (match) return match[1];
    }
  }

  return "default";
}
