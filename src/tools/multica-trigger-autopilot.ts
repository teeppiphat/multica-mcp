import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";

export const multicaTriggerAutopilotSchema = z.object({
  id: z.string().min(1),
});

export type MulticaTriggerAutopilotInput = z.infer<typeof multicaTriggerAutopilotSchema>;

export async function multicaTriggerAutopilot(input: MulticaTriggerAutopilotInput) {
  return runMulticaJson(["autopilot", "trigger", input.id]);
}
