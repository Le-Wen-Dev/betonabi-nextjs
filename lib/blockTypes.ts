/**
 * ═══════════════════════════════════════════════════════════════════
 *  JSON Block System – Cấu trúc nội dung bài viết kiểu Elementor
 * ═══════════════════════════════════════════════════════════════════
 *
 * Mỗi block có:
 *  - id   : unique identifier (nanoid)
 *  - type : loại block (heading, paragraph, image, list, quote, code, divider, gallery, columns)
 *  - data : dữ liệu riêng của từng loại
 *  - meta : dữ liệu mở rộng tuỳ ý (luôn backward-compatible)
 *
 * Cấu trúc mở rộng được: thêm type mới → chỉ cần thêm interface + renderer.
 * Block cũ KHÔNG bị phá vỡ khi thêm type mới.
 */

// ─── Base Block ────────────────────────────────────────────────────
export interface BaseBlock {
  id: string;
  type: string;
  meta?: Record<string, unknown>; // extensible metadata
}

// ─── Heading Block ─────────────────────────────────────────────────
export interface HeadingBlock extends BaseBlock {
  type: "heading";
  data: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

// ─── Paragraph Block ──────────────────────────────────────────────
export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  data: {
    text: string;
  };
}

// ─── Image Block ──────────────────────────────────────────────────
export interface ImageBlock extends BaseBlock {
  type: "image";
  data: {
    url: string;      // PocketBase file URL hoặc external URL
    caption?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

// ─── List Block ───────────────────────────────────────────────────
export interface ListBlock extends BaseBlock {
  type: "list";
  data: {
    style: "ordered" | "unordered";
    items: string[];
  };
}

// ─── Quote Block ──────────────────────────────────────────────────
export interface QuoteBlock extends BaseBlock {
  type: "quote";
  data: {
    text: string;
    author?: string;
  };
}

// ─── Code Block ───────────────────────────────────────────────────
export interface CodeBlock extends BaseBlock {
  type: "code";
  data: {
    code: string;
    language?: string;
  };
}

// ─── Divider Block ────────────────────────────────────────────────
export interface DividerBlock extends BaseBlock {
  type: "divider";
  data: Record<string, never>;
}

// ─── Gallery Block (mở rộng) ──────────────────────────────────────
export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  data: {
    images: Array<{
      url: string;
      caption?: string;
      alt?: string;
    }>;
    columns?: number; // default 2
  };
}

// ─── Columns Block (mở rộng – layout 2 cột) ──────────────────────
export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  data: {
    columns: Array<{
      blocks: ContentBlock[];
    }>;
  };
}

// ─── Union type ───────────────────────────────────────────────────
export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | DividerBlock
  | GalleryBlock
  | ColumnsBlock;

// ─── Document (content_vi / content_jp JSON) ─────────────────────
export interface BlockDocument {
  version: number;    // schema version for future migration
  blocks: ContentBlock[];
}

// ─── Helpers ──────────────────────────────────────────────────────

let _counter = 0;
export function generateBlockId(): string {
  _counter += 1;
  return `blk_${Date.now().toString(36)}_${_counter.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createEmptyDocument(): BlockDocument {
  return {
    version: 1,
    blocks: [
      {
        id: generateBlockId(),
        type: "paragraph",
        data: { text: "" },
      },
    ],
  };
}

/** Parse JSON string or object → BlockDocument. Returns empty doc on failure. */
export function parseBlockDocument(raw: string | object | null | undefined): BlockDocument {
  if (!raw) return createEmptyDocument();

  // If PocketBase already parsed JSON into an object, handle directly
  if (typeof raw === "object") {
    if (Array.isArray(raw)) {
      return { version: 1, blocks: raw as ContentBlock[] };
    }
    if ("blocks" in raw && Array.isArray((raw as BlockDocument).blocks)) {
      return raw as BlockDocument;
    }
    return createEmptyDocument();
  }

  // String input
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return createEmptyDocument();
    try {
      const parsed = JSON.parse(trimmed);
      // Support both { version, blocks } and direct array of blocks
      if (Array.isArray(parsed)) {
        return { version: 1, blocks: parsed as ContentBlock[] };
      }
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
        return parsed as BlockDocument;
      }
      return createEmptyDocument();
    } catch {
      return createEmptyDocument();
    }
  }

  return createEmptyDocument();
}

/** Serialize BlockDocument → JSON string for PocketBase */
export function serializeBlockDocument(doc: BlockDocument): string {
  return JSON.stringify(doc);
}

/** Extract plain text from blocks for word counting / reading time estimation */
export function extractPlainText(doc: BlockDocument): string {
  const parts: string[] = [];
  const extractFromBlocks = (blocks: ContentBlock[]) => {
    for (const block of blocks) {
      switch (block.type) {
        case "heading":
        case "paragraph":
        case "quote":
          parts.push(block.data.text || "");
          break;
        case "list":
          parts.push((block.data.items || []).join(" "));
          break;
        case "code":
          parts.push(block.data.code || "");
          break;
        case "columns":
          for (const col of block.data.columns || []) {
            extractFromBlocks(col.blocks || []);
          }
          break;
        default:
          break;
      }
    }
  };
  extractFromBlocks(doc.blocks);
  return parts.join(" ").trim();
}

/** Estimate reading minutes from BlockDocument */
export function estimateReadingMinutesFromDoc(doc: BlockDocument): number {
  const text = extractPlainText(doc);
  if (!text) return 1;
  const words = text.split(/\s+/g).filter(Boolean).length;
  if (words > 0) return Math.max(1, Math.ceil(words / 220));
  return Math.max(1, Math.ceil(text.length / 1200));
}
