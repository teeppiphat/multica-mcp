import { z } from "zod";
import { runMulticaJson, runMulticaRaw } from "../lib/multica-cli.js";
import {
  buildAutopilotTriggerAddArgs,
  buildAutopilotTriggerDeleteArgs,
  buildAutopilotTriggerUpdateArgs,
} from "../lib/cli-arg-builders.js";
import type { Trigger } from "../lib/types.js";

export const multicaAutopilotTriggerAddSchema = z.object({
  autopilot_id: z.string().min(1),
  cron: z.string().min(1),
  label: z.string().optional(),
  timezone: z.string().optional(),
});

export type MulticaAutopilotTriggerAddInput = z.infer<
  typeof multicaAutopilotTriggerAddSchema
>;

export async function multicaAutopilotTriggerAdd(
  input: MulticaAutopilotTriggerAddInput,
) {
  return runMulticaJson<Trigger>(buildAutopilotTriggerAddArgs(input));
}

export const multicaAutopilotTriggerUpdateSchema = z.object({
  autopilot_id: z.string().min(1),
  trigger_id: z.string().min(1),
  cron: z.string().optional(),
  label: z.string().optional(),
  timezone: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type MulticaAutopilotTriggerUpdateInput = z.infer<
  typeof multicaAutopilotTriggerUpdateSchema
>;

export async function multicaAutopilotTriggerUpdate(
  input: MulticaAutopilotTriggerUpdateInput,
) {
  return runMulticaJson<Trigger>(buildAutopilotTriggerUpdateArgs(input));
}

export const multicaAutopilotTriggerDeleteSchema = z.object({
  autopilot_id: z.string().min(1),
  trigger_id: z.string().min(1),
});

export type MulticaAutopilotTriggerDeleteInput = z.infer<
  typeof multicaAutopilotTriggerDeleteSchema
>;

export async function multicaAutopilotTriggerDelete(
  input: MulticaAutopilotTriggerDeleteInput,
) {
  await runMulticaRaw(buildAutopilotTriggerDeleteArgs(input));
  return { deleted: true, trigger_id: input.trigger_id };
}
