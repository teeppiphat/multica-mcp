import { z } from "zod";
import { buildIssueRunMessagesArgs } from "../lib/cli-arg-builders.js";
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
  const messages = (await runMulticaJson<unknown[]>(
    buildIssueRunMessagesArgs(input),
  )) ?? [];
  return { items: messages, count: messages.length };
}
