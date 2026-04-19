import { runMulticaJson } from "./multica-cli.js";
import type { AgentTask, Issue, IssueListResponse } from "./types.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveIssueId(idOrShortId: string): Promise<string> {
  if (UUID_RE.test(idOrShortId)) return idOrShortId;

  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await runMulticaJson<IssueListResponse>([
      "issue",
      "list",
      "--limit",
      String(limit),
      "--offset",
      String(offset),
    ]);

    const match = page.issues.find((issue) => issue.identifier === idOrShortId);
    if (match) return match.id;
    if (!page.has_more) break;

    offset += limit;
  }

  throw new Error(
    `Issue "${idOrShortId}" not found. Expected a full UUID or a short id like "ABC-12".`,
  );
}

export async function getLatestRunForIssue(
  issueId: string,
): Promise<AgentTask | null> {
  const runs = (await runMulticaJson<AgentTask[]>(["issue", "runs", issueId])) ?? [];
  if (runs.length === 0) return null;

  return runs
    .slice()
    .sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
}

export async function getIssueById(issueId: string): Promise<Issue> {
  return runMulticaJson<Issue>(["issue", "get", issueId]);
}
