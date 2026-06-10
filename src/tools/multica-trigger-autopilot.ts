import { runMulticaJson } from "../lib/multica-cli.js";
import { assertOperand } from "../lib/cli-arg-builders.js";
import { multicaTriggerAutopilotSchema } from "../lib/autopilot-input-schemas.js";

export { multicaTriggerAutopilotSchema };
export type MulticaTriggerAutopilotInput = import("zod").infer<typeof multicaTriggerAutopilotSchema>;

export async function multicaTriggerAutopilot(input: MulticaTriggerAutopilotInput) {
  return runMulticaJson([
    "autopilot",
    "trigger",
    assertOperand(input.autopilot_id, "autopilot_id"),
  ]);
}
