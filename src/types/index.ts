export type Relation = "same" | "zh_only" | "vi_only" | "diff";

export type Dim =
  | "对象指向"
  | "义项范围"
  | "色彩"
  | "搭配"
  | "读音";

export type Word = {
  id: string;
  zh: string;
  pinyin: string;
  hanviet: string;
  hsk: string;
  group: "A" | "B" | "C" | "R";
  /** tested = đã khảo sát người học; classified = mới phân loại, chưa kiểm chứng */
  tier: "tested" | "classified";
  shiftType: string;
  status: "verified" | "pending";
  /** Câu kết luận ngắn đầu trang từ */
  gist_vi: string;
  gist_zh: string;
};

export type Sense = {
  id: string;
  wordId: string;
  def_zh: string;
  def_vi: string;
  relation: Relation;
  dims: Dim[];
  warn_vi?: string;
  warn_zh?: string;
  /** Căn cứ: từ điển / ngữ liệu / khảo sát */
  basis: string;
};

export type Example = {
  id: string;
  senseId: string;
  lang: "zh" | "vi";
  text: string;
  source?: string;
  year?: string;
  verified: boolean;
};

export type TestItem = {
  id: string;
  senseId: string;
  stem: string;
  options: string[];
  answer: number;
  /** Phương án mang nghĩa tiếng Việt */
  trap: number | null;
  batch?: string;
};

export type Lang = "vi" | "zh";

/** Kết quả khảo sát (đọc từ survey_*.json — không tự tính lại). */
export type SurveyMeta = {
  id: string;
  collectedUntil: string;
  nCollected: number;
  nValid: number;
  kr20: number;
  note_vi: string;
  note_zh: string;
};

export type SurveyGroupStats = { mean: number; sd: number };

export type SurveyPair = {
  word: string;
  wordId: string;
  commonQ: number;
  diffQ: number;
  commonAcc: number;
  diffAcc: number;
  diffTrapRate: number;
  mcnemarP: number;
};

export type SurveyItem = {
  q: number;
  testId: string | null;
  wordId: string | null;
  word: string;
  group: "A" | "B" | "C" | string;
  senseType: string;
  stem: string;
  n: number;
  accuracy: number;
  trapRate: number | null;
  idkRate: number;
  trapShareOfErrors: number | null;
  flag: string | null;
};

export type SurveyQuote = {
  wordId: string;
  q: number;
  text_vi: string;
  text_zh?: string;
  choice: string;
};

export type Survey = {
  meta: SurveyMeta;
  groups: Record<string, SurveyGroupStats>;
  groupTest: { friedmanChi2: number; p: string };
  pooledCore: {
    commonAcc: number;
    diffAcc: number;
    p: string;
    r: number;
  };
  trapShare: Record<
    string,
    {
      trap: number;
      errors: number;
      share: number;
      chance: number;
      p: string;
    }
  >;
  confidence: {
    correct: number;
    trap: number;
    trapConfidentShare: number;
  };
  byLevel: {
    level: string;
    commonAcc: number;
    diffAcc: number;
  }[];
  pairs: SurveyPair[];
  items: SurveyItem[];
  quotes: SurveyQuote[];
};
