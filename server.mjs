import { createServer } from "node:http";
import { copyFile, link, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(root, "data");
const backupsDirectory = path.join(root, "backups");
const projectsDirectory = path.join(root, "projects");
const dataFile = path.join(dataDirectory, "finance.json");
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const maximumBodySize = 20 * 1024 * 1024;
const allowedOrigins = new Set([`http://localhost:${port}`, `http://127.0.0.1:${port}`, "null"]);

function setHeaders(response, origin) {
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store");
}

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

function isValidData(value) {
  return value && typeof value === "object"
    && ["income", "expenses", "investments", "loans"].every((key) => Array.isArray(value[key]));
}

async function readRequestBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBodySize) throw new Error("Aanvraag is te groot.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function saveData(value) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = path.join(dataDirectory, `.finance-${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
    await rename(temporaryFile, dataFile);
  } catch (error) {
    try {
      await rm(temporaryFile, { force: true });
    } catch (cleanupError) {
      console.error("Tijdelijk opslagbestand kon niet worden verwijderd.", cleanupError);
    }
    throw error;
  }
}

function backupTimestamp(date) {
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}-${String(date.getMilliseconds()).padStart(3, "0")}`;
}

function projectFileName(name) {
  if (typeof name !== "string") return null;
  const baseName = name.trim().replace(/\.json$/i, "");
  if (!/^[\p{L}\p{N}][\p{L}\p{N} _.-]{0,79}$/u.test(baseName) || baseName.endsWith(".")) return null;
  return `${baseName}.json`;
}

async function saveNamedProject(fileName, value, overwrite) {
  await mkdir(projectsDirectory, { recursive: true });
  const destination = path.join(projectsDirectory, fileName);
  const temporaryFile = path.join(projectsDirectory, `.project-${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
    if (overwrite) {
      await rename(temporaryFile, destination);
    } else {
      await link(temporaryFile, destination);
      await rm(temporaryFile, { force: true });
    }
  } catch (error) {
    try {
      await rm(temporaryFile, { force: true });
    } catch (cleanupError) {
      console.error("Tijdelijk projectbestand kon niet worden verwijderd.", cleanupError);
    }
    throw error;
  }
}

async function handleApi(request, response, url) {
  const origin = request.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    sendJson(response, 403, { error: "Deze lokale API accepteert alleen aanvragen van het dashboard." });
    return;
  }
  const isMigration = url.pathname === "/api/migrate"
    && (request.method === "POST" || request.method === "OPTIONS" && request.headers["access-control-request-method"] === "POST");
  if (origin === "null" && !isMigration) {
    sendJson(response, 403, { error: "Open het dashboard via http://127.0.0.1:4173 om projectgegevens te bekijken." });
    return;
  }
  if (isMigration && origin && origin !== "null") {
    sendJson(response, 403, { error: "Gegevensmigratie is alleen beschikbaar vanuit de oude lokale bestandspagina." });
    return;
  }
  setHeaders(response, origin || (isMigration ? "null" : undefined));
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (url.pathname === "/api/data" && request.method === "GET") {
    try {
      const contents = await readFile(dataFile, "utf8");
      sendJson(response, 200, JSON.parse(contents));
    } catch (error) {
      if (error.code === "ENOENT") {
        sendJson(response, 404, { error: "Er is nog geen gegevensbestand." });
        return;
      }
      throw error;
    }
    return;
  }

  if (url.pathname === "/api/data" && request.method === "POST") {
    let value;
    try {
      value = JSON.parse(await readRequestBody(request));
    } catch (error) {
      sendJson(response, 400, { error: error.message === "Aanvraag is te groot." ? error.message : "Ongeldige JSON-gegevens." });
      return;
    }
    if (!isValidData(value)) {
      sendJson(response, 400, { error: "De financiële gegevens hebben niet de verwachte structuur." });
      return;
    }
    await saveData(value);
    sendJson(response, 200, { saved: true, file: "data/finance.json" });
    return;
  }

  if (isMigration) {
    try {
      await readFile(dataFile);
      sendJson(response, 409, { error: "Er bestaat al een projectbestand; bestaande gegevens zijn niet overschreven." });
      return;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    let value;
    try {
      value = JSON.parse(await readRequestBody(request));
    } catch (error) {
      sendJson(response, 400, { error: error.message === "Aanvraag is te groot." ? error.message : "Ongeldige JSON-gegevens." });
      return;
    }
    if (!isValidData(value)) {
      sendJson(response, 400, { error: "De financiële gegevens hebben niet de verwachte structuur." });
      return;
    }
    await saveData(value);
    sendJson(response, 201, { saved: true, file: "data/finance.json" });
    return;
  }

  if (url.pathname === "/api/backup" && request.method === "POST") {
    await mkdir(backupsDirectory, { recursive: true });
    const file = `finance-${backupTimestamp(new Date())}.json`;
    const backupFile = path.join(backupsDirectory, file);
    await copyFile(dataFile, backupFile);
    sendJson(response, 201, { saved: true, file: `backups/${file}` });
    return;
  }

  if (url.pathname === "/api/projects" && request.method === "POST") {
    let value;
    try {
      value = JSON.parse(await readRequestBody(request));
    } catch (error) {
      sendJson(response, 400, { error: error.message === "Aanvraag is te groot." ? error.message : "Ongeldige JSON-aanvraag." });
      return;
    }
    const file = projectFileName(value?.name);
    if (!file) {
      sendJson(response, 400, { error: "Kies een projectnaam van maximaal 80 tekens, zonder speciale padtekens." });
      return;
    }
    if (!isValidData(value.data)) {
      sendJson(response, 400, { error: "De financiële gegevens hebben niet de verwachte structuur." });
      return;
    }
    try {
      await saveNamedProject(file, value.data, value.overwrite === true);
    } catch (error) {
      if (error.code === "EEXIST") {
        sendJson(response, 409, { error: "Er bestaat al een projectbestand met deze naam." });
        return;
      }
      throw error;
    }
    sendJson(response, 201, { saved: true, file: `projects/${file}` });
    return;
  }

  sendJson(response, 404, { error: "Lokale API-route niet gevonden." });
}

const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/vendor/pdfjs.bundle.js", ["vendor/pdfjs.bundle.js", "text/javascript; charset=utf-8"]],
  ["/vendor/pdf.worker.min.mjs", ["vendor/pdf.worker.min.mjs", "text/javascript; charset=utf-8"]],
]);

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
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
    const contents = await readFile(path.join(root, file[0]));
    response.writeHead(200, {
      "Content-Type": file[1],
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    response.end(contents);
  } catch (error) {
    console.error("Lokale dashboardaanvraag mislukt.", error);
    if (!response.headersSent) sendJson(response, 500, { error: "Lokale opslagbewerking mislukt." });
    else response.destroy();
  }
});

server.listen(port, host, () => {
  console.log(`Saldo draait lokaal op http://${host}:${port}`);
  console.log("Financiële gegevens worden opgeslagen in data/finance.json");
});

server.on("error", (error) => {
  console.error(`De lokale server kon niet starten op ${host}:${port}.`, error);
  process.exitCode = 1;
});
