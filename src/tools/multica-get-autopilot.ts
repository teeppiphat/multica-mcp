import { runMulticaJson } from "../lib/multica-cli.js";
import { assertOperand } from "../lib/cli-arg-builders.js";
import type { AutopilotGetResponse } from "../lib/types.js";
import { multicaGetAutopilotSchema } from "../lib/autopilot-input-schemas.js";

export { multicaGetAutopilotSchema };
export type MulticaGetAutopilotInput = import("zod").infer<typeof multicaGetAutopilotSchema>;

export async function multicaGetAutopilot(input: MulticaGetAutopilotInput) {
  return runMulticaJson<AutopilotGetResponse>([
    "autopilot",
    "get",
    assertOperand(input.autopilot_id, "autopilot_id"),
  ]);
}
