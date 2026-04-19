import { TtlCache } from "./cache.js";
import { closestMatch } from "./fuzzy.js";
import { extractModelHint } from "./model-hint.js";
import { runMulticaJson } from "./multica-cli.js";
import type { Agent, Runtime } from "./types.js";

const agentsCache = new TtlCache<Agent[]>(5 * 60 * 1000);

export async function getAgentsCached(): Promise<Agent[]> {
  const cached = agentsCache.get("all");
  if (cached) return cached;

  const fresh = (await runMulticaJson<Agent[]>(["agent", "list"])) ?? [];
  agentsCache.set("all", fresh);
  return fresh;
}

export function invalidateAgentsCache(): void {
  agentsCache.invalidate();
}

export async function resolveAgentByName(
  name: string,
): Promise<Agent | undefined> {
  const agents = await getAgentsCached();
  const normalized = name.trim().toLowerCase();
  return agents.find(
    (agent) => !agent.archived_at && agent.name.trim().toLowerCase() === normalized,
  );
}

export async function getRuntimeProviderMap(): Promise<Map<string, string>> {
  const runtimes = (await runMulticaJson<Runtime[]>(["runtime", "list"])) ?? [];
  return new Map(runtimes.map((runtime) => [runtime.id, runtime.provider]));
}

export async function getActiveAgentNames(): Promise<string[]> {
  const agents = await getAgentsCached();
  return agents.filter((agent) => !agent.archived_at).map((agent) => agent.name);
}

export async function buildUnknownAssigneeMessage(
  assignee: string,
): Promise<string> {
  const names = await getActiveAgentNames();
  const suggestion = closestMatch(assignee, names);
  const suggestionText = suggestion ? ` Did you mean "${suggestion}"?` : "";
  return `Assignee "${assignee}" not found.${suggestionText} Available agents: ${names.join(", ")}`;
}

export function mapAgentIdToName(
  agents: Agent[],
  id: string | null | undefined,
): string | null {
  if (!id) return null;
  return agents.find((agent) => agent.id === id)?.name ?? id;
}
