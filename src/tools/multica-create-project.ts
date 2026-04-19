import { z } from "zod";
import { invalidateProjectsCache } from "../lib/projects.js";
import { runMulticaJson, runMulticaRaw } from "../lib/multica-cli.js";
import type { Project } from "../lib/types.js";

async function resolveAppUrl(): Promise<string> {
  if (process.env.MULTICA_APP_URL) return process.env.MULTICA_APP_URL;
  try {
    const out = await runMulticaRaw(["config", "show"]);
    const match = out.match(/app[_-]?url\s*[:=]\s*"?([^\s"]+)"?/i);
    if (match) return match[1];
  } catch {
    // fall through
  }
  return "";
}

export const multicaCreateProjectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
});

export type MulticaCreateProjectInput = z.infer<
  typeof multicaCreateProjectSchema
>;

export async function multicaCreateProject(
  input: MulticaCreateProjectInput,
) {
  const args = ["project", "create", "--title", input.name];
  if (input.description) {
    args.push("--description", input.description);
  }

  const project = await runMulticaJson<Project>(args);
  invalidateProjectsCache();
  const appUrl = await resolveAppUrl();

  return {
    id: project.id,
    name: project.title ?? input.name,
    url: appUrl ? `${appUrl}/projects/${project.id}` : null,
  };
}
