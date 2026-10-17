var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_jszip = __toESM(require("jszip"), 1);
var import_vite = require("vite");

// server/proofreadService.ts
var ARABIC_WORD_RULES = [
  { word: "\u0647\u0627\u0630\u0627", replacement: "\u0647\u0630\u0627", type: "spelling", explanation: "\u062D\u0630\u0641 \u0623\u0644\u0641 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0641\u064A \u0627\u0633\u0645 \u0627\u0644\u0625\u0634\u0627\u0631\u0629" },
  { word: "\u0647\u0627\u0630\u0647", replacement: "\u0647\u0630\u0647", type: "spelling", explanation: "\u062D\u0630\u0641 \u0623\u0644\u0641 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0641\u064A \u0627\u0633\u0645 \u0627\u0644\u0625\u0634\u0627\u0631\u0629" },
  { word: "\u0647\u0627\u0624\u0644\u0627\u0621", replacement: "\u0647\u0624\u0644\u0627\u0621", type: "spelling", explanation: "\u062D\u0630\u0641 \u0623\u0644\u0641 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0641\u064A \u0627\u0633\u0645 \u0627\u0644\u0625\u0634\u0627\u0631\u0629" },
  { word: "\u0647\u0627\u0643\u0630\u0627", replacement: "\u0647\u0643\u0630\u0627", type: "spelling", explanation: "\u0643\u062A\u0627\u0628\u0629 \u0627\u0633\u0645 \u0627\u0644\u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0635\u062D\u064A\u062D" },
  { word: "\u0630\u0627\u0644\u0643", replacement: "\u0630\u0644\u0643", type: "spelling", explanation: "\u062D\u0630\u0641 \u0627\u0644\u0623\u0644\u0641 \u0628\u0639\u062F \u0627\u0644\u0630\u0627\u0644 \u0641\u064A \u0627\u0633\u0645 \u0627\u0644\u0625\u0634\u0627\u0631\u0629" },
  { word: "\u0644\u0627\u0643\u0646", replacement: "\u0644\u0643\u0646", type: "spelling", explanation: "\u0643\u062A\u0627\u0628\u0629 \u062D\u0631\u0641 \u0627\u0644\u0627\u0633\u062A\u062F\u0631\u0627\u0643 \u0628\u062F\u0648\u0646 \u0623\u0644\u0641" },
  { word: "\u0627\u0644\u0649", replacement: "\u0625\u0644\u0649", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0645\u0643\u0633\u0648\u0631\u0629 \u0641\u064A \u062D\u0631\u0641 \u0627\u0644\u062C\u0631" },
  { word: "\u0627\u0646", replacement: "\u0623\u0646", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0645\u0641\u062A\u0648\u062D\u0629" },
  { word: "\u0627\u0646\u0645\u0627", replacement: "\u0625\u0646\u0645\u0627", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0645\u0643\u0633\u0648\u0631\u0629 \u0641\u064A \u0623\u062F\u0627\u0629 \u0627\u0644\u062D\u0635\u0631" },
  { word: "\u0627\u0630\u0627", replacement: "\u0625\u0630\u0627", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0645\u0643\u0633\u0648\u0631\u0629 \u0641\u064A \u0638\u0631\u0641\u064A\u0629 \u0627\u0644\u0634\u0631\u0637" },
  { word: "\u0627\u0643\u062B\u0631", replacement: "\u0623\u0643\u062B\u0631", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0639\u0644\u0649 \u0648\u0632\u0646 \u0623\u0641\u0639\u0644" },
  { word: "\u0627\u0643\u0628\u0631", replacement: "\u0623\u0643\u0628\u0631", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0639\u0644\u0649 \u0648\u0632\u0646 \u0623\u0641\u0639\u0644" },
  { word: "\u0627\u0635\u063A\u0631", replacement: "\u0623\u0635\u063A\u0631", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0639\u0644\u0649 \u0648\u0632\u0646 \u0623\u0641\u0639\u0644" },
  { word: "\u0627\u0641\u0636\u0644", replacement: "\u0623\u0641\u0636\u0644", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0639\u0644\u0649 \u0648\u0632\u0646 \u0623\u0641\u0639\u0644" },
  { word: "\u0627\u0648\u0644", replacement: "\u0623\u0648\u0644", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0645\u0641\u062A\u0648\u062D\u0629" },
  { word: "\u0627\u062E\u0631", replacement: "\u0622\u062E\u0631", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0645\u062F \u0645\u0645\u062F\u0648\u062F\u0629" },
  { word: "\u0627\u0646\u0633\u0627\u0646", replacement: "\u0625\u0646\u0633\u0627\u0646", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0645\u0643\u0633\u0648\u0631\u0629" },
  { word: "\u0627\u062D\u0633\u0627\u0646", replacement: "\u0625\u062D\u0633\u0627\u0646", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0645\u0635\u062F\u0631 \u0631\u0628\u0627\u0639\u064A" },
  { word: "\u0627\u0628\u0631\u0627\u0647\u064A\u0645", replacement: "\u0625\u0628\u0631\u0627\u0647\u064A\u0645", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0639\u0644\u0645 \u0623\u0639\u062C\u0645\u064A" },
  { word: "\u0627\u0633\u0645\u0627\u0639\u064A\u0644", replacement: "\u0625\u0633\u0645\u0627\u0639\u064A\u0644", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0639\u0644\u0645 \u0623\u0639\u062C\u0645\u064A" },
  { word: "\u0627\u0633\u062D\u0627\u0642", replacement: "\u0625\u0633\u062D\u0627\u0642", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0639\u0644\u0645 \u0623\u0639\u062C\u0645\u064A" },
  { word: "\u0627\u064A\u0636\u0627", replacement: "\u0623\u064A\u0636\u0627\u064B", type: "spelling", explanation: "\u0647\u0645\u0632\u0629 \u0642\u0637\u0639 \u0648\u062A\u0646\u0648\u064A\u0646 \u0646\u0635\u0628" },
  { word: "\u0645\u062F\u0631\u0633\u0647", replacement: "\u0645\u062F\u0631\u0633\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629 \u062A\u0646\u0637\u0642 \u0647\u0627\u0621 \u0639\u0646\u062F \u0627\u0644\u0648\u0642\u0641 \u0648\u062A\u0627\u0621 \u0639\u0646\u062F \u0627\u0644\u0648\u0635\u0644" },
  { word: "\u0645\u0643\u062A\u0628\u0647", replacement: "\u0645\u0643\u062A\u0628\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u062C\u0627\u0645\u0639\u0647", replacement: "\u062C\u0627\u0645\u0639\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u062D\u064A\u0627\u0647", replacement: "\u062D\u064A\u0627\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0648\u062B\u064A\u0642\u0647", replacement: "\u0648\u062B\u064A\u0642\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0634\u0631\u0639\u064A\u0647", replacement: "\u0634\u0631\u0639\u064A\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0642\u0636\u0627\u0626\u064A\u0647", replacement: "\u0642\u0636\u0627\u0626\u064A\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0631\u0633\u0645\u064A\u0647", replacement: "\u0631\u0633\u0645\u064A\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u062C\u0645\u0647\u0648\u0631\u064A\u0647", replacement: "\u062C\u0645\u0647\u0648\u0631\u064A\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0627\u0644\u064A\u0645\u0646\u064A\u0647", replacement: "\u0627\u0644\u064A\u0645\u0646\u064A\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u062E\u0627\u0635\u0647", replacement: "\u062E\u0627\u0635\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0639\u0627\u0645\u0647", replacement: "\u0639\u0627\u0645\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0642\u0648\u0647", replacement: "\u0642\u0648\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0635\u0648\u0631\u0647", replacement: "\u0635\u0648\u0631\u0629", type: "spelling", explanation: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629" },
  { word: "\u0645\u0633\u062A\u0634\u0641\u064A", replacement: "\u0645\u0633\u062A\u0634\u0641\u0649", type: "spelling", explanation: "\u0623\u0644\u0641 \u0645\u0642\u0635\u0648\u0631\u0629 \u0641\u064A \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0645\u0642\u0635\u0648\u0631" },
  { word: "\u0641\u062A\u0648\u064A", replacement: "\u0641\u062A\u0648\u0649", type: "spelling", explanation: "\u0623\u0644\u0641 \u0645\u0642\u0635\u0648\u0631\u0629" },
  { word: "\u062F\u0639\u0627\u0648\u064A", replacement: "\u062F\u0639\u0627\u0648\u0649", type: "spelling", explanation: "\u0623\u0644\u0641 \u0645\u0642\u0635\u0648\u0631\u0629 \u0641\u064A \u062C\u0645\u0639 \u062F\u0639\u0648\u0649" }
];
function ruleBasedArabicProofread(text) {
  const corrections = [];
  let corrected = text;
  corrected = corrected.replace(/\s+([،؛:؟!.\)])/g, (match, p1) => {
    corrections.push({
      original: match,
      suggestion: p1,
      type: "punctuation",
      explanation: "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0627\u0644\u0632\u0627\u0626\u062F\u0629 \u0642\u0628\u0644 \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u0631\u0642\u064A\u0645"
    });
    return p1;
  });
  for (const item of ARABIC_WORD_RULES) {
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${item.word})([^\\p{L}\\p{N}_]|$)`, "gu");
    if (regex.test(corrected)) {
      corrections.push({
        original: item.word,
        suggestion: item.replacement,
        type: item.type,
        explanation: item.explanation
      });
      corrected = corrected.replace(
        new RegExp(`(^|[^\\p{L}\\p{N}_])(${item.word})([^\\p{L}\\p{N}_]|$)`, "gu"),
        `$1${item.replacement}$3`
      );
    }
  }
  return {
    originalText: text,
    correctedText: corrected,
    corrections,
    source: "rules"
  };
}
async function proofreadWithGemini(text) {
  return ruleBasedArabicProofread(text);
}

// server.ts
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/api/download-app", async (req, res) => {
    try {
      const zip = new import_jszip.default();
      const rootDir = process.cwd();
      const addDirToZip = (currentDir, relativePath = "") => {
        const entries = import_fs.default.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = import_path.default.join(currentDir, entry.name);
          const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
          if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".aistudio" || entry.name === "dist" || entry.name === ".env") {
            continue;
          }
          if (entry.isDirectory()) {
            addDirToZip(fullPath, rel);
          } else if (entry.isFile()) {
            const data = import_fs.default.readFileSync(fullPath);
            zip.file(rel, data);
          }
        }
      };
      addDirToZip(rootDir);
      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="word-excel-pro-app.zip"');
      res.send(zipBuffer);
    } catch (err) {
      console.error("Error creating app zip:", err);
      res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u0635\u062F\u064A\u0631 \u062D\u0632\u0645\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642" });
    }
  });
  app.get("/api/download-apk", (req, res) => {
    res.redirect("https://github.com/YENENIDCRAD26/word-xlsx-mazen-docx/releases/download/apk-latest/Word-Excel-Suite.apk");
  });
  app.post("/api/proofread", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "\u0627\u0644\u0646\u0635 \u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0644\u063A\u0648\u064A" });
      }
      const result = await proofreadWithGemini(text);
      res.json(result);
    } catch (err) {
      console.error("Proofread API error:", err);
      res.status(500).json({ error: err.message || "\u0641\u0634\u0644 \u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0644\u063A\u0648\u064A" });
    }
  });
  app.post("/api/autocomplete", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "\u0627\u0644\u0646\u0635 \u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A" });
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.json({ completion: " \u0648\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0645\u0627 \u062A\u0642\u062F\u0645\u060C \u062A\u0642\u0631\u0631 \u0627\u0644\u062D\u0643\u0645 \u0628\u0645\u0627 \u0647\u0648 \u0645\u0646\u0635\u0648\u0635 \u0639\u0644\u064A\u0647 \u0634\u0631\u0639\u0627\u064B \u0648\u0642\u0627\u0646\u0648\u0646\u0627\u064B." });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0648\u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0635\u064A\u0627\u063A\u0629 \u0648\u062A\u062D\u0631\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0634\u0631\u0639\u064A\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649. \u0623\u0643\u0645\u0644 \u0627\u0644\u062C\u0645\u0644\u0629 \u0623\u0648 \u0627\u0644\u0641\u0642\u0631\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0628\u0639\u0628\u0627\u0631\u0629 \u0628\u0644\u064A\u063A\u0629 \u0648\u0645\u062A\u0633\u0642\u0629 \u0633\u064A\u0627\u0642\u064A\u0627\u064B (\u0623\u0639\u0637\u0650 \u0641\u0642\u0637 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0643\u0645\u0644 \u0628\u062F\u0648\u0646 \u0645\u0642\u062F\u0645\u0627\u062A \u0648\u0628\u0637\u0648\u0644 5 \u0625\u0644\u0649 15 \u0643\u0644\u0645\u0629):

${text}`
      });
      const completion = response.text?.trim() || "";
      res.json({ completion });
    } catch (err) {
      console.error("Autocomplete API error:", err);
      res.json({ completion: " \u0648\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u0634\u0631\u0639\u064A\u0629 \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629 \u0627\u0644\u0645\u0631\u0639\u064A\u0629." });
    }
  });
  app.post("/api/synonyms", async (req, res) => {
    try {
      const { word, context } = req.body;
      if (!word || typeof word !== "string") {
        return res.status(400).json({ error: "\u0627\u0644\u0643\u0644\u0645\u0629 \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        const fallbackMap = {
          "\u0643\u062A\u0627\u0628\u0629": ["\u062A\u062D\u0631\u064A\u0631", "\u062A\u062F\u0648\u064A\u0646", "\u062A\u0633\u062C\u064A\u0644", "\u062A\u0633\u0637\u064A\u0631"],
          "\u0642\u0631\u0627\u0631": ["\u062D\u0643\u0645", "\u0645\u0631\u0633\u0648\u0645", "\u0625\u062C\u0631\u0627\u0621", "\u0642\u0636\u0627\u0621"],
          "\u062D\u0643\u0645": ["\u0642\u0631\u0627\u0631", "\u0642\u0636\u0627\u0621", "\u0641\u0635\u0644", "\u0625\u0644\u0632\u0627\u0645"],
          "\u062C\u0645\u064A\u0644": ["\u0631\u0627\u0626\u0639", "\u0628\u062F\u064A\u0639", "\u062D\u0633\u0646", "\u0623\u0646\u064A\u0642"],
          "\u0643\u0628\u064A\u0631": ["\u0636\u062E\u0645", "\u0639\u0638\u064A\u0645", "\u0647\u0627\u0626\u0644", "\u062C\u0633\u064A\u0645"],
          "\u0633\u0631\u064A\u0639": ["\u0639\u0627\u062C\u0644", "\u0641\u0648\u0631\u064A", "\u062E\u0627\u0637\u0641", "\u0648\u0634\u064A\u0643"],
          "\u0637\u0644\u0628": ["\u0627\u0644\u062A\u0645\u0627\u0633", "\u0631\u062C\u0627\u0621", "\u0627\u0633\u062A\u062F\u0639\u0627\u0621", "\u0645\u0646\u0627\u0634\u062F\u0629"],
          "\u0645\u0633\u062A\u0646\u062F": ["\u0648\u062B\u064A\u0642\u0629", "\u0635\u0643", "\u0645\u062D\u0631\u0631", "\u0633\u062C\u0644"],
          "\u062A\u0639\u062F\u064A\u0644": ["\u062A\u0635\u062D\u064A\u062D", "\u062A\u0646\u0642\u064A\u062D", "\u062A\u0637\u0648\u064A\u0631", "\u062A\u063A\u064A\u064A\u0631"]
        };
        const trimmed = word.trim();
        const found = fallbackMap[trimmed] || ["\u0645\u0631\u0627\u062F\u0641 \u0641\u0635\u064A\u062D", "\u0628\u062F\u064A\u0644 \u0644\u063A\u0648\u064A", "\u0635\u064A\u0627\u063A\u0629 \u0623\u062F\u0628\u064A\u0629"];
        return res.json({ synonyms: found });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const prompt = `\u0623\u0646\u062A \u0645\u0639\u062C\u0645 \u0644\u063A\u0648\u064A \u0639\u0631\u0628\u064A \u0630\u0643\u064A \u0648\u0641\u0635\u064A\u062D. \u0623\u0639\u0637\u0646\u064A \u0642\u0627\u0626\u0645\u0629 \u062F\u0642\u064A\u0642\u0629 \u0645\u0646 4 \u0625\u0644\u0649 6 \u0645\u0631\u0627\u062F\u0641\u0627\u062A \u0623\u0648 \u0628\u062F\u0627\u0626\u0644 \u0644\u063A\u0648\u064A\u0629 \u0628\u0644\u0627\u063A\u064A\u0629 \u0644\u0644\u0643\u0644\u0645\u0629: "${word}"${context ? ` \u0641\u064A \u0627\u0644\u0633\u064A\u0627\u0642: "${context}"` : ""}.
\u0623\u062C\u0628 \u062D\u0635\u0631\u0627\u064B \u0628\u0635\u064A\u063A\u0629 JSON \u0628\u0627\u0644\u0647\u064A\u0643\u0644:
{"synonyms": ["\u0645\u0631\u0627\u062F\u06411", "\u0645\u0631\u0627\u062F\u06412", "\u0645\u0631\u0627\u062F\u06413", "\u0645\u0631\u0627\u062F\u06414"]}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(response.text || "{}");
      res.json({ synonyms: parsed.synonyms || [] });
    } catch (err) {
      console.error("Synonyms API error:", err);
      res.json({ synonyms: ["\u0645\u0631\u0627\u062F\u0641 \u0644\u063A\u0648\u064A", "\u0628\u062F\u064A\u0644 \u0641\u0635\u064A\u062D"] });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
