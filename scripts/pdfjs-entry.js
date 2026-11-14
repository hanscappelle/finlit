import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";

globalThis.pdfjsLib = pdfjsLib;
globalThis.pdfjsWorker = { WorkerMessageHandler };
