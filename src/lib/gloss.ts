import glossJson from "../data/test_gloss.json";

type GlossEntry = {
  vi?: string;
  draft?: boolean;
  options_py?: string[];
};

const gloss = glossJson as Record<string, GlossEntry>;

export function testGlossVi(testId: string): string | null {
  const g = gloss[testId];
  if (!g?.vi?.trim()) return null;
  return g.vi.trim();
}

export function testOptionsPy(testId: string): string[] | null {
  const g = gloss[testId]?.options_py;
  if (!g?.length) return null;
  return g;
}
