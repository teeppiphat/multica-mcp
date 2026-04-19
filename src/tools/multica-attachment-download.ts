import { z } from "zod";
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
  const args = ["attachment", "download", input.attachment_id];
  if (input.output_dir) args.push("-o", input.output_dir);
  const output = await runMulticaRaw(args);
  const path = output.trim().split(/\s+/).pop() ?? output.trim();
  return { path, attachment_id: input.attachment_id };
}
