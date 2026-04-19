import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";
import type { ListResult, Runtime } from "../lib/types.js";

export const multicaRuntimeListSchema = z.object({});

type RuntimeSummary = {
  id: string;
  name: string;
  provider: string;
  runtime_mode: string;
  status: string;
  last_seen_at: string;
};

export async function multicaRuntimeList(): Promise<ListResult<RuntimeSummary>> {
  const runtimes = (await runMulticaJson<Runtime[]>(["runtime", "list"])) ?? [];
  if (runtimes.length === 0) {
    return { items: [], state: "empty", message: "No runtimes registered." };
  }
  const items = runtimes.map((runtime) => ({
    id: runtime.id,
    name: runtime.name,
    provider: runtime.provider,
    runtime_mode: runtime.runtime_mode,
    status: runtime.status,
    last_seen_at: runtime.last_seen_at,
  }));
  return { items, state: "loaded" };
}
