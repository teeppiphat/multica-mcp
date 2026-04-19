import { test } from "node:test";
import { strict as assert } from "node:assert";

import { TtlCache } from "../src/lib/cache.ts";
import {
  buildAgentCreateArgs,
  buildAgentUpdateArgs,
  buildAutopilotTriggerAddArgs,
  buildAutopilotTriggerDeleteArgs,
  buildAutopilotTriggerUpdateArgs,
} from "../src/lib/cli-arg-builders.ts";
import { closestMatch, levenshtein } from "../src/lib/fuzzy.ts";
import { extractModelHint } from "../src/lib/model-hint.ts";

test("TtlCache: get returns stored value within TTL", () => {
  const cache = new TtlCache<number>(1_000);
  cache.set("a", 1);
  assert.equal(cache.get("a"), 1);
});

test("TtlCache: entries expire after TTL", async () => {
  const cache = new TtlCache<number>(10);
  cache.set("a", 1);
  await new Promise((r) => setTimeout(r, 25));
  assert.equal(cache.get("a"), undefined);
});

test("TtlCache: invalidate() clears all", () => {
  const cache = new TtlCache<number>(1_000);
  cache.set("a", 1);
  cache.set("b", 2);
  cache.invalidate();
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.get("b"), undefined);
});

test("TtlCache: invalidate(key) clears only that key", () => {
  const cache = new TtlCache<number>(1_000);
  cache.set("a", 1);
  cache.set("b", 2);
  cache.invalidate("a");
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.get("b"), 2);
});

test("levenshtein: identical strings yield 0", () => {
  assert.equal(levenshtein("hello", "hello"), 0);
});

test("levenshtein: single substitution yields 1", () => {
  assert.equal(levenshtein("hello", "hallo"), 1);
});

test("levenshtein: case-insensitive", () => {
  assert.equal(levenshtein("Hello", "hello"), 0);
});

test("closestMatch: finds nearest by threshold", () => {
  assert.equal(
    closestMatch("claude-sonet", ["claude-sonnet", "claude-opus"]),
    "claude-sonnet",
  );
});

test("closestMatch: returns undefined when nothing is close enough", () => {
  assert.equal(
    closestMatch("zzz", ["claude-sonnet", "claude-opus"]),
    undefined,
  );
});

test("closestMatch: handles empty input", () => {
  assert.equal(closestMatch("", ["claude-sonnet"]), undefined);
  assert.equal(closestMatch("foo", []), undefined);
});

test("extractModelHint: returns default for empty args", () => {
  assert.equal(extractModelHint([]), "default");
});

test("extractModelHint: reads --model flag", () => {
  assert.equal(extractModelHint(["--model", "claude-opus-4-7"]), "claude-opus-4-7");
});

test("extractModelHint: reads -m flag", () => {
  assert.equal(extractModelHint(["-m", "gpt-5"]), "gpt-5");
});

test("extractModelHint: parses codex -c model= syntax", () => {
  assert.equal(
    extractModelHint(["-c", "model=\"gpt-5\""]),
    "gpt-5",
  );
});

test("extractModelHint: falls back to default when not found", () => {
  assert.equal(extractModelHint(["--foo", "bar"]), "default");
});

test("buildAgentCreateArgs: matches the current Multica CLI contract", () => {
  assert.deepEqual(
    buildAgentCreateArgs({
      name: "reviewer",
      runtime_id: "runtime-123",
      description: "Reviews pull requests.",
      instructions: "Stay concise.",
      visibility: "workspace",
      max_concurrent_tasks: 2,
      custom_args: ["--model", "gpt-5"],
      runtime_config: { region: "eu-west-1" },
    }),
    [
      "agent",
      "create",
      "--name",
      "reviewer",
      "--runtime-id",
      "runtime-123",
      "--description",
      "Reviews pull requests.",
      "--instructions",
      "Stay concise.",
      "--visibility",
      "workspace",
      "--max-concurrent-tasks",
      "2",
      "--custom-args",
      "[\"--model\",\"gpt-5\"]",
      "--runtime-config",
      "{\"region\":\"eu-west-1\"}",
    ],
  );
});

test("buildAgentUpdateArgs: serializes updated fields with CLI flag names", () => {
  assert.deepEqual(
    buildAgentUpdateArgs({
      agent_id: "agent-123",
      description: "Updated.",
      runtime_id: "runtime-456",
      status: "paused",
      custom_args: ["--model", "o3"],
    }),
    [
      "agent",
      "update",
      "agent-123",
      "--description",
      "Updated.",
      "--runtime-id",
      "runtime-456",
      "--status",
      "paused",
      "--custom-args",
      "[\"--model\",\"o3\"]",
    ],
  );
});

test("buildAgentUpdateArgs: rejects empty updates", () => {
  assert.throws(
    () => buildAgentUpdateArgs({ agent_id: "agent-123" }),
    /No fields provided to update/,
  );
});

test("buildAutopilotTriggerAddArgs: uses trigger-add subcommand", () => {
  assert.deepEqual(
    buildAutopilotTriggerAddArgs({
      autopilot_id: "auto-123",
      cron: "0 9 * * *",
      label: "Daily",
      timezone: "Europe/Paris",
    }),
    [
      "autopilot",
      "trigger-add",
      "auto-123",
      "--cron",
      "0 9 * * *",
      "--label",
      "Daily",
      "--timezone",
      "Europe/Paris",
    ],
  );
});

test("buildAutopilotTriggerUpdateArgs: carries autopilot and trigger IDs", () => {
  assert.deepEqual(
    buildAutopilotTriggerUpdateArgs({
      autopilot_id: "auto-123",
      trigger_id: "trigger-456",
      enabled: false,
    }),
    [
      "autopilot",
      "trigger-update",
      "auto-123",
      "trigger-456",
      "--enabled=false",
    ],
  );
});

test("buildAutopilotTriggerDeleteArgs: uses trigger-delete subcommand", () => {
  assert.deepEqual(
    buildAutopilotTriggerDeleteArgs({
      autopilot_id: "auto-123",
      trigger_id: "trigger-456",
    }),
    ["autopilot", "trigger-delete", "auto-123", "trigger-456"],
  );
});
