import { runMulticaJson } from "../lib/multica-cli.js";
import { multicaTriggerAutopilotSchema } from "../lib/autopilot-input-schemas.js";

export { multicaTriggerAutopilotSchema };
export type MulticaTriggerAutopilotInput = import("zod").infer<typeof multicaTriggerAutopilotSchema>;

export async function multicaTriggerAutopilot(input: MulticaTriggerAutopilotInput) {
  return runMulticaJson(["autopilot", "trigger", input.autopilot_id]);
}
