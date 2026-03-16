'use client';

import { useCallback, useRef, useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Code,
  Loader2,
  Images,
  Plus,
  Pilcrow,
  Search,
  GalleryHorizontal,
  type LucideIcon,
} from "lucide-react";
import { uploadMedia } from "@/lib/media";
import { getPbFileUrl } from "@/lib/pbFiles";
import { compressImage, validateImageFile } from "@/lib/imageUtils";
import DOMPurify from "dompurify";
import { toast } from "@/components/ui/use-toast";
import { MediaGallery } from "@/components/admin/MediaGallery";

/** Validate that a URL is safe (http/https only) */
function isValidUrl(url: string, allowMailto = false): boolean {
  try {
    const parsed = new URL(url);
    const allowed = allowMailto
      ? ["http:", "https:", "mailto:", "tel:"]
      : ["http:", "https:"];
    return allowed.includes(parsed.protocol);
  } catch {
    return false;
  }
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

async function uploadImageToPocketBase(file: File): Promise<string | null> {
  const error = validateImageFile(file, 100);
  if (error) {
    toast({ title: "Ảnh không hợp lệ", description: error, variant: "destructive" });
    return null;
  }

  try {
    const compressed = await compressImage(file, 1920, 1920, 0.85, 5);
    const record = await uploadMedia(compressed, file.name);
    if (!record || !record.file) {
      toast({ title: "Lỗi tải ảnh", description: "Không thể tải ảnh lên server.", variant: "destructive" });
      return null;
    }
    const url = getPbFileUrl(record, record.file);
    if (url && !isValidUrl(url)) {
      toast({ title: "Lỗi tải ảnh", description: "URL ảnh không hợp lệ.", variant: "destructive" });
      return null;
    }
    return url || null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    toast({ title: "Lỗi tải ảnh", description: msg, variant: "destructive" });
    return null;
  }
}

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0); // count of in-flight uploads
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  // Track whether we've synced external content into the editor at least once
  const hasSyncedRef = useRef(false);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Image.configure({
          HTMLAttributes: { class: "max-w-full h-auto rounded" },
          allowBase64: false,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-blue-600 underline hover:text-blue-800" },
        }),
        Underline,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder: placeholder || "Bắt đầu viết nội dung..." }),
      ],
      content: content || "",
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none p-6 min-h-[400px] focus:outline-none " +
          "prose-headings:font-serif prose-img:rounded prose-img:mx-auto " +
          "prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-foreground/20 " +
          "prose-h2:border-l-4 prose-h2:border-red-800 prose-h2:pl-6 " +
          "prose-blockquote:bg-gray-50 prose-blockquote:p-8 prose-blockquote:rounded-sm",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false;
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
        const files = Array.from(event.dataTransfer.files).filter((f) => {
          if (!f.type.startsWith("image/")) return false;
          if (f.size > MAX_FILE_SIZE) {
            toast({ title: "File quá lớn", description: `${f.name} vượt quá 100MB`, variant: "destructive" });
            return false;
          }
          return true;
        });
        if (!files.length) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        (async () => {
          setUploading((n) => n + files.length);
          for (const file of files) {
            try {
              const url = await uploadImageToPocketBase(file);
              if (url && isValidUrl(url) && coords) {
                const node = view.state.schema.nodes.image.create({ src: url });
                const tr = view.state.tr.insert(coords.pos, node);
                view.dispatch(tr);
              }
            } finally {
              setUploading((n) => Math.max(0, n - 1));
            }
          }
        })();
        return true;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const imageItems = Array.from(items).filter((item) =>
          item.type.startsWith("image/")
        );
        if (!imageItems.length) return false;
        event.preventDefault();
        (async () => {
          setUploading((n) => n + imageItems.length);
          for (const item of imageItems) {
            const file = item.getAsFile();
            if (!file) {
              setUploading((n) => Math.max(0, n - 1));
              continue;
            }
            try {
              const url = await uploadImageToPocketBase(file);
              if (url && isValidUrl(url)) {
                const node = view.state.schema.nodes.image.create({ src: url });
                const tr = view.state.tr.replaceSelectionWith(node);
                view.dispatch(tr);
              }
            } finally {
              setUploading((n) => Math.max(0, n - 1));
            }
          }
        })();
        return true;
      },
    },
  });

  // BUG FIX: Sync external content into editor when it changes from outside
  // (e.g. when loading an existing article for editing).
  // TipTap's `content` option only sets the initial value — it does NOT react to prop changes.
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const incoming = content || "";
    const editorIsEmpty = currentHtml === "<p></p>" || currentHtml === "";
    const contentChanged = incoming !== currentHtml;

    if (contentChanged && (editorIsEmpty || !hasSyncedRef.current) && incoming) {
      // Sanitize incoming HTML before setting it in the editor
      const sanitized = DOMPurify.sanitize(incoming, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'img', 'a', 'figure', 'figcaption', 'table', 'thead',
          'tbody', 'tr', 'th', 'td', 'hr', 'pre', 'code', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'width', 'height'],
        ALLOW_DATA_ATTR: false,
      });
      editor.commands.setContent(sanitized, { emitUpdate: false });
      hasSyncedRef.current = true;
    } else if (!hasSyncedRef.current && incoming) {
      hasSyncedRef.current = true;
    }
  }, [editor, content]);

  // Cleanup editor on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length || !editor) return;
      setUploading((n) => n + files.length);
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setUploading((n) => Math.max(0, n - 1));
          continue;
        }
        try {
          const url = await uploadImageToPocketBase(file);
          if (url && isValidUrl(url)) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        } finally {
          setUploading((n) => Math.max(0, n - 1));
        }
      }
      e.target.value = "";
    },
    [editor]
  );

  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Nhập URL:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      if (!isValidUrl(url, true)) {
        toast({ title: "URL không hợp lệ", description: "Chỉ hỗ trợ http, https, mailto, tel.", variant: "destructive" });
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const handleMediaSelect = useCallback(
    (url: string) => {
      if (editor && isValidUrl(url)) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="bg-background border border-foreground/20 relative">
      {/* Toolbar - sticky so it stays visible when scrolling */}
      <div className="sticky top-0 z-20 bg-background">
        <EditorToolbar
          editor={editor}
          onImageClick={handleImageUploadClick}
          onLinkClick={handleLinkClick}
          onMediaGalleryClick={() => setShowMediaGallery(true)}
        />
      </div>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
      {/* Editor content */}
      <EditorContent editor={editor} />
      {/* Inline "+" inserter — appears on empty lines like WordPress Gutenberg */}
      <InlineBlockInserter
        editor={editor}
        onImageClick={handleImageUploadClick}
        onMediaGalleryClick={() => setShowMediaGallery(true)}
      />
      {/* Upload indicator */}
      {uploading > 0 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-foreground/90 text-background px-3 py-1.5 rounded-full text-sm shadow-lg z-30">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang tải ảnh... ({uploading})</span>
        </div>
      )}
      {/* Media Gallery Modal */}
      {showMediaGallery && (
        <MediaGallery
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaGallery(false)}
        />
      )}
    </div>
  );
};

