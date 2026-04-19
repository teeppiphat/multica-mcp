import { z } from "zod";

const STATUSES = ["active", "paused"] as const;
const PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;

export const multicaGetAutopilotSchema = z.object({
  autopilot_id: z.string().min(1),
});

export const multicaUpdateAutopilotSchema = z.object({
  autopilot_id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(STATUSES).optional(),
  agent: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
  issue_title_template: z.string().optional(),
  project: z.string().optional(),
});

export const multicaDeleteAutopilotSchema = z.object({
  autopilot_id: z.string().min(1),
});

export const multicaTriggerAutopilotSchema = z.object({
  autopilot_id: z.string().min(1),
});
