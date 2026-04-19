import { runMulticaRaw } from "../lib/multica-cli.js";
import { multicaDeleteAutopilotSchema } from "../lib/autopilot-input-schemas.js";

export { multicaDeleteAutopilotSchema };
export type MulticaDeleteAutopilotInput = import("zod").infer<typeof multicaDeleteAutopilotSchema>;

export async function multicaDeleteAutopilot(input: MulticaDeleteAutopilotInput) {
  await runMulticaRaw(["autopilot", "delete", input.autopilot_id]);
  return { deleted: true, autopilot_id: input.autopilot_id };
}
