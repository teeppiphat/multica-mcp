import { z } from "zod";
import { resolveIssueId } from "../lib/issues.js";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { AgentTask, ListResult } from "../lib/types.js";

export const multicaIssueRunsSchema = z.object({
  issue_id: z.string().min(1),
});

export type MulticaIssueRunsInput = z.infer<typeof multicaIssueRunsSchema>;

export async function multicaIssueRuns(
  input: MulticaIssueRunsInput,
): Promise<ListResult<AgentTask>> {
  const issueId = await resolveIssueId(input.issue_id);
  const runs = (await runMulticaJson<AgentTask[]>(["issue", "runs", issueId])) ?? [];
  if (runs.length === 0) {
    return { items: [], state: "empty", message: "No runs for this issue." };
  }
  const sorted = runs
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { items: sorted, state: "loaded" };
}
