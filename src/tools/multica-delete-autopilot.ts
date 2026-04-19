import { z } from "zod";
import { runMulticaRaw } from "../lib/multica-cli.js";

export const multicaDeleteAutopilotSchema = z.object({
  id: z.string().min(1),
});

export type MulticaDeleteAutopilotInput = z.infer<typeof multicaDeleteAutopilotSchema>;

export async function multicaDeleteAutopilot(input: MulticaDeleteAutopilotInput) {
  await runMulticaRaw(["autopilot", "delete", input.id]);
  return { deleted: true, id: input.id };
}
