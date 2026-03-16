import { ArticleContent as ArticleContentType } from "@/data/articleContent";
import { Camera } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { BlockContentRenderer } from "@/components/BlockRenderer";

interface ArticleContentProps {
  content: ArticleContentType[];
  /** Raw HTML string — if provided, renders as rich HTML and ignores `content` blocks. */
  htmlContent?: string;
  /** JSON block content — if provided, uses BlockRenderer (no innerHTML). */
  jsonContent?: string;
}

/** Check if a string is valid JSON block document */
function isJsonBlockContent(raw: string): boolean {
  if (!raw || !raw.trim()) return false;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    // Check if it's a BlockDocument or array of blocks
    if (Array.isArray(parsed)) return true;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) return true;
    return false;
  } catch {
    return false;
  }
}

const ArticleContent = ({ content, htmlContent, jsonContent }: ArticleContentProps) => {
  // Priority 1: JSON block content (no innerHTML)
  if (jsonContent && isJsonBlockContent(jsonContent)) {
    return <BlockContentRenderer jsonContent={jsonContent} />;
  }

  // Priority 2: Check if htmlContent is actually JSON blocks
  if (htmlContent && isJsonBlockContent(htmlContent)) {
    return <BlockContentRenderer jsonContent={htmlContent} />;
  }

  // Priority 3: Raw HTML content (legacy support with DOMPurify)
  if (htmlContent && htmlContent.trim()) {
    return (
      <div
        className="article-body space-y-4 text-gray-900 [&_p]:text-lg [&_p]:leading-relaxed [&_p]:text-foreground [&_p]:mb-4
          [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4
          [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4
          [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-4
          [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/80
          [&_blockquote]:border-l-4 [&_blockquote]:border-foreground [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-6 [&_blockquote]:italic
          [&_img]:w-full [&_img]:h-auto [&_img]:my-6
          [&_figure]:my-6
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:text-lg [&_li]:text-foreground [&_li]:mb-2"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'img', 'a', 'figure', 'figcaption', 'table', 'thead',
            'tbody', 'tr', 'th', 'td', 'hr', 'pre', 'code', 'span', 'div', 'sup', 'sub'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'width', 'height',
            'colspan', 'rowspan'],
          ALLOW_DATA_ATTR: false,
        }) }}
      />
    );
  }

  // Priority 4: Structured content blocks (legacy)
  return (
    <div className="article-body space-y-4 text-gray-900">
      {content.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="text-lg leading-relaxed text-foreground"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={index} className="my-6">
              <div className="overflow-hidden">
                <img
                  src={block.src}
                  alt={block.caption || ""}
                  className="w-full h-auto"
                />
              </div>
              {block.caption && (
                <figcaption className="mt-3 flex items-start gap-2 px-4 py-3 bg-muted/30">
                  <Camera className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm italic text-muted-foreground">
                    {block.caption}
                  </span>
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-foreground pl-6 py-2 my-6"
            >
              <p className="font-serif text-xl italic text-foreground">
                {block.text}
              </p>
            </blockquote>
          );
        }

        return null;
      })}
    </div>
  );
};

export default ArticleContent;
