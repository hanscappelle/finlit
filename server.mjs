import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/vendor/pdfjs.bundle.js", ["vendor/pdfjs.bundle.js", "text/javascript; charset=utf-8"]],
  ["/vendor/pdf.worker.min.mjs", ["vendor/pdf.worker.min.mjs", "text/javascript; charset=utf-8"]],
]);

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  if (request.method !== "GET") {
    response.writeHead(405, { Allow: "GET" });
    response.end();
    return;
  }

  const file = staticFiles.get(url.pathname);
  if (!file) {
    response.writeHead(404);
    response.end("Niet gevonden");
    return;
  }

  try {
    const contents = await readFile(path.join(root, file[0]));
    response.writeHead(200, {
      "Content-Type": file[1],
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    response.end(contents);
  } catch (error) {
    console.error("Statische dashboardaanvraag mislukt.", error);
    if (!response.headersSent) {
      response.writeHead(500);
      response.end("Dashboardbestand kon niet worden gelezen.");
    } else {
      response.destroy();
    }
  }
});

server.listen(port, host, () => {
  console.log(`Finlit preview draait op http://${host}:${port}`);
});

server.on("error", (error) => {
  console.error(`De previewserver kon niet starten op ${host}:${port}.`, error);
  process.exitCode = 1;
});
