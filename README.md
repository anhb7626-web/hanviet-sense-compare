# 汉越词义项对照 / Đối chiếu nghĩa từ Hán Việt

Web giúp người Việt học tiếng Trung nhận ra từ Hán Việt **trông quen nhưng nghĩa khác**.

Phục vụ khóa luận: 《汉越词语义偏移类型对越南学习者理解偏差的影响——以“忠”“义”为例》.

Hiện có **10 từ** nhóm 忠/义 (dữ liệu từ bản mẫu). Cấu trúc dữ liệu sẵn sàng mở rộng ~1000 từ.

### Luồng học

Demo 义务 → trang từ → **Kiểm tra từ này** → xem lại từ sai. Home chỉ giữ hero + demo + từ bẫy (không CTA trùng).

### Số liệu khảo sát

File `src/data/survey_2026-10.json` (87 phiếu hợp lệ, KR-20 0.91). Trang **Nghiên cứu** (`#/research`) đọc trực tiếp từ đây — **không tính lại trong code**.

Khi có đợt khảo sát mới:
1. Thay / thêm file `src/data/survey_YYYY-MM.json`
2. Sửa import trong `src/lib/survey.ts` trỏ file mới
3. Giữ cấu trúc JSON (`meta`, `groups`, `pairs`, `items`, `quotes`, …)

### Giao diện

- Hero nền 忠义; scene đoán→thật; màu son/trà/navy
- Motion gọn: chữ nền hero, gạch chân demo, rung khi trúng bẫy

## Công nghệ

- Vite + React + TypeScript + Tailwind CSS
- Không backend, không đăng nhập
- Routing hash (`#/`, `#/words`, `#/word/W001`, `#/quiz`) — chạy được trên GitHub Pages

## Cài đặt

```bash
npm install
npm run dev
```

Mở http://localhost:5173/hanviet-sense-compare/ (do `base` trong `vite.config.ts`).

## Dữ liệu (Excel → JSON)

1. Sửa file `data/hanviet.xlsx` (4 sheet: `words`, `senses`, `examples`, `tests`).
2. Chạy:

```bash
npm run data
```

Script `scripts/xlsx-to-json.ts` ghi ra `src/data/*.json`.

> Lần đầu: nếu chưa có Excel, có thể dùng sẵn JSON trong `src/data/` (đã chuyển từ bản mẫu). Có thể xuất Excel từ JSON bằng công cụ khác, hoặc tạo sheet theo cột trong `src/types/index.ts`.

### Cột sheet (tóm tắt)

| Sheet | Cột chính |
|-------|-----------|
| words | id, zh, pinyin, hanviet, hsk, group, shiftType, status, gist_vi, gist_zh |
| senses | id, wordId, def_zh, def_vi, relation, dims, warn_vi, warn_zh, basis |
| examples | id, senseId, lang, text, source, year, verified |
| tests | id, senseId, stem, options, answer, trap, n, accuracy, trapRate, batch |

- `dims` / `options`: phân tách bằng `|`
- `relation`: `same` \| `zh_only` \| `vi_only` \| `diff`
- `status`: `verified` \| `pending`
- **Không đổi ID** đã phát hành (W001, S001-1, …)

Tiền tố `TODO:` trong dữ liệu đã được strip khi hiển thị — UI chỉ hiện nội dung học tập.

## Build

```bash
npm run build
npm run preview
```

## Deploy GitHub Pages

1. Đẩy repo lên GitHub (tên repo mặc định trong config: `hanviet-sense-compare`).
2. Nếu đổi tên repo: sửa `base` trong `vite.config.ts` thành `"/<tên-repo>/"`.
3. Settings → Pages → Source: **GitHub Actions**.
4. Push nhánh `main` — workflow `.github/workflows/deploy.yml` sẽ build và publish.

URL dạng: `https://<user>.github.io/hanviet-sense-compare/`

## Cấu trúc thư mục

```
reference/          # bản mẫu HTML gốc
data/               # hanviet.xlsx (nguồn chỉnh sửa)
scripts/            # xlsx-to-json.ts
src/
  data/             # words.json, senses.json, examples.json, tests.json
  types/            # Word, Sense, Example, TestItem
  i18n/             # vi.ts, zh.ts
  components/       # SearchBox, WordCard, SenseCard, Quiz, LangToggle…
  pages/            # Home, Words, Word, Quiz
```

## Song ngữ

Nút **VI / 中文** góc trên; lựa chọn lưu `localStorage` (key `hanviet-lang`). Mặc định tiếng Việt.

## Tự kiểm tra & nghiên cứu

- 8 câu từ ngân hàng pretest nhóm A.
- Kết quả lưu trên máy (`localStorage`); trang **Số liệu** (`#/stats`).
- `submitResult()` trong `src/lib/data.ts`: lưu local; điền `APPS_SCRIPT_URL` trong `src/lib/storage.ts` để gửi ẩn danh lên Google Sheets.

## Tính năng thêm

- Chế độ **Học sinh / Giáo viên** (header): ẩn corpus–sơ đồ–in–ID với học sinh
- Quiz: cả bộ / **ôn từ đã sai** / **ôn từ đã lưu** + quy tắc cần nhớ sau bài
- Khối **Dùng trong lớp (~3 phút)** trên trang từ (chế độ giáo viên)
- Lọc có bẫy / loại lệch / chiều lệch; lưu từ; in trang từ (giáo viên)
- Ẩn chuỗi `TODO` trên luồng học sinh
- Logo, sơ đồ khung, số liệu corpus (chế độ giáo viên)
