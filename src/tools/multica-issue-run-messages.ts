import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";

export const multicaIssueRunMessagesSchema = z.object({
  task_id: z.string().min(1),
  since: z.number().int().min(0).optional(),
});

export type MulticaIssueRunMessagesInput = z.infer<
  typeof multicaIssueRunMessagesSchema
>;

export async function multicaIssueRunMessages(
  input: MulticaIssueRunMessagesInput,
) {
  const args = ["issue", "run-messages", input.task_id];
  if (input.since !== undefined) args.push("--since", String(input.since));
  const messages = (await runMulticaJson<unknown[]>(args)) ?? [];
  return { items: messages, count: messages.length };
}
