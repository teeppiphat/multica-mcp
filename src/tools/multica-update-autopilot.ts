import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { Autopilot } from "../lib/types.js";

const STATUSES = ["active", "paused"] as const;
const PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;

export const multicaUpdateAutopilotSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(STATUSES).optional(),
  agent: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
  issue_title_template: z.string().optional(),
  project: z.string().optional(),
});

export type MulticaUpdateAutopilotInput = z.infer<typeof multicaUpdateAutopilotSchema>;

export async function multicaUpdateAutopilot(input: MulticaUpdateAutopilotInput) {
  const { id, ...fields } = input;
  const args = ["autopilot", "update", id];
  if (fields.title) args.push("--title", fields.title);
  if (fields.description) args.push("--description", fields.description);
  if (fields.status) args.push("--status", fields.status);
  if (fields.agent) args.push("--agent", fields.agent);
  if (fields.priority) args.push("--priority", fields.priority);
  if (fields.issue_title_template) args.push("--issue-title-template", fields.issue_title_template);
  if (fields.project !== undefined) args.push("--project", fields.project);

  return runMulticaJson<Autopilot>(args);
}
