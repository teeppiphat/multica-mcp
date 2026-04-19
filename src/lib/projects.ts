import { TtlCache } from "./cache.js";
import { closestMatch } from "./fuzzy.js";
import { runMulticaJson } from "./multica-cli.js";
import type { Project } from "./types.js";

const projectsCache = new TtlCache<Project[]>(5 * 60 * 1000);

export async function getProjectsCached(): Promise<Project[]> {
  const cached = projectsCache.get("all");
  if (cached) return cached;

  const fresh = (await runMulticaJson<Project[]>(["project", "list"])) ?? [];
  projectsCache.set("all", fresh);
  return fresh;
}

export function invalidateProjectsCache(): void {
  projectsCache.invalidate();
}

export function getProjectDisplayName(project: Project): string {
  return project.title ?? project.name ?? project.id;
}

export async function resolveProject(
  nameOrId: string,
): Promise<Project | undefined> {
  const projects = await getProjectsCached();
  const normalized = nameOrId.trim().toLowerCase();

  return projects.find((project) => {
    const displayName = getProjectDisplayName(project).trim().toLowerCase();
    return project.id === nameOrId || displayName === normalized;
  });
}

export async function buildUnknownProjectMessage(
  project: string,
): Promise<string> {
  const projects = await getProjectsCached();
  const names = projects.map(getProjectDisplayName);
  const suggestion = closestMatch(project, names);
  const suggestionText = suggestion ? ` Did you mean "${suggestion}"?` : "";
  const available = names.length > 0 ? names.join(", ") : "(none)";
  return `Project "${project}" not found.${suggestionText} Available projects: ${available}`;
}
