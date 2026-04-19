import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { Autopilot } from "../lib/types.js";

const PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;

export const multicaCreateAutopilotSchema = z.object({
  title: z.string().min(1).max(200),
  agent: z.string().min(1),
  description: z.string().optional(),
  mode: z.literal("create_issue").default("create_issue"),
  priority: z.enum(PRIORITIES).optional().default("none"),
  issue_title_template: z.string().optional(),
  project: z.string().optional(),
});

export type MulticaCreateAutopilotInput = z.infer<typeof multicaCreateAutopilotSchema>;

export async function multicaCreateAutopilot(input: MulticaCreateAutopilotInput) {
  const args = [
    "autopilot", "create",
    "--title", input.title,
    "--agent", input.agent,
    "--mode", input.mode,
    "--priority", input.priority ?? "none",
  ];
  if (input.description) args.push("--description", input.description);
  if (input.issue_title_template) args.push("--issue-title-template", input.issue_title_template);
  if (input.project) args.push("--project", input.project);

  return runMulticaJson<Autopilot>(args);
}
