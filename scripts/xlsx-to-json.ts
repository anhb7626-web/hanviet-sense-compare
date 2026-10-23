/**
 * Đọc data/hanviet.xlsx (4 sheet) → src/data/*.json
 *
 * Sheet names: words | senses | examples | tests
 * Cột phải khớp type trong src/types/index.ts.
 * dims: chuỗi phân tách bằng | hoặc ,
 * options: phân tách bằng |
 * verified / trap: TRUE/FALSE hoặc 1/0; trap trống = null
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const xlsxPath = path.join(root, "data", "hanviet.xlsx");
const outDir = path.join(root, "src", "data");

function cell(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (v == null) return "";
  return String(v).trim();
}

function bool(v: unknown, fallback = false): boolean {
  if (v == null || v === "") return fallback;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "có";
}

function intOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function splitList(v: string): string[] {
  if (!v) return [];
  return v
    .split(/[|,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function sheetRows(wb: XLSX.WorkBook, name: string): Record<string, unknown>[] {
  const sheet = wb.Sheets[name];
  if (!sheet) {
    console.error(`Thiếu sheet "${name}" trong ${xlsxPath}`);
    process.exit(1);
  }
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
}

function writeJson(name: string, data: unknown) {
  const fp = path.join(outDir, name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`→ ${fp} (${Array.isArray(data) ? data.length : "?"} rows)`);
}

if (!fs.existsSync(xlsxPath)) {
  console.error(
    `Không thấy ${xlsxPath}.\nTạo file Excel 4 sheet (words, senses, examples, tests) rồi chạy lại: npm run data`,
  );
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);

const words = sheetRows(wb, "words").map((r) => ({
  id: cell(r, "id"),
  zh: cell(r, "zh"),
  pinyin: cell(r, "pinyin"),
  hanviet: cell(r, "hanviet"),
  hsk: cell(r, "hsk"),
  group: cell(r, "group") as "A" | "B" | "C" | "R",
  shiftType: cell(r, "shiftType"),
  status: cell(r, "status") as "verified" | "pending",
  gist_vi: cell(r, "gist_vi"),
  gist_zh: cell(r, "gist_zh"),
  tier: (cell(r, "tier") || "tested") as "tested" | "classified",
}));

const senses = sheetRows(wb, "senses").map((r) => {
  const row: Record<string, unknown> = {
    id: cell(r, "id"),
    wordId: cell(r, "wordId"),
    def_zh: cell(r, "def_zh"),
    def_vi: cell(r, "def_vi"),
    relation: cell(r, "relation"),
    dims: splitList(cell(r, "dims")),
    basis: cell(r, "basis"),
  };
  const warn_vi = cell(r, "warn_vi");
  const warn_zh = cell(r, "warn_zh");
  if (warn_vi) row.warn_vi = warn_vi;
  if (warn_zh) row.warn_zh = warn_zh;
  return row;
});

const examples = sheetRows(wb, "examples").map((r) => {
  const row: Record<string, unknown> = {
    id: cell(r, "id"),
    senseId: cell(r, "senseId"),
    lang: cell(r, "lang"),
    text: cell(r, "text"),
    verified: bool(r.verified, true),
  };
  const source = cell(r, "source");
  const year = cell(r, "year");
  if (source) row.source = source;
  if (year) row.year = year;
  return row;
});

const testsOut = sheetRows(wb, "tests").map((r) => {
  const row: Record<string, unknown> = {
    id: cell(r, "id"),
    senseId: cell(r, "senseId"),
    stem: cell(r, "stem"),
    options: cell(r, "options").split("|").map((s) => s.trim()).filter(Boolean),
    answer: Number(r.answer),
    trap: intOrNull(r.trap),
  };
  if (r.n !== "" && r.n != null) row.n = Number(r.n);
  if (r.accuracy !== "" && r.accuracy != null) row.accuracy = Number(r.accuracy);
  if (r.trapRate !== "" && r.trapRate != null) row.trapRate = Number(r.trapRate);
  const batch = cell(r, "batch");
  if (batch) row.batch = batch;
  return row;
});

fs.mkdirSync(outDir, { recursive: true });
writeJson("words.json", words);
writeJson("senses.json", senses);
writeJson("examples.json", examples);
writeJson("tests.json", testsOut);
console.log("Xong. Kiểm tra src/data/ rồi chạy npm run build.");
