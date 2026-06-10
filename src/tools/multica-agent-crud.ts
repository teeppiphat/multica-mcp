import { z } from "zod";
import { invalidateAgentsCache } from "../lib/agents.js";
import { runMulticaJson } from "../lib/multica-cli.js";
import {
  buildAgentCreateArgs,
  buildAgentUpdateArgs,
} from "../lib/cli-arg-builders.js";

// The raw `agent create`/`agent update` payload includes mcp_config and
// custom_env, which can carry secrets (API keys, passwords). Project through a
// secret-free allowlist so nothing sensitive reaches the model context or logs.
const SAFE_AGENT_FIELDS = [
  "id",
  "name",
  "description",
  "instructions",
  "runtime_id",
  "runtime_mode",
  "status",
  "visibility",
  "custom_args",
  "max_concurrent_tasks",
  "created_at",
  "updated_at",
  "archived_at",
] as const;

function toSafeAgent(agent: unknown): Record<string, unknown> {
  const raw = (agent ?? {}) as Record<string, unknown>;
  const safe: Record<string, unknown> = {};
  for (const key of SAFE_AGENT_FIELDS) {
    if (raw[key] !== undefined) safe[key] = raw[key];
  }
  return safe;
}

export const multicaAgentCreateSchema = z.object({
  name: z.string().min(1),
  runtime_id: z.string().min(1),
  description: z.string().optional(),
  instructions: z.string().optional(),
  custom_args: z.array(z.string()).optional(),
  runtime_config: z.record(z.string(), z.unknown()).optional(),
  max_concurrent_tasks: z.number().int().min(1).optional(),
  visibility: z.enum(["workspace", "private"]).optional(),
});

export type MulticaAgentCreateInput = z.infer<typeof multicaAgentCreateSchema>;

export async function multicaAgentCreate(input: MulticaAgentCreateInput) {
  const agent = await runMulticaJson(buildAgentCreateArgs(input));
  invalidateAgentsCache();
  return toSafeAgent(agent);
}

export const multicaAgentUpdateSchema = z.object({
  agent_id: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  custom_args: z.array(z.string()).optional(),
  runtime_config: z.record(z.string(), z.unknown()).optional(),
  visibility: z.enum(["workspace", "private"]).optional(),
  runtime_id: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
  max_concurrent_tasks: z.number().int().min(1).optional(),
});

export type MulticaAgentUpdateInput = z.infer<typeof multicaAgentUpdateSchema>;

export async function multicaAgentUpdate(input: MulticaAgentUpdateInput) {
  const agent = await runMulticaJson(buildAgentUpdateArgs(input));
  invalidateAgentsCache();
  return toSafeAgent(agent);
}
