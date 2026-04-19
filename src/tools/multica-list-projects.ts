import { z } from "zod";
import {
  getProjectDisplayName,
  getProjectsCached,
} from "../lib/projects.js";
import type { ListResult } from "../lib/types.js";

export const multicaListProjectsSchema = z.object({});

type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  issue_count: number;
};

export async function multicaListProjects(): Promise<ListResult<ProjectSummary>> {
  const projects = await getProjectsCached();

  const items = projects.map((project) => ({
    id: project.id,
    name: getProjectDisplayName(project),
    description: project.description ?? null,
    issue_count: project.issue_count ?? 0,
  }));

  if (items.length === 0) {
    return {
      items: [],
      state: "empty",
      message: "No projects in this workspace. Create a project to start organising issues.",
    };
  }

  return { items, state: "loaded" };
}
