import { z } from "zod";
import {
  getAgentsCached,
  getRuntimeProviderMap,
} from "../lib/agents.js";
import { extractModelHint } from "../lib/model-hint.js";
import type { ListResult } from "../lib/types.js";

export const multicaListAgentsSchema = z.object({});

type AgentSummary = {
  id: string;
  name: string;
  provider: string;
  model_hint: string;
  description: string;
};

export async function multicaListAgents(): Promise<ListResult<AgentSummary>> {
  const [agents, runtimeProviderMap] = await Promise.all([
    getAgentsCached(),
    getRuntimeProviderMap(),
  ]);

  const items = agents
    .filter((agent) => !agent.archived_at)
    .map((agent) => ({
      id: agent.id,
      name: agent.name,
      provider:
        runtimeProviderMap.get(agent.runtime_id) ?? agent.runtime_mode ?? "unknown",
      model_hint: extractModelHint(agent.custom_args ?? []),
      description: agent.description ?? "",
    }));

  if (items.length === 0) {
    return {
      items: [],
      state: "empty",
      message: "No active agents in this workspace. Create an agent to get started.",
    };
  }

  return { items, state: "loaded" };
}
