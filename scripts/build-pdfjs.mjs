import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("vendor", { recursive: true });
await build({
  entryPoints: ["scripts/pdfjs-entry.js"],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: "vendor/pdfjs.bundle.js",
  target: ["es2022"],
  legalComments: "inline",
});
await copyFile("node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs", "vendor/pdf.worker.min.mjs");
