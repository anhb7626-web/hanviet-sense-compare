/**
 * Sinh lại options_py trong test_gloss.json bằng pinyin-pro (ngữ cảnh).
 * Chạy: node scripts/regen-options-py.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pinyin } from "pinyin-pro";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tests = JSON.parse(
  readFileSync(join(root, "src/data/tests.json"), "utf8"),
);
const glossPath = join(root, "src/data/test_gloss.json");
const gloss = JSON.parse(readFileSync(glossPath, "utf8"));

function sylReplace(s, from, to) {
  const re = new RegExp(`(^|\\s)${from}(?=\\s|$|[、，。！？；：])`, "g");
  return s.replace(re, `$1${to}`);
}

function fixPolyphones(py, original) {
  let s = py;
  s = s.replace(/\s+([、，。！？；：,.!?;:）】」』])/g, "$1");
  s = s.replace(/([（【「『])\s+/g, "$1");
  s = s.replace(/([、，])\s+/g, "$1");
  s = s.replace(/\s{2,}/g, " ").trim();

  if (original.includes("的") || /地/.test(original)) {
    s = sylReplace(s, "dì", "de");
    s = sylReplace(s, "dí", "de");
  }
  if (
    /地$/.test(original.trim()) ||
    /报酬地|忠实地|不变心地|有组织地/.test(original)
  ) {
    s = sylReplace(s, "dì", "de");
  }
  if (
    original.includes("得") &&
    !/得到|得分|得意|获得|取得/.test(original)
  ) {
    s = sylReplace(s, "dé", "de");
  }
  if (original.includes("作为")) s = s.replace(/zuò wèi/g, "zuò wéi");
  if (/为别人|为朋友/.test(original)) {
    s = s.replace(/wéi bié/g, "wèi bié").replace(/wéi péng/g, "wèi péng");
  }
  if (original.includes("处理")) s = s.replace(/chù lǐ/g, "chǔ lǐ");
  if (original.includes("银行")) s = s.replace(/yín xíng/g, "yín háng");
  if (original.includes("行业")) s = s.replace(/xíng yè/g, "háng yè");
  if (/行人|人行/.test(original)) s = s.replace(/háng rén/g, "xíng rén");
  if (original.includes("看重")) s = s.replace(/kàn chóng/g, "kàn zhòng");
  if (original.includes("长期")) s = s.replace(/zhǎng qī/g, "cháng qī");
  if (/应尽/.test(original)) s = s.replace(/yìng jìn/g, "yīng jìn");
  s = s.replace(/guī deng/g, "guī dìng").replace(/guī dēng/g, "guī dìng");
  if (original.includes("一个")) s = s.replace(/yī gè/g, "yí gè");
  if (original.includes("土地")) s = s.replace(/tǔ de/g, "tǔ dì");
  if (original.includes("某地")) s = s.replace(/mǒu de/g, "mǒu dì");
  if (original.includes("地方")) s = s.replace(/de fāng/g, "dì fāng");
  return s.replace(/\s{2,}/g, " ").trim();
}

function toPy(text) {
  const raw = pinyin(text, {
    toneType: "symbol",
    type: "string",
    nonZh: "consecutive",
  });
  return fixPolyphones(raw, text);
}

for (const t of tests) {
  const entry = gloss[t.id] ?? { draft: true };
  entry.draft = true;
  entry.options_py = t.options.map((opt) => toPy(opt));
  gloss[t.id] = entry;
}

writeFileSync(glossPath, JSON.stringify(gloss, null, 2) + "\n", "utf8");
console.log("Updated options_py for", tests.length, "tests");
