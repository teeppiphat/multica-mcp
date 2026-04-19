import { z } from "zod";
import { parseAttachmentDownloadPath } from "../lib/attachment-download.js";
import { buildAttachmentDownloadArgs } from "../lib/cli-arg-builders.js";
import { runMulticaRaw } from "../lib/multica-cli.js";

export const multicaAttachmentDownloadSchema = z.object({
  attachment_id: z.string().min(1),
  output_dir: z.string().optional(),
});

export type MulticaAttachmentDownloadInput = z.infer<
  typeof multicaAttachmentDownloadSchema
>;

export async function multicaAttachmentDownload(
  input: MulticaAttachmentDownloadInput,
) {
  const output = await runMulticaRaw(buildAttachmentDownloadArgs(input));
  const path = parseAttachmentDownloadPath(output);
  return { path, attachment_id: input.attachment_id };
}
