import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type LogEntry = {
  timestamp: string;
  tool: string;
  params?: unknown;
  duration_ms: number;
  success: boolean;
  error?: string;
};

export class JsonlLogger {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
    mkdirSync(dirname(path), { recursive: true });
  }

  log(entry: Omit<LogEntry, "timestamp">): void {
    const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + "\n";
    try {
      appendFileSync(this.path, line, "utf8");
    } catch {
      // Logging failures must not break tool execution.
    }
  }
}
