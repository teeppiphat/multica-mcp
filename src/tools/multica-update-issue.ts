import { z } from "zod";
import {
  buildUnknownAssigneeMessage,
  getAgentsCached,
  mapAgentIdToName,
  resolveAgentByName,
} from "../lib/agents.js";
import { getIssueById, resolveIssueId } from "../lib/issues.js";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { Issue } from "../lib/types.js";

const STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "blocked",
  "cancelled",
] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const multicaUpdateIssueSchema = z.object({
  issue_id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(STATUSES).optional(),
  assignee: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export type MulticaUpdateIssueInput = z.infer<typeof multicaUpdateIssueSchema>;

export async function multicaUpdateIssue(
  input: MulticaUpdateIssueInput,
) {
  const issueId = await resolveIssueId(input.issue_id);
  const current = await getIssueById(issueId);

  if (input.assignee) {
    if (current.status === "done" || current.status === "cancelled") {
      throw new Error(
        `Cannot change assignee on a ${current.status} issue. Reopen it first.`,
      );
    }

    const agent = await resolveAgentByName(input.assignee);
    if (!agent) {
      throw new Error(await buildUnknownAssigneeMessage(input.assignee));
    }
  }

  const args = ["issue", "update", issueId];
  if (input.title !== undefined) args.push("--title", input.title);
  if (input.description !== undefined) {
    args.push("--description", input.description);
  }
  if (input.status !== undefined) args.push("--status", input.status);
  if (input.assignee !== undefined) args.push("--assignee", input.assignee);
  if (input.priority !== undefined) args.push("--priority", input.priority);

  if (args.length === 3) {
    throw new Error("No fields provided to update.");
  }

  const updated = await runMulticaJson<Issue>(args);
  const agents = await getAgentsCached();

  return {
    id: updated.id,
    short_id: updated.identifier,
    title: updated.title,
    status: updated.status,
    assignee: mapAgentIdToName(agents, updated.assignee_id),
    priority: updated.priority,
    updated_at: updated.updated_at,
  };
}
