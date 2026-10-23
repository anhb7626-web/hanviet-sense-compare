import type { Dim } from "../types";

/** Nhãn dễ hiểu cho học sinh (ẩn jargon Trung). */
export const DIM_LEARNER: Record<
  Dim,
  { vi: string; zh: string }
> = {
  对象指向: { vi: "Khác đối tượng dùng", zh: "使用对象不同" },
  义项范围: { vi: "Thêm nghĩa mới", zh: "多出新义项" },
  色彩: { vi: "Khác sắc thái", zh: "色彩不同" },
  搭配: { vi: "Khác cách kết hợp", zh: "搭配不同" },
  读音: { vi: "Nhầm do đồng âm", zh: "同音易混" },
};

export function dimLearnerLabel(dim: Dim, lang: "vi" | "zh"): string {
  const row = DIM_LEARNER[dim];
  if (!row) return dim;
  return lang === "vi" ? row.vi : row.zh;
}
