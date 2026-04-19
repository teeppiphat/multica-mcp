import { defineConfig } from "tsup";

export default defineConfig({
  entry: { server: "src/server.ts" },
  format: ["esm"],
  target: "node20",
  platform: "node",
  clean: true,
  bundle: true,
  minify: false,
  sourcemap: false,
  banner: { js: "#!/usr/bin/env node" },
  outDir: "dist",
});
