export function parseAttachmentDownloadPath(output: string): string {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.at(-1) ?? "";
}
