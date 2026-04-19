import { z } from "zod";
import { runMulticaJson } from "../lib/multica-cli.js";
import type {
  Runtime,
  RuntimeUsageSummary,
  UsageEntry,
} from "../lib/types.js";

const WINDOW_DAYS = 30;
const WINDOWS = ["today", "30d", "both"] as const;

export const multicaGetRuntimeUsageSchema = z.object({
  runtime_name: z.string().optional(),
  window: z.enum(WINDOWS).optional().default("both"),
});

export type MulticaGetRuntimeUsageInput = z.infer<
  typeof multicaGetRuntimeUsageSchema
>;

function emptyUsage(): RuntimeUsageSummary {
  return {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_tokens: 0,
    cache_write_tokens: 0,
    total_tokens: 0,
  };
}

function summarize(entries: UsageEntry[]): RuntimeUsageSummary {
  return entries.reduce((summary, entry) => {
    summary.input_tokens += entry.input_tokens;
    summary.output_tokens += entry.output_tokens;
    summary.cache_read_tokens += entry.cache_read_tokens;
    summary.cache_write_tokens += entry.cache_write_tokens;
    summary.total_tokens +=
      entry.input_tokens +
      entry.output_tokens +
      entry.cache_read_tokens +
      entry.cache_write_tokens;
    return summary;
  }, emptyUsage());
}

export async function multicaGetRuntimeUsage(
  input: MulticaGetRuntimeUsageInput,
) {
  const window = input.window ?? "both";
  const runtimes = (await runMulticaJson<Runtime[]>(["runtime", "list"])) ?? [];
  const filteredRuntimes = input.runtime_name
    ? runtimes.filter((runtime) =>
        runtime.name.toLowerCase().includes(input.runtime_name!.toLowerCase()),
      )
    : runtimes;

  const today = new Date().toISOString().slice(0, 10);
  const days = window === "today" ? 1 : WINDOW_DAYS;

  return Promise.all(
    filteredRuntimes.map(async (runtime) => {
      const entries =
        (await runMulticaJson<UsageEntry[]>([
          "runtime",
          "usage",
          runtime.id,
          "--days",
          String(days),
        ])) ?? [];

      const todayEntries = entries.filter((entry) => entry.date === today);
      const modelsUsedToday = [...new Set(todayEntries.map((entry) => entry.model))]
        .filter((model) => model !== "<synthetic>")
        .sort();

      const base = {
        runtime_id: runtime.id,
        name: runtime.name,
      };

      if (window === "today") {
        return {
          ...base,
          tokens_today: summarize(todayEntries).total_tokens,
          models_used_today: modelsUsedToday,
        };
      }
      if (window === "30d") {
        return { ...base, usage_30d: summarize(entries) };
      }
      return {
        ...base,
        tokens_today: summarize(todayEntries).total_tokens,
        models_used_today: modelsUsedToday,
        usage_30d: summarize(entries),
      };
    }),
  );
}
