import { z } from "zod";
import { resolveIssueId } from "../lib/issues.js";
import { getAgentsCached, mapAgentIdToName } from "../lib/agents.js";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { Comment, ListResult } from "../lib/types.js";

export const multicaListCommentsSchema = z.object({
  issue_id: z.string().min(1),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
  since: z.string().optional(),
});

export type MulticaListCommentsInput = z.infer<typeof multicaListCommentsSchema>;

type CommentSummary = {
  id: string;
  parent_id: string | null;
  author: string;
  author_type: "agent" | "member";
  content: string;
  created_at: string;
};

export async function multicaListComments(
  input: MulticaListCommentsInput,
): Promise<ListResult<CommentSummary>> {
  const issueId = await resolveIssueId(input.issue_id);
  // `issue comment list` uses cursor pagination (--before/--before-id), not
  // --limit/--offset. It returns a flat array, so we apply offset/limit
  // client-side and pass only the natively-supported --since filter.
  const args = ["issue", "comment", "list", issueId];
  if (input.since) args.push("--since", input.since);

  const [allComments, agents] = await Promise.all([
    runMulticaJson<Comment[]>(args),
    getAgentsCached(),
  ]);

  const offset = input.offset ?? 0;
  const comments = (allComments ?? []).slice(
    offset,
    input.limit !== undefined ? offset + input.limit : undefined,
  );

  if (comments.length === 0) {
    return { items: [], state: "empty", message: "No comments match." };
  }

  const items = comments.map((comment) => ({
    id: comment.id,
    parent_id: comment.parent_id,
    author:
      comment.author_type === "agent"
        ? mapAgentIdToName(agents, comment.author_id) ?? comment.author_id
        : comment.author_id,
    author_type: comment.author_type,
    content: comment.content,
    created_at: comment.created_at,
  }));

  return { items, state: "loaded" };
}
