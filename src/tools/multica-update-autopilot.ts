import { runMulticaJson } from "../lib/multica-cli.js";
import { assertOperand } from "../lib/cli-arg-builders.js";
import type { Autopilot } from "../lib/types.js";
import { multicaUpdateAutopilotSchema } from "../lib/autopilot-input-schemas.js";

export { multicaUpdateAutopilotSchema };
export type MulticaUpdateAutopilotInput = import("zod").infer<typeof multicaUpdateAutopilotSchema>;

export async function multicaUpdateAutopilot(input: MulticaUpdateAutopilotInput) {
  const { autopilot_id, ...fields } = input;
  const args = ["autopilot", "update", assertOperand(autopilot_id, "autopilot_id")];
  if (fields.title) args.push("--title", fields.title);
  if (fields.description) args.push("--description", fields.description);
  if (fields.status) args.push("--status", fields.status);
  if (fields.agent) args.push("--agent", fields.agent);
  if (fields.priority) args.push("--priority", fields.priority);
  if (fields.issue_title_template) args.push("--issue-title-template", fields.issue_title_template);
  if (fields.project !== undefined) args.push("--project", fields.project);

  return runMulticaJson<Autopilot>(args);
}