/* ─── Block Types for Inserter (WordPress Gutenberg-style grid) ─── */

type BlockType = {
  icon: LucideIcon;
  label: string;
  action: (editor: Editor, onImage?: () => void, onGallery?: () => void) => void;
};

const BLOCK_TYPES: BlockType[] = [
  { icon: Pilcrow, label: "Đoạn", action: (e) => e.chain().focus().setParagraph().run() },
  { icon: ImageIcon, label: "Hình ảnh", action: (_e, onImg) => onImg?.() },
  { icon: Heading2, label: "Tiêu đề", action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: GalleryHorizontal, label: "Thư viện ảnh", action: (_e, _onImg, onGallery) => onGallery?.() },
  { icon: List, label: "Danh sách", action: (e) => e.chain().focus().toggleBulletList().run() },
  { icon: Quote, label: "Trích dẫn", action: (e) => e.chain().focus().toggleBlockquote().run() },
  { icon: Heading1, label: "Heading 1", action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { icon: Heading3, label: "Heading 3", action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { icon: ListOrdered, label: "Danh sách số", action: (e) => e.chain().focus().toggleOrderedList().run() },
  { icon: Minus, label: "Đường kẻ", action: (e) => e.chain().focus().setHorizontalRule().run() },
  { icon: Code, label: "Code", action: (e) => e.chain().focus().toggleCodeBlock().run() },
  { icon: Images, label: "Chọn từ Media", action: (_e, _onImg, onGallery) => onGallery?.() },
];

/* ─── Block Inserter Popup (grid layout like WordPress) ─── */

function BlockInserterPopup({
  editor,
  open,
  onClose,
  onImageClick,
  onGalleryClick,
}: {
  editor: Editor;
  open: boolean;
  onClose: () => void;
  onImageClick: () => void;
  onGalleryClick: () => void;
}) {
  const [search, setSearch] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Reset search when closing
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  if (!open) return null;

  const filtered = search.trim()
    ? BLOCK_TYPES.filter((b) => b.label.toLowerCase().includes(search.toLowerCase()))
    : BLOCK_TYPES.slice(0, 6); // Show first 6 by default (like WordPress)

  const showAll = !search.trim() && BLOCK_TYPES.length > 6;

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-10 z-40 w-[260px] bg-background border border-foreground/20 shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Search */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full text-sm border border-foreground/15 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-foreground/40 bg-background"
          />
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5 px-2 pb-2">
        {filtered.map((block) => (
          <button
            key={block.label}
            type="button"
            onClick={() => {
              block.action(editor, onImageClick, onGalleryClick);
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-md hover:bg-foreground/5 transition-colors"
          >
            <block.icon className="w-6 h-6 text-foreground/60" />
            <span className="text-[11px] text-foreground/70 text-center leading-tight">{block.label}</span>
          </button>
        ))}
      </div>
      {/* Show all */}
      {showAll && (
        <button
          type="button"
          onClick={() => setSearch(" ")} // trigger showing all by setting non-empty search
          className="w-full text-xs text-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 py-2.5 border-t border-foreground/10 font-medium transition-colors"
        >
          Xem tất cả
        </button>
      )}
    </div>
  );
}

/* ─── Inline Block Inserter (custom positioned, no FloatingMenu) ─── */

function InlineBlockInserter({
  editor,
  onImageClick,
  onMediaGalleryClick,
}: {
  editor: Editor;
  onImageClick: () => void;
  onMediaGalleryClick: () => void;
}) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [topPx, setTopPx] = useState(0);

  useEffect(() => {
    const update = () => {
      const { selection } = editor.state;
      const { $from } = selection;
      const node = $from.node();
      const isEmpty =
        node.type.name === "paragraph" && node.content.size === 0;

      setVisible(isEmpty);

      if (isEmpty) {
        try {
          const coords = editor.view.coordsAtPos(selection.from);
          const editorContainer = editor.view.dom.parentElement;
          if (editorContainer) {
            const containerRect = editorContainer.getBoundingClientRect();
            setTopPx(coords.top - containerRect.top + (coords.bottom - coords.top) / 2 - 14);
          }
        } catch {
          // ignore coord errors
        }
      } else {
        setPopupOpen(false);
      }
    };

    editor.on("selectionUpdate", update);
    editor.on("update", update);
    // Run once on mount
    update();
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("update", update);
    };
  }, [editor]);

  return (
    <div
      className="absolute right-3 z-30"
      style={{ top: `${topPx}px` }}
    >
      <div className="flex flex-col items-center relative">
        <button
          type="button"
          onClick={() => setPopupOpen((v) => !v)}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 bg-foreground text-background border-foreground ${
            popupOpen ? "rotate-45" : ""
          }`}
          title="Thêm khối nội dung"
        >
          <Plus className="w-4 h-4" />
        </button>
        <BlockInserterPopup
          editor={editor}
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          onImageClick={onImageClick}
          onGalleryClick={onMediaGalleryClick}
        />
      </div>
    </div>
  );
}

/* ─── Toolbar ─── */

function ToolbarBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      className={`h-8 w-8 hover:bg-foreground/5 ${active ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-6 bg-foreground/10 mx-1" />;
}

function EditorToolbar({
  editor,
  onImageClick,
  onLinkClick,
  onMediaGalleryClick,
}: {
  editor: Editor;
  onImageClick: () => void;
  onLinkClick: () => void;
  onMediaGalleryClick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-foreground/20">
      {/* Undo / Redo */}
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo className="w-4 h-4" />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Headings */}
      <ToolbarBtn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 className="w-4 h-4" />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Text formatting */}
      <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <Bold className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <Italic className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Code">
        <Code className="w-4 h-4" />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Alignment */}
      <ToolbarBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align Left">
        <AlignLeft className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align Center">
        <AlignCenter className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align Right">
        <AlignRight className="w-4 h-4" />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Lists */}
      <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
        <List className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">
        <ListOrdered className="w-4 h-4" />
      </ToolbarBtn>

      {/* Blockquote */}
      <ToolbarBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
        <Quote className="w-4 h-4" />
      </ToolbarBtn>

      {/* Horizontal Rule */}
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus className="w-4 h-4" />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Link */}
      <ToolbarBtn active={editor.isActive("link")} onClick={onLinkClick} title="Link">
        <LinkIcon className="w-4 h-4" />
      </ToolbarBtn>

      {/* Image */}
      <ToolbarBtn onClick={onImageClick} title="Upload Image">
        <ImageIcon className="w-4 h-4" />
      </ToolbarBtn>

      {/* Media Gallery */}
      <ToolbarBtn onClick={onMediaGalleryClick} title="Chọn từ Media">
        <Images className="w-4 h-4" />
      </ToolbarBtn>
    </div>
  );
}

export default RichTextEditor;

