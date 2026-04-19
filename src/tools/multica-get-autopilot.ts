import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { AutopilotGetResponse } from "../lib/types.js";

export const multicaGetAutopilotSchema = z.object({
  autopilot_id: z.string().min(1),
});

export type MulticaGetAutopilotInput = z.infer<typeof multicaGetAutopilotSchema>;

export async function multicaGetAutopilot(input: MulticaGetAutopilotInput) {
  return runMulticaJson<AutopilotGetResponse>([
    "autopilot",
    "get",
    input.autopilot_id,
  ]);
}
