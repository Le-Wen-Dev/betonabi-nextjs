import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Image, ArrowLeft, Search, Eye, EyeOff, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pb } from "@/lib/pb";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArticleStatus, createArticle, ensureFeaturedLimit, getArticle, getUniqueArticleSlug, updateArticle, publishScheduledArticles } from "@/lib/articles";
import { getPbFileUrl } from "@/lib/pbFiles";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { toSlug } from "@/lib/utils";
import RichTextEditor from "@/components/admin/RichTextEditor";

const CATEGORIES_COLLECTION = "categories";

type CategoryOption = { value: string; label: string };
type CategoryRecord = {
  id: string;
  slug: string;
  name_vi?: string;
  name_jp?: string;
  name?: string;
};

interface ContentState {
  title: string;
  sapo: string;
  content: string;
}

function getErrorMessage(err: unknown) {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return null;
}

/** Return "" if the HTML is effectively empty (e.g. TipTap's default `<p></p>`). */
function sanitizeHtmlContent(html: string): string {
  const stripped = (html || "").replace(/<[^>]*>/g, "").trim();
  return stripped ? html.trim() : "";
}

function estimateReadingMinutes(text: string) {
  // Strip HTML tags to get plain text for word counting
  const raw = (text || "").replace(/<[^>]*>/g, " ").trim();
  if (!raw) return 1;
  const words = raw.split(/\s+/g).filter(Boolean).length;
  if (words > 0) return Math.max(1, Math.ceil(words / 220));
  // fallback char-based
  return Math.max(1, Math.ceil(raw.length / 1200));
}

// IMPORTANT: EditorField must be defined OUTSIDE AdminEditor to prevent re-creation on every render
const EditorField = ({
  lang,
  data,
  onChange,
}: {
  lang: string;
  data: ContentState;
  onChange: (data: ContentState) => void;
}) => {
  // Use local handlers to avoid creating new functions on every render
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, title: e.target.value });
  };

  const handleSapoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, sapo: e.target.value });
  };

  const handleContentChange = (html: string) => {
    onChange({ ...data, content: html });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-background border border-foreground/20 p-6">
        <Input
          value={data.title}
          onChange={handleTitleChange}
          placeholder={`Nhập tiêu đề bài viết (${lang})...`}
          className="border-0 p-0 font-serif text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 h-auto"
          autoComplete="off"
        />
      </div>

      {/* Sapo */}
      <div className="bg-background border border-foreground/20 p-6">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Sapo (Tóm tắt - {lang})
        </label>
        <Textarea
          value={data.sapo}
          onChange={handleSapoChange}
          placeholder={`Nhập đoạn sapo tóm tắt nội dung bài viết (${lang})...`}
          className="border-0 p-0 font-bold text-lg resize-none min-h-24 placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />
      </div>

      {/* Rich Text Content Editor */}
      <RichTextEditor
        content={data.content}
        onChange={handleContentChange}
        placeholder={`Bắt đầu viết nội dung bài viết (${lang})...`}
      />
    </div>
  );
};

function toDatetimeLocalValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const AUTOSAVE_KEY_PREFIX = "betonabi_draft_";
const AUTOSAVE_DELAY = 3000; // 3 seconds

const AdminEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { toast } = useToast();
  const { user, isAdmin, isAuthor } = useAuth();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<false | "draft" | "published" | "scheduled">(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);

  // State for Vietnamese content
  const [viContent, setViContent] = useState<ContentState>({
    title: "",
    sapo: "",
    content: "",
  });

  // State for Japanese content
  const [jpContent, setJpContent] = useState<ContentState>({
    title: "",
    sapo: "",
    content: "",
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // category ids (multi-select)
  const [loadedSlug, setLoadedSlug] = useState<string>("");
  const [publishedAtLabel, setPublishedAtLabel] = useState(""); // read-only display
  const [tags, setTags] = useState(""); // comma input, saved as json array
  const [location, setLocation] = useState("");
  const [readingMinutes, setReadingMinutes] = useState<string>(""); // allow manual override
  const [featured, setFeatured] = useState(false);
  const [editorsPick, setEditorsPick] = useState(false);
  const [longform, setLongform] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [loadedAuthorId, setLoadedAuthorId] = useState<string | null>(null);
  const [loadedStatus, setLoadedStatus] = useState<ArticleStatus | null>(null);
  const [loadedPublishedAtIso, setLoadedPublishedAtIso] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>("");

  // SEO state
  const [seoTitleVi, setSeoTitleVi] = useState("");
  const [seoTitleJp, setSeoTitleJp] = useState("");
  const [seoDescVi, setSeoDescVi] = useState("");
  const [seoDescJp, setSeoDescJp] = useState("");
  const [seoKeyphraseVi, setSeoKeyphraseVi] = useState("");
  const [seoKeyphraseJp, setSeoKeyphraseJp] = useState("");
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreviewUrl, setOgImagePreviewUrl] = useState<string | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noindex, setNoindex] = useState(false);

  const allowedCategoryIds = useMemo(() => {
    if (!isAuthor) return null;
    return new Set((user?.allowedCategories || []).filter(Boolean));
  }, [isAuthor, user?.allowedCategories]);

  // Auto-save key for localStorage
  const autoSaveKey = useMemo(() => {
    return `${AUTOSAVE_KEY_PREFIX}${editId || "new"}`;
  }, [editId]);

  // Load auto-saved draft from localStorage on mount
  useEffect(() => {
    if (editId) return; // Only for new articles
    try {
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.viContent) setViContent(data.viContent);
        if (data.jpContent) setJpContent(data.jpContent);
        if (data.selectedCategories) setSelectedCategories(data.selectedCategories);
        if (data.tags) setTags(data.tags);
        if (data.location) setLocation(data.location);
        if (data.readingMinutes) setReadingMinutes(data.readingMinutes);
        toast({
          title: "Đã khôi phục nháp",
          description: "Bài viết chưa lưu đã được khôi phục từ lần trước.",
        });
      }
    } catch (err) {
      // Ignore errors
    }
  }, [autoSaveKey, editId, toast]);

  // Auto-save to localStorage when content changes
  useEffect(() => {
    if (isSaving) return; // Don't auto-save while saving

    const timer = setTimeout(() => {
      try {
        const data = {
          viContent,
          jpContent,
          selectedCategories,
          tags,
          location,
          readingMinutes,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(autoSaveKey, JSON.stringify(data));
        setLastAutoSaved(new Date());
      } catch (err) {
        // Ignore errors (e.g., localStorage full)
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [viContent, jpContent, selectedCategories, tags, location, readingMinutes, autoSaveKey, isSaving]);

  // Clear auto-saved draft when successfully saved
  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(autoSaveKey);
      setLastAutoSaved(null);
    } catch (err) {
      // Ignore errors
    }
  }, [autoSaveKey]);

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (viContent.title || viContent.content || jpContent.title || jpContent.content) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [viContent, jpContent]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let res: { items: CategoryRecord[] };
        try {
          // ưu tiên sort theo name_vi nếu server/field hỗ trợ
          res = await pb.collection(CATEGORIES_COLLECTION).getList<CategoryRecord>(1, 200, { sort: "name_vi" });
        } catch (e: unknown) {
          // fallback cho server/collection chưa có name_vi hoặc không support sort đó
          res = await pb.collection(CATEGORIES_COLLECTION).getList<CategoryRecord>(1, 200, { sort: "name" });
        }
        let items = res.items;
        if (allowedCategoryIds) {
          items = items.filter((c) => allowedCategoryIds.has(c.id));
        }
        const opts: CategoryOption[] = items.map((c) => ({
          value: c.id,
          label: c.name_vi || c.name || c.slug,
        }));
        setCategories(opts);
      } catch (err: unknown) {
        // fallback silently (editor still usable for demo data)
        const msg = getErrorMessage(err);
        toast({
          title: "Không tải được danh mục",
          description: msg || "Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, [allowedCategoryIds, toast]);

  useEffect(() => {
    if (!editId) return;
    const run = async () => {
      setIsLoading(true);
      try {
        const a = await getArticle(editId);
        setViContent({
          title: a.title_vi || "",
          sapo: a.sapo_vi || "",
          content: a.content_vi || "",
        });
        setJpContent({
          title: a.title_jp || "",
          sapo: a.sapo_jp || "",
          content: a.content_jp || "",
        });
        // Load categories array
        const cats = a.categories && Array.isArray(a.categories) ? a.categories : [];
        setSelectedCategories(cats);
        setLoadedSlug(a.slug || "");
        setPublishedAtLabel(a.publishedAt ? toDatetimeLocalValue(a.publishedAt) : "");
        setLoadedPublishedAtIso(a.publishedAt || null);
        // If article is scheduled, restore scheduled datetime
        if (a.status === "scheduled" && a.publishedAt) {
          setScheduledAt(toDatetimeLocalValue(a.publishedAt));
        }
        setTags(Array.isArray(a.tags) ? a.tags.join(", ") : "");
        setLocation(a.location || "");
        setReadingMinutes(typeof a.readingMinutes === "number" ? String(a.readingMinutes) : "");
        setFeatured(!!a.featured);
        setEditorsPick(!!(a as any).editorsPick);
        setLongform(!!(a as any).longform);
        setLoadedAuthorId(a.author || null);
        setLoadedStatus((a.status as ArticleStatus | undefined) || null);

        // thumbnail preview (server url)
        if (a.thumbnail) {
          const url = getPbFileUrl(a, a.thumbnail);
          setThumbnailPreviewUrl(url);
        }

        // Load SEO fields
        setSeoTitleVi(a.seo_title_vi || "");
        setSeoTitleJp(a.seo_title_jp || "");
        setSeoDescVi(a.seo_description_vi || "");
        setSeoDescJp(a.seo_description_jp || "");
        setSeoKeyphraseVi(a.seo_keyphrase_vi || "");
        setSeoKeyphraseJp(a.seo_keyphrase_jp || "");
        setCanonicalUrl(a.canonical_url || "");
        setNoindex(a.noindex === "true");
        if (a.og_image) {
          setOgImagePreviewUrl(getPbFileUrl(a, a.og_image));
        }
      } catch (err: unknown) {
        toast({
          title: "Không tải được bài viết",
          description: "Vui lòng thử lại.",
          variant: "destructive",
        });
        navigate("/admin/articles");
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [editId, navigate, toast]);

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  const canUseCategory = (categoryId: string) => {
    if (!isAuthor) return true;
    if (!allowedCategoryIds) return false;
    return allowedCategoryIds.has(categoryId);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const save = async (status: ArticleStatus) => {
    if (!user?.id) {
      toast({ title: "Chưa đăng nhập", variant: "destructive" });
      return;
    }
    // Check permission for all selected categories
    const unauthorizedCat = selectedCategories.find(catId => !canUseCategory(catId));
    if (unauthorizedCat) {
      toast({
        title: "Không có quyền chuyên mục",
        description: "Author chỉ được viết trong các danh mục được cấp quyền.",
        variant: "destructive",
      });
      return;
    }

    if (isAuthor && editId && loadedStatus === "published") {
      toast({
        title: "Không đủ quyền",
        description: "Bài đã publish không thể sửa bởi author.",
        variant: "destructive",
      });
      return;
    }

    // Handle scheduled status
    let nextStatus: ArticleStatus;
    let publishedAtIso: string | undefined;

    if (status === "scheduled") {
      if (!scheduledAt) {
        toast({
          title: "Thiếu thời gian hẹn giờ",
          description: "Vui lòng chọn ngày giờ để đặt lịch đăng bài.",
          variant: "destructive",
        });
        return;
      }
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        toast({
          title: "Thời gian không hợp lệ",
          description: "Thời gian đặt lịch phải sau thời điểm hiện tại.",
          variant: "destructive",
        });
        return;
      }
      nextStatus = isAdmin ? "scheduled" : "pending";
      publishedAtIso = scheduledDate.toISOString();
    } else if (status === "published") {
      nextStatus = isAdmin ? "published" : "pending";
      publishedAtIso =
        nextStatus === "published"
          ? (editId && loadedStatus === "published" && loadedPublishedAtIso
            ? loadedPublishedAtIso
            : new Date().toISOString())
          : undefined;
    } else {
      nextStatus = "draft";
      publishedAtIso = undefined;
    }

    setIsSaving(nextStatus === "published" ? "published" : nextStatus === "scheduled" ? "scheduled" : nextStatus === "pending" ? "published" : "draft");
    try {
      const authorId = editId ? (loadedAuthorId || user.id) : user.id;

      // Slug is always generated from the current title
      const baseSlug = toSlug(viContent.title || jpContent.title || "") || (editId ? (loadedSlug || "").trim() : "");
      if (!baseSlug) {
        toast({
          title: "Thiếu slug",
          description: "Vui lòng nhập tiêu đề (VI/JP).",
          variant: "destructive",
        });
        return;
      }

      // NOTE: Author may not have permission to list other authors' articles,
      // so slug pre-check can be inaccurate (unique constraint error on create).
      // We'll still try to pre-check, but also retry on "not unique" errors.
      let uniqueSlug = baseSlug;
      try {
        uniqueSlug = await getUniqueArticleSlug(baseSlug, editId || undefined);
      } catch {
        uniqueSlug = baseSlug;
      }

      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const minsParsed = Number.parseInt(readingMinutes, 10);
      const minutes =
        Number.isFinite(minsParsed) && minsParsed > 0
          ? minsParsed
          : estimateReadingMinutes((viContent.content || "") + "\n" + (jpContent.content || ""));

      const input = {
        slug: uniqueSlug,
        title_vi: viContent.title.trim(),
        sapo_vi: viContent.sapo.trim(),
        content_vi: sanitizeHtmlContent(viContent.content),
        title_jp: jpContent.title.trim(),
        sapo_jp: jpContent.sapo.trim(),
        content_jp: sanitizeHtmlContent(jpContent.content),
        categories: selectedCategories, // all selected categories
        author: authorId,
        status: nextStatus,
        publishedAt: publishedAtIso,
        tags: tagsArray,
        location: location.trim(),
        readingMinutes: minutes,
        featured: isAdmin ? featured : false,
        editorsPick: isAdmin ? editorsPick : false,
        longform: isAdmin ? longform : false,
        thumbnailFile,
        // SEO
        seo_title_vi: seoTitleVi.trim(),
        seo_title_jp: seoTitleJp.trim(),
        seo_description_vi: seoDescVi.trim(),
        seo_description_jp: seoDescJp.trim(),
        seo_keyphrase_vi: seoKeyphraseVi.trim(),
        seo_keyphrase_jp: seoKeyphraseJp.trim(),
        ogImageFile,
        canonical_url: canonicalUrl.trim(),
        noindex,
      };

      const isSlugNotUniqueError = (err: unknown) => {
        if (!err) return false;
        const e = err as { message?: unknown; data?: any; response?: any };
        const code =
          e?.data?.slug?.code ||
          e?.response?.data?.slug?.code ||
          e?.data?.data?.slug?.code ||
          e?.response?.data?.data?.slug?.code;
        if (code === "validation_not_unique") return true;
        const msg = typeof e?.message === "string" ? e.message : "";
        if (/slug/i.test(msg) && /(unique|exists|đã tồn tại|not unique)/i.test(msg)) return true;
        try {
          const raw = JSON.stringify(e?.data || e?.response?.data || {});
          if (/validation_not_unique/.test(raw) && /slug/.test(raw)) return true;
        } catch {
          // ignore
        }
        return false;
      };

      const withSlug = (s: string) => ({ ...input, slug: s });

      if (editId) {
        // retry slug if unique constraint fails
        let lastErr: unknown = null;
        for (let i = 0; i < 10; i++) {
          const candidate = i === 0 ? input.slug : `${baseSlug}-${i + 1}`;
          try {
            await updateArticle(editId, withSlug(candidate));
            uniqueSlug = candidate;
            lastErr = null;
            break;
          } catch (err: unknown) {
            lastErr = err;
            if (isSlugNotUniqueError(err)) continue;
            throw err;
          }
        }
        if (lastErr) throw lastErr;
        if (isAdmin && featured) {
          await ensureFeaturedLimit({ keepIds: [editId], limit: 2 });
        }
        if (isAdmin && editorsPick) {
          await ensureFeaturedLimit({ keepIds: [editId], limit: 1, field: "editorsPick" });
        }
        if (isAdmin && longform) {
          await ensureFeaturedLimit({ keepIds: [editId], limit: 1, field: "longform" });
        }
        toast({
          title: "Đã lưu",
          description:
            nextStatus === "pending"
              ? "Bài viết đã gửi duyệt."
              : nextStatus === "published"
                ? "Bài viết đã xuất bản."
                : nextStatus === "scheduled"
                  ? `Bài viết đã được đặt lịch đăng vào ${new Date(publishedAtIso!).toLocaleString("vi-VN")}.`
                  : "Bài viết đã được cập nhật.",
        });
      } else {
        // retry slug if unique constraint fails
        let created: { id: string } | null = null;
        let lastErr: unknown = null;
        for (let i = 0; i < 10; i++) {
          const candidate = i === 0 ? input.slug : `${baseSlug}-${i + 1}`;
          try {
            created = await createArticle(withSlug(candidate));
            uniqueSlug = candidate;
            lastErr = null;
            break;
          } catch (err: unknown) {
            lastErr = err;
            if (isSlugNotUniqueError(err)) continue;
            throw err;
          }
        }
        if (!created) throw lastErr;
        if (isAdmin && featured) {
          await ensureFeaturedLimit({ keepIds: [created.id], limit: 2 });
        }
        if (isAdmin && editorsPick) {
          await ensureFeaturedLimit({ keepIds: [created.id], limit: 1, field: "editorsPick" });
        }
        if (isAdmin && longform) {
          await ensureFeaturedLimit({ keepIds: [created.id], limit: 1, field: "longform" });
        }
        toast({
          title: "Đã tạo",
          description:
            nextStatus === "pending"
              ? "Bài viết đã gửi duyệt."
              : nextStatus === "published"
                ? "Bài viết đã xuất bản."
                : nextStatus === "scheduled"
                  ? `Bài viết đã được đặt lịch đăng vào ${new Date(publishedAtIso!).toLocaleString("vi-VN")}.`
                  : "Đã lưu nháp.",
        });
      }

      // Clear auto-saved draft after successful save
      clearAutoSave();

      navigate("/admin/articles");
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Vui lòng kiểm tra API rules của collection `articles`.";
      toast({
        title: "Lưu thất bại",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/articles")}
          className="hover:bg-foreground/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {editId ? "Chỉnh sửa bài viết" : "Viết bài mới"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {editId
              ? "Cập nhật nội dung bài viết đa ngôn ngữ"
              : "Tạo bài viết mới đa ngôn ngữ (Việt - Nhật)"
            }
            {lastAutoSaved && (
              <span className="ml-2 text-xs text-green-600">
                • Đã tự động lưu lúc {lastAutoSaved.toLocaleTimeString("vi-VN")}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-none border-foreground/20"
            disabled={isLoading || !!isSaving}
            onClick={() => save("draft")}
          >
            {isSaving === "draft" ? "Đang lưu..." : "Lưu nháp"}
          </Button>
          <Button
            onClick={() => save("published")}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-none"
            disabled={isLoading || !!isSaving}
          >
            {isSaving === "published"
              ? "Đang lưu..."
              : (isAuthor ? "Gửi duyệt" : (editId ? (loadedStatus === "published" ? "Lưu" : "Xuất bản") : "Xuất bản"))}
          </Button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="vi" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-foreground/20 bg-transparent p-0 mb-6 h-auto">
              <TabsTrigger
                value="vi"
                className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif text-lg data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Tiếng Việt
              </TabsTrigger>
              <TabsTrigger
                value="jp"
                className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif text-lg data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Tiếng Nhật
              </TabsTrigger>
            </TabsList>

            {/* forceMount keeps TipTap editors alive when switching tabs */}
            <TabsContent value="vi" forceMount className="mt-0 data-[state=inactive]:hidden">
              <EditorField
                lang="Tiếng Việt"
                data={viContent}
                onChange={setViContent}
              />
            </TabsContent>

            <TabsContent value="jp" forceMount className="mt-0 data-[state=inactive]:hidden">
              <EditorField
                lang="Tiếng Nhật"
                data={jpContent}
                onChange={setJpContent}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Settings */}
        <div className="pt-[60px]">
          <Accordion type="multiple" defaultValue={["general", "thumbnail", "schedule"]} className="border border-foreground/20 bg-background">

            {/* General: Category + Tags + Location + Reading minutes + Display options */}
            <AccordionItem value="general" className="border-foreground/10">
              <AccordionTrigger className="px-4 py-3 text-sm font-bold hover:no-underline">
                Cài đặt chung
              </AccordionTrigger>
              <AccordionContent className="px-4 space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Chuyên mục {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                  </label>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto">
                    {categories.map((cat) => (
                      <label
                        key={cat.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.value)}
                          onChange={() => toggleCategory(cat.value)}
                          className="w-3.5 h-3.5 rounded border-foreground/20"
                        />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                  {categories.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Chưa có danh mục nào</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Thẻ tags</label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="VD: kinh-doanh, osaka, du-lich"
                    className="rounded-none border-foreground/20 h-8 text-sm"
                    disabled={isLoading}
                  />
                </div>

                {/* Location + Reading minutes side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Vị trí</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Osaka, JP"
                      className="rounded-none border-foreground/20 h-8 text-sm"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Phút đọc</label>
                    <Input
                      type="number"
                      min={1}
                      value={readingMinutes}
                      onChange={(e) => setReadingMinutes(e.target.value)}
                      placeholder="Tự tính"
                      className="rounded-none border-foreground/20 h-8 text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Display options (admin only) */}
                {isAdmin && (
                  <div className="space-y-2 pt-2 border-t border-foreground/10">
                    <label className="block text-xs font-medium text-muted-foreground">Tùy chọn hiển thị</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Bài nổi bật (Featured)</span>
                      <Switch checked={featured} onCheckedChange={setFeatured} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Longform</span>
                      <Switch checked={longform} onCheckedChange={setLongform} />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Thumbnail */}
            <AccordionItem value="thumbnail" className="border-foreground/10">
              <AccordionTrigger className="px-4 py-3 text-sm font-bold hover:no-underline">
                Ảnh đại diện
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <input
                  id="thumbnailUpload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setThumbnailFile(f);
                    if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(thumbnailPreviewUrl);
                    }
                    setThumbnailPreviewUrl(f ? URL.createObjectURL(f) : null);
                  }}
                />
                <label
                  htmlFor="thumbnailUpload"
                  className="block border border-dashed border-foreground/20 p-4 text-center cursor-pointer hover:bg-foreground/5 transition-colors"
                >
                  {thumbnailPreviewUrl ? (
                    <img src={thumbnailPreviewUrl} alt="" className="w-full h-36 object-cover mb-2" />
                  ) : (
                    <Image className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Click để tải ảnh (PNG, JPG, WebP, GIF)
                  </p>
                </label>
              </AccordionContent>
            </AccordionItem>

            {/* Schedule / Publish date */}
            <AccordionItem value="schedule" className="border-foreground/10">
              <AccordionTrigger className="px-4 py-3 text-sm font-bold hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Lịch đăng bài
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 space-y-3">
                {/* Published date (read-only) */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Ngày xuất bản</label>
                  <Input
                    type="datetime-local"
                    value={publishedAtLabel}
                    readOnly
                    className="rounded-none border-foreground/20 h-8 text-sm"
                    disabled
                  />
                  {loadedStatus === "scheduled" && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Đã đặt lịch đăng
                    </p>
                  )}
                </div>

                {/* Schedule (admin only) */}
                {isAdmin && (
                  <div className="space-y-3 pt-2 border-t border-foreground/10">
                    <p className="text-xs text-muted-foreground">
                      Bài viết sẽ tự động xuất bản vào thời gian đã chọn.
                    </p>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      className="rounded-none border-foreground/20 h-8 text-sm"
                      disabled={isLoading}
                    />
                    {scheduledAt && (
                      <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                        Sẽ đăng vào: {new Date(scheduledAt).toLocaleString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                    <Button
                      onClick={() => save("scheduled")}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-none h-8 text-sm"
                      disabled={isLoading || !!isSaving || !scheduledAt}
                    >
                      {isSaving === "scheduled" ? (
                        "Đang đặt lịch..."
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Xác nhận đặt lịch
                        </>
                      )}
                    </Button>
                    {loadedStatus === "scheduled" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setScheduledAt("");
                          save("draft");
                        }}
                        className="w-full rounded-none border-blue-300 text-blue-700 hover:bg-blue-50 h-8 text-sm"
                        disabled={isLoading || !!isSaving}
                      >
                        Hủy đặt lịch (chuyển về nháp)
                      </Button>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* SEO */}
            <AccordionItem value="seo" className="border-foreground/10">
              <AccordionTrigger className="px-4 py-3 text-sm font-bold hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-green-600" />
                  SEO
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <SeoPanel
                  seoTitleVi={seoTitleVi} setSeoTitleVi={setSeoTitleVi}
                  seoTitleJp={seoTitleJp} setSeoTitleJp={setSeoTitleJp}
                  seoDescVi={seoDescVi} setSeoDescVi={setSeoDescVi}
                  seoDescJp={seoDescJp} setSeoDescJp={setSeoDescJp}
                  seoKeyphraseVi={seoKeyphraseVi} setSeoKeyphraseVi={setSeoKeyphraseVi}
                  seoKeyphraseJp={seoKeyphraseJp} setSeoKeyphraseJp={setSeoKeyphraseJp}
                  ogImageFile={ogImageFile} setOgImageFile={setOgImageFile}
                  ogImagePreviewUrl={ogImagePreviewUrl} setOgImagePreviewUrl={setOgImagePreviewUrl}
                  canonicalUrl={canonicalUrl} setCanonicalUrl={setCanonicalUrl}
                  noindex={noindex} setNoindex={setNoindex}
                  titleVi={viContent.title} titleJp={jpContent.title}
                  slug={toSlug(viContent.title || jpContent.title || "") || loadedSlug}
                  isLoading={isLoading}
                />
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </div>
    </div>
  );
};

/* ─── SEO Panel Component ─── */

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color = len === 0 ? "text-muted-foreground" : len <= max ? "text-green-600" : "text-red-500";
  return <span className={`text-xs ${color}`}>{len}/{max}</span>;
}

function GooglePreview({ title, slug, description }: { title: string; slug: string; description: string }) {
  const displayTitle = title || "Tiêu đề bài viết";
  const displayDesc = description || "Mô tả bài viết sẽ hiển thị ở đây...";
  const displayUrl = `betonabi.com › ${slug || "bai-viet"}`;
  return (
    <div className="border border-foreground/10 rounded p-3 bg-white">
      <div className="text-xs text-muted-foreground mb-0.5">{displayUrl}</div>
      <div className="text-blue-700 text-sm font-medium leading-tight line-clamp-2">{displayTitle}</div>
      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{displayDesc}</div>
    </div>
  );
}

function SeoPanel({
  seoTitleVi, setSeoTitleVi,
  seoTitleJp, setSeoTitleJp,
  seoDescVi, setSeoDescVi,
  seoDescJp, setSeoDescJp,
  seoKeyphraseVi, setSeoKeyphraseVi,
  seoKeyphraseJp, setSeoKeyphraseJp,
  ogImageFile, setOgImageFile,
  ogImagePreviewUrl, setOgImagePreviewUrl,
  canonicalUrl, setCanonicalUrl,
  noindex, setNoindex,
  titleVi, titleJp, slug, isLoading,
}: {
  seoTitleVi: string; setSeoTitleVi: (v: string) => void;
  seoTitleJp: string; setSeoTitleJp: (v: string) => void;
  seoDescVi: string; setSeoDescVi: (v: string) => void;
  seoDescJp: string; setSeoDescJp: (v: string) => void;
  seoKeyphraseVi: string; setSeoKeyphraseVi: (v: string) => void;
  seoKeyphraseJp: string; setSeoKeyphraseJp: (v: string) => void;
  ogImageFile: File | null; setOgImageFile: (f: File | null) => void;
  ogImagePreviewUrl: string | null; setOgImagePreviewUrl: (u: string | null) => void;
  canonicalUrl: string; setCanonicalUrl: (v: string) => void;
  noindex: boolean; setNoindex: (v: boolean) => void;
  titleVi: string; titleJp: string; slug: string; isLoading: boolean;
}) {
  const [tab, setTab] = useState<"vi" | "jp">("vi");

  const seoTitle = tab === "vi" ? seoTitleVi : seoTitleJp;
  const setSeoTitle = tab === "vi" ? setSeoTitleVi : setSeoTitleJp;
  const seoDesc = tab === "vi" ? seoDescVi : seoDescJp;
  const setSeoDesc = tab === "vi" ? setSeoDescVi : setSeoDescJp;
  const keyphrase = tab === "vi" ? seoKeyphraseVi : seoKeyphraseJp;
  const setKeyphrase = tab === "vi" ? setSeoKeyphraseVi : setSeoKeyphraseJp;
  const fallbackTitle = tab === "vi" ? titleVi : titleJp;

  return (
    <div className="space-y-4">
          {/* Language tabs */}
          <div className="flex gap-1 bg-foreground/5 p-0.5 rounded">
            <button type="button" onClick={() => setTab("vi")}
              className={`flex-1 text-xs font-medium py-1.5 rounded transition-colors ${tab === "vi" ? "bg-background shadow-sm" : "hover:bg-foreground/5"}`}>
              Tiếng Việt
            </button>
            <button type="button" onClick={() => setTab("jp")}
              className={`flex-1 text-xs font-medium py-1.5 rounded transition-colors ${tab === "jp" ? "bg-background shadow-sm" : "hover:bg-foreground/5"}`}>
              Tiếng Nhật
            </button>
          </div>

          {/* Focus Keyphrase */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Focus keyphrase</label>
            <Input value={keyphrase} onChange={(e) => setKeyphrase(e.target.value)}
              placeholder="VD: du lịch Nhật Bản" className="rounded-none border-foreground/20 text-sm h-8" disabled={isLoading} />
          </div>

          {/* Google Preview */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Google Preview</label>
            <GooglePreview title={seoTitle || fallbackTitle} slug={slug} description={seoDesc} />
          </div>

          {/* SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">SEO Title</label>
              <CharCounter value={seoTitle} max={60} />
            </div>
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={fallbackTitle || "Nhập SEO title..."} className="rounded-none border-foreground/20 text-sm h-8" disabled={isLoading} />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
              <CharCounter value={seoDesc} max={160} />
            </div>
            <Textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)}
              placeholder="Nhập mô tả cho kết quả tìm kiếm..." className="rounded-none border-foreground/20 text-sm min-h-16 resize-none" disabled={isLoading} />
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Ảnh OG (Social sharing)</label>
            <input id="ogImageUpload" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setOgImageFile(f);
                if (ogImagePreviewUrl && ogImagePreviewUrl.startsWith("blob:")) URL.revokeObjectURL(ogImagePreviewUrl);
                setOgImagePreviewUrl(f ? URL.createObjectURL(f) : null);
              }} />
            <label htmlFor="ogImageUpload"
              className="block border border-dashed border-foreground/20 p-3 text-center cursor-pointer hover:bg-foreground/5 transition-colors text-xs text-muted-foreground">
              {ogImagePreviewUrl ? (
                <img src={ogImagePreviewUrl} alt="" className="w-full h-24 object-cover mb-1" />
              ) : "Click để chọn ảnh OG (mặc định dùng thumbnail)"}
            </label>
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Canonical URL</label>
            <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="Để trống nếu không cần" className="rounded-none border-foreground/20 text-sm h-8" disabled={isLoading} />
          </div>

          {/* Noindex */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-foreground flex items-center gap-1">
                {noindex ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                Ẩn khỏi Search Engine
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Thêm meta noindex</div>
            </div>
            <Switch checked={noindex} onCheckedChange={setNoindex} />
          </div>
    </div>
  );
}

export default AdminEditor;
