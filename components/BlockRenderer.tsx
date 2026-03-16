/**
 * BlockRenderer – Render JSON blocks sang React components.
 * KHÔNG sử dụng innerHTML / dangerouslySetInnerHTML.
 * Mỗi block type được map sang component tương ứng.
 * Responsive cho mọi kích thước màn hình (mobile → tablet → desktop).
 */

import React from "react";
import { Camera } from "lucide-react";
import type {
  ContentBlock,
  BlockDocument,
  HeadingBlock,
  ParagraphBlock,
  ImageBlock,
  ListBlock,
  QuoteBlock,
  CodeBlock,
  DividerBlock,
  GalleryBlock,
  ColumnsBlock,
} from "@/lib/blockTypes";
import { parseBlockDocument } from "@/lib/blockTypes";

// ─── Individual Block Renderers ────────────────────────────────────

function RenderHeading({ block }: { block: HeadingBlock }) {
  const Tag = `h${block.data.level}` as React.ElementType;
  const sizeClass =
    block.data.level === 1
      ? "text-2xl sm:text-3xl md:text-4xl"
      : block.data.level === 2
      ? "text-xl sm:text-2xl md:text-3xl"
      : block.data.level === 3
      ? "text-lg sm:text-xl md:text-2xl"
      : "text-base sm:text-lg md:text-xl";

  return (
    <Tag className={`font-serif font-bold ${sizeClass} mb-3 md:mb-4 mt-6 md:mt-8 text-foreground leading-tight`}>
      {block.data.text}
    </Tag>
  );
}

function RenderParagraph({ block }: { block: ParagraphBlock }) {
  if (!block.data.text) return null;
  // Split by newlines to preserve line breaks
  const lines = block.data.text.split("\n");
  return (
    <p className="text-base sm:text-lg md:text-[1.15rem] leading-relaxed md:leading-[1.8] text-foreground mb-4 md:mb-6">
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

function RenderImage({ block }: { block: ImageBlock }) {
  if (!block.data.url) return null;
  return (
    <figure className="my-4 sm:my-6 md:my-8">
      <div className="overflow-hidden rounded-sm">
        <img
          src={block.data.url}
          alt={block.data.alt || block.data.caption || ""}
          className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain"
          loading="lazy"
        />
      </div>
      {block.data.caption && (
        <figcaption className="mt-2 sm:mt-3 flex items-start gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-muted/30">
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm italic text-muted-foreground">
            {block.data.caption}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

function RenderList({ block }: { block: ListBlock }) {
  const Tag: React.ElementType = block.data.style === "ordered" ? "ol" : "ul";
  const listClass =
    block.data.style === "ordered"
      ? "list-decimal pl-5 sm:pl-6 mb-4 md:mb-6"
      : "list-disc pl-5 sm:pl-6 mb-4 md:mb-6";
  return (
    <Tag className={listClass}>
      {block.data.items.map((item, i) => (
        <li key={i} className="text-base sm:text-lg text-foreground mb-1.5 sm:mb-2 leading-relaxed">
          {item}
        </li>
      ))}
    </Tag>
  );
}

function RenderQuote({ block }: { block: QuoteBlock }) {
  return (
    <blockquote className="border-l-3 sm:border-l-4 border-foreground pl-4 sm:pl-6 py-2 my-4 sm:my-6 md:my-8">
      <p className="font-serif text-lg sm:text-xl md:text-2xl italic text-foreground leading-relaxed">
        {block.data.text}
      </p>
      {block.data.author && (
        <footer className="mt-2 text-xs sm:text-sm text-muted-foreground">
          — {block.data.author}
        </footer>
      )}
    </blockquote>
  );
}

function RenderCode({ block }: { block: CodeBlock }) {
  return (
    <div className="my-4 sm:my-6 md:my-8">
      {block.data.language && (
        <div className="bg-gray-800 text-gray-300 text-[10px] sm:text-xs px-3 sm:px-4 py-1 rounded-t">
          {block.data.language}
        </div>
      )}
      <pre
        className={`bg-gray-900 text-gray-100 p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm ${
          block.data.language ? "rounded-b" : "rounded"
        }`}
      >
        <code>{block.data.code}</code>
      </pre>
    </div>
  );
}

function RenderDivider() {
  return <hr className="my-6 sm:my-8 md:my-10 border-foreground/10" />;
}

function RenderGallery({ block }: { block: GalleryBlock }) {
  const cols = block.data.columns || 2;
  // Responsive: 1 col on mobile, 2 on tablet, requested cols on desktop
  const gridClass =
    cols <= 2
      ? "grid-cols-1 sm:grid-cols-2"
      : cols === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  return (
    <div className={`grid ${gridClass} gap-2 sm:gap-3 my-4 sm:my-6 md:my-8`}>
      {block.data.images.map((img, i) => (
        <figure key={i} className="overflow-hidden">
          <img
            src={img.url}
            alt={img.alt || img.caption || ""}
            className="w-full h-36 sm:h-40 md:h-48 object-cover rounded-sm"
            loading="lazy"
          />
          {img.caption && (
            <figcaption className="text-[10px] sm:text-xs text-muted-foreground mt-1 px-1">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function RenderColumns({ block }: { block: ColumnsBlock }) {
  const colCount = block.data.columns?.length || 2;
  // Stack vertically on mobile, side-by-side on larger screens
  const gridClass =
    colCount === 2
      ? "grid-cols-1 md:grid-cols-2"
      : colCount === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2";
  return (
    <div className={`grid ${gridClass} gap-4 sm:gap-6 my-4 sm:my-6 md:my-8`}>
      {block.data.columns.map((col, i) => (
        <div key={i}>
          <BlockRenderer blocks={col.blocks} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Block Renderer ──────────────────────────────────────────

function RenderBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <RenderHeading block={block as HeadingBlock} />;
    case "paragraph":
      return <RenderParagraph block={block as ParagraphBlock} />;
    case "image":
      return <RenderImage block={block as ImageBlock} />;
    case "list":
      return <RenderList block={block as ListBlock} />;
    case "quote":
      return <RenderQuote block={block as QuoteBlock} />;
    case "code":
      return <RenderCode block={block as CodeBlock} />;
    case "divider":
      return <RenderDivider />;
    case "gallery":
      return <RenderGallery block={block as GalleryBlock} />;
    case "columns":
      return <RenderColumns block={block as ColumnsBlock} />;
    default:
      // Unknown block type – skip gracefully (forward-compatible)
      return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────

interface BlockRendererProps {
  blocks: ContentBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="article-body space-y-1 text-gray-900">
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

/** Convenience: parse JSON string or object and render */
interface BlockContentRendererProps {
  jsonContent: string | object | null | undefined;
}

export function BlockContentRenderer({ jsonContent }: BlockContentRendererProps) {
  const doc = parseBlockDocument(jsonContent as string | object | null | undefined);
  // Don't render if document is empty (single empty paragraph)
  if (
    doc.blocks.length === 1 &&
    doc.blocks[0].type === "paragraph" &&
    !(doc.blocks[0] as ParagraphBlock).data.text
  ) {
    return null;
  }
  return <BlockRenderer blocks={doc.blocks} />;
}

export default BlockRenderer;
