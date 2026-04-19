import { z } from "zod";
import { resolveIssueId } from "../lib/issues.js";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { Comment } from "../lib/types.js";

export const multicaAddCommentSchema = z.object({
  issue_id: z.string().min(1),
  content: z.string().min(1),
});

export type MulticaAddCommentInput = z.infer<typeof multicaAddCommentSchema>;

export async function multicaAddComment(
  input: MulticaAddCommentInput,
) {
  const issueId = await resolveIssueId(input.issue_id);
  const comment = await runMulticaJson<Comment>(
    ["issue", "comment", "add", issueId, "--content-stdin"],
    { stdin: input.content },
  );

  return {
    comment_id: comment.id,
    created_at: comment.created_at,
  };
}
