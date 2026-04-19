import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { AutopilotListResponse, ListResult } from "../lib/types.js";

const STATUSES = ["active", "paused"] as const;

export const multicaListAutopilotsSchema = z.object({
  status: z.enum(STATUSES).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type MulticaListAutopilotsInput = z.infer<typeof multicaListAutopilotsSchema>;

export async function multicaListAutopilots(
  input: MulticaListAutopilotsInput,
): Promise<ListResult<object>> {
  const args = ["autopilot", "list"];
  if (input.status) args.push("--status", input.status);
  if (input.limit) args.push("--limit", String(input.limit));

  const response = await runMulticaJson<AutopilotListResponse>(args);
  const autopilots = response.autopilots ?? [];

  if (autopilots.length === 0) {
    return { items: [], state: "empty", message: "No autopilots found." };
  }

  const items = autopilots.map((a) => ({
    id: a.id,
    title: a.title,
    status: a.status,
    execution_mode: a.execution_mode,
    priority: a.priority,
    last_run_at: a.last_run_at,
    updated_at: a.updated_at,
  }));

  return { items, state: "loaded" };
}
