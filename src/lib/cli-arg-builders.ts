type AgentVisibility = "workspace" | "private";
type AgentStatus = "active" | "paused" | "archived";

/**
 * Guard against argument injection.
 *
 * The CLI is invoked via spawn (no shell), so shell metacharacters are inert.
 * But a user-controlled value used as a POSITIONAL operand that begins with "-"
 * would be parsed by the multica CLI as a flag rather than an operand. Real ids
 * (UUIDs, short ids like "ABC-12") never start with "-", so we reject such
 * values up front. Returns the value so it can be used inline.
 */
export function assertOperand(value: string, field: string): string {
  if (value.startsWith("-")) {
    throw new Error(`Invalid ${field}: value must not start with "-".`);
  }
  return value;
}

function stringifyFlag(value: unknown): string {
  return JSON.stringify(value);
}

export type AgentCreateArgsInput = {
  name: string;
  runtime_id: string;
  description?: string;
  instructions?: string;
  custom_args?: string[];
  runtime_config?: Record<string, unknown>;
  visibility?: AgentVisibility;
  max_concurrent_tasks?: number;
};

export function buildAgentCreateArgs(input: AgentCreateArgsInput): string[] {
  const args = [
    "agent",
    "create",
    "--name",
    input.name,
    "--runtime-id",
    input.runtime_id,
  ];

  if (input.description) args.push("--description", input.description);
  if (input.instructions) args.push("--instructions", input.instructions);
  if (input.visibility) args.push("--visibility", input.visibility);
  if (input.max_concurrent_tasks !== undefined) {
    args.push("--max-concurrent-tasks", String(input.max_concurrent_tasks));
  }
  if (input.custom_args) {
    args.push("--custom-args", stringifyFlag(input.custom_args));
  }
  if (input.runtime_config) {
    args.push("--runtime-config", stringifyFlag(input.runtime_config));
  }

  return args;
}

export type AgentUpdateArgsInput = {
  agent_id: string;
  name?: string;
  description?: string;
  instructions?: string;
  custom_args?: string[];
  runtime_config?: Record<string, unknown>;
  visibility?: AgentVisibility;
  runtime_id?: string;
  status?: AgentStatus;
  max_concurrent_tasks?: number;
};

export function buildAgentUpdateArgs(input: AgentUpdateArgsInput): string[] {
  const args = ["agent", "update", assertOperand(input.agent_id, "agent_id")];

  if (input.name) args.push("--name", input.name);
  if (input.description !== undefined) args.push("--description", input.description);
  if (input.instructions !== undefined) args.push("--instructions", input.instructions);
  if (input.visibility) args.push("--visibility", input.visibility);
  if (input.runtime_id) args.push("--runtime-id", input.runtime_id);
  if (input.status) args.push("--status", input.status);
  if (input.max_concurrent_tasks !== undefined) {
    args.push("--max-concurrent-tasks", String(input.max_concurrent_tasks));
  }
  if (input.custom_args) {
    args.push("--custom-args", stringifyFlag(input.custom_args));
  }
  if (input.runtime_config) {
    args.push("--runtime-config", stringifyFlag(input.runtime_config));
  }

  if (args.length === 3) {
    throw new Error("No fields provided to update.");
  }

  return args;
}

export type AutopilotTriggerAddArgsInput = {
  autopilot_id: string;
  cron: string;
  label?: string;
  timezone?: string;
};

export function buildAutopilotTriggerAddArgs(
  input: AutopilotTriggerAddArgsInput,
): string[] {
  const args = [
    "autopilot",
    "trigger-add",
    assertOperand(input.autopilot_id, "autopilot_id"),
    "--cron",
    input.cron,
  ];
  if (input.label) args.push("--label", input.label);
  if (input.timezone) args.push("--timezone", input.timezone);
  return args;
}

export type AutopilotTriggerUpdateArgsInput = {
  autopilot_id: string;
  trigger_id: string;
  cron?: string;
  label?: string;
  timezone?: string;
  enabled?: boolean;
};

export function buildAutopilotTriggerUpdateArgs(
  input: AutopilotTriggerUpdateArgsInput,
): string[] {
  const args = [
    "autopilot",
    "trigger-update",
    assertOperand(input.autopilot_id, "autopilot_id"),
    assertOperand(input.trigger_id, "trigger_id"),
  ];
  if (input.cron) args.push("--cron", input.cron);
  if (input.label) args.push("--label", input.label);
  if (input.timezone) args.push("--timezone", input.timezone);
  if (input.enabled !== undefined) {
    args.push(`--enabled=${String(input.enabled)}`);
  }
  if (args.length === 4) {
    throw new Error("No fields provided to update.");
  }
  return args;
}

export type AutopilotTriggerDeleteArgsInput = {
  autopilot_id: string;
  trigger_id: string;
};

export function buildAutopilotTriggerDeleteArgs(
  input: AutopilotTriggerDeleteArgsInput,
): string[] {
  return [
    "autopilot",
    "trigger-delete",
    assertOperand(input.autopilot_id, "autopilot_id"),
    assertOperand(input.trigger_id, "trigger_id"),
  ];
}

export type IssueRunMessagesArgsInput = {
  task_id: string;
  since?: number;
};

export function buildIssueRunMessagesArgs(
  input: IssueRunMessagesArgsInput,
): string[] {
  const args = ["issue", "run-messages", assertOperand(input.task_id, "task_id")];
  if (input.since !== undefined) args.push("--since", String(input.since));
  return args;
}

export type AttachmentDownloadArgsInput = {
  attachment_id: string;
  output_dir?: string;
};

export function buildAttachmentDownloadArgs(
  input: AttachmentDownloadArgsInput,
): string[] {
  const args = [
    "attachment",
    "download",
    assertOperand(input.attachment_id, "attachment_id"),
  ];
  if (input.output_dir) args.push("-o", input.output_dir);
  return args;
}
