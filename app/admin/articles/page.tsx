'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, Search } from "lucide-react";
import CategoryPagination from "@/components/CategoryPagination";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArticleRecord, approveArticle, deleteArticle, ensureFeaturedLimit, listArticles, rejectArticle, publishScheduledArticles } from "@/lib/articles";
import { getPbFileUrl } from "@/lib/pbFiles";
import { pb } from "@/lib/pb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryRecord = {
  id: string;
  slug: string;
  name_vi?: string;
  name?: string;
};

const AdminArticles = () => {
  const { toast } = useToast();
  const { user, isAuthor, isAdmin } = useAuth();

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const allowedCategoryIds = useMemo(() => {
    if (!isAuthor) return null;
    return new Set((user?.allowedCategories || []).filter(Boolean));
  }, [isAuthor, user?.allowedCategories]);
  const categoriesById = useMemo(() => {
    const m = new Map<string, CategoryRecord>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const [page, setPage] = useState(1);
  const perPage = 20;
  const [totalPages, setTotalPages] = useState(1);

  const [items, setItems] = useState<ArticleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  const [statusInput, setStatusInput] = useState<"all" | "draft" | "pending" | "published" | "rejected" | "scheduled">("all");
  const [statusDebounced, setStatusDebounced] = useState<"all" | "draft" | "pending" | "published" | "rejected" | "scheduled">("all");

  const [categoryInput, setCategoryInput] = useState<string>("all");
  const [categoryDebounced, setCategoryDebounced] = useState<string>("all");

  const [isDebouncing, setIsDebouncing] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  const [featuredFixedOnce, setFeaturedFixedOnce] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let res: { items: CategoryRecord[] };
        try {
          res = await pb.collection("categories").getList<CategoryRecord>(1, 200, { sort: "name_vi" });
        } catch {
          res = await pb.collection("categories").getList<CategoryRecord>(1, 200, { sort: "name" });
        }
        const items = allowedCategoryIds ? res.items.filter((c) => allowedCategoryIds.has(c.id)) : res.items;
        setCategories(items);
      } catch {
        // ignore; category display will fallback to id
      }
    };
    fetchCategories();
  }, [allowedCategoryIds]);

  useEffect(() => {
    const next = searchInput.trim();
    setIsDebouncing(
      next !== searchDebounced || statusInput !== statusDebounced || categoryInput !== categoryDebounced
    );

    const t = window.setTimeout(() => {
      setSearchDebounced(next);
      setStatusDebounced(statusInput);
      setCategoryDebounced(categoryInput);
      setIsDebouncing(false);
      setPage(1);
    }, 1000);

    return () => window.clearTimeout(t);
  }, [searchInput, searchDebounced, statusInput, statusDebounced, categoryInput, categoryDebounced]);

  useEffect(() => {
    if (!isAdmin) return;
    const checkScheduled = async () => {
      const publishedIds = await publishScheduledArticles();
      if (publishedIds.length > 0) {
        toast({
          title: "Tự động xuất bản",
          description: `${publishedIds.length} bài viết đã được tự động xuất bản theo lịch.`,
        });
        setRefetchKey((x) => x + 1);
      }
    };
    checkScheduled();
    const interval = setInterval(checkScheduled, 60000);
    return () => clearInterval(interval);
  }, [isAdmin, toast]);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const res = await listArticles({
          page,
          perPage,
          search: searchDebounced,
          status: statusDebounced,
          categoryId: categoryDebounced,
          authorId: isAuthor ? user?.id : undefined,
        });
        setItems(res.items);
        setTotalPages(res.totalPages || 1);

        if (isAdmin && !featuredFixedOnce) {
          const featuredItems = res.items.filter((x) => x.featured);
          if (featuredItems.length > 2) {
            await ensureFeaturedLimit({ keepIds: featuredItems.slice(0, 2).map((x) => x.id), limit: 2 });
            setFeaturedFixedOnce(true);
            setRefetchKey((x) => x + 1);
            return;
          }
          setFeaturedFixedOnce(true);
        }
      } catch {
        toast({
          title: "Không tải được bài viết",
          description: "Vui lòng kiểm tra collection `articles` và API rules.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [page, perPage, searchDebounced, statusDebounced, categoryDebounced, isAuthor, isAdmin, featuredFixedOnce, user?.id, toast, refetchKey]);

  const formatStatus = (s?: string, publishedAt?: string) => {
    if (s === "published") return <Badge className="rounded-none">Published</Badge>;
    if (s === "scheduled") {
      const scheduledTime = publishedAt ? new Date(publishedAt).toLocaleString("vi-VN") : "";
      return (
        <Badge className="rounded-none bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          Hẹn giờ
          {scheduledTime && (
            <span className="block text-[10px] font-normal">{scheduledTime}</span>
          )}
        </Badge>
      );
    }
    if (s === "pending") {
      return (
        <Badge variant="outline" className="rounded-none">
          Pending
        </Badge>
      );
    }
    if (s === "rejected") {
      return (
        <Badge variant="destructive" className="rounded-none">
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="rounded-none">
        Draft
      </Badge>
    );
  };

  const getCategoryLabel = (a: ArticleRecord) => {
    const exp = a.expand as { category?: unknown } | undefined;
    const expanded = exp?.category as CategoryRecord | undefined;
    const c = expanded || (a.category ? categoriesById.get(a.category) : undefined);
    return c?.name_vi || c?.name || c?.slug || a.category || "-";
  };

  const getAuthorLabel = (a: ArticleRecord) => {
    const exp = a.expand as { author?: unknown } | undefined;
    const au = exp?.author as { name?: string; email?: string } | undefined;
    return au?.name || au?.email || a.author || "-";
  };

  const onDelete = async (id: string) => {
    const ok = window.confirm("Xóa bài viết này?");
    if (!ok) return;
    try {
      await deleteArticle(id);
      toast({ title: "Đã xóa", description: "Bài viết đã được xóa." });
      setRefetchKey((x) => x + 1);
    } catch {
      toast({ title: "Xóa thất bại", description: "Vui lòng kiểm tra quyền.", variant: "destructive" });
    }
  };

  const onApprove = async (id: string) => {
    if (!user?.id) return;
    try {
      await approveArticle(id, user.id);
      toast({ title: "Đã duyệt", description: "Bài viết đã được xuất bản." });
      setRefetchKey((x) => x + 1);
    } catch {
      toast({ title: "Duyệt thất bại", description: "Vui lòng kiểm tra quyền.", variant: "destructive" });
    }
  };

  const onReject = async (id: string) => {
    if (!user?.id) return;
    const reason = window.prompt("Lý do từ chối (tuỳ chọn):", "") || "";
    try {
      await rejectArticle(id, user.id, reason);
      toast({ title: "Đã từ chối", description: "Bài viết đã bị từ chối." });
      setRefetchKey((x) => x + 1);
    } catch {
      toast({ title: "Từ chối thất bại", description: "Vui lòng kiểm tra quyền.", variant: "destructive" });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Quản lý bài viết
          </h1>
          <p className="text-muted-foreground mt-1">
            Danh sách tất cả bài viết trên hệ thống
          </p>
        </div>
        <Link href="/admin/editor">
          <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Viết bài mới
          </Button>
        </Link>
      </div>

      <div className="bg-background border border-foreground/20 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tiêu đề / sapo..."
              className="rounded-none border-foreground/20 pl-9"
              autoComplete="off"
            />
          </div>

          <Select
            value={statusInput}
            onValueChange={(v) => setStatusInput(v as "all" | "draft" | "pending" | "published" | "rejected" | "scheduled")}
          >
            <SelectTrigger className="rounded-none border-foreground/20 w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="scheduled">Đã đặt lịch</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryInput} onValueChange={setCategoryInput}>
            <SelectTrigger className="rounded-none border-foreground/20 w-full md:w-[260px]">
              <SelectValue placeholder="Chuyên mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuyên mục</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name_vi || c.name || c.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(isDebouncing || isLoading) && (
            <span className="text-sm text-muted-foreground">Đang tải...</span>
          )}
        </div>
      </div>

      <div className="bg-background border border-foreground/20">
        <Table>
          <TableHeader>
            <TableRow className="border-foreground/20">
              <TableHead className="font-serif font-bold text-foreground w-20">Ảnh</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Tiêu đề</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Chuyên mục</TableHead>
              <TableHead className="font-serif font-bold text-foreground w-28">Trạng thái</TableHead>
              <TableHead className="font-serif font-bold text-foreground w-20">Views</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Tác giả</TableHead>
              <TableHead className="font-serif font-bold text-foreground w-44">Xuất bản</TableHead>
              <TableHead className="font-serif font-bold text-foreground w-44">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => {
              const title = a.title_vi || a.title_jp || "(Chưa có tiêu đề)";
              const published = a.publishedAt ? new Date(a.publishedAt).toLocaleString() : "-";
              const thumbUrl = getPbFileUrl(a, a.thumbnail);
              const canModerate = !isAuthor && a.status === "pending";
              return (
                <TableRow key={a.id} className="border-foreground/10">
                  <TableCell>
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="" className="w-16 h-12 object-cover" />
                    ) : (
                      <div className="w-16 h-12 bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-serif font-bold text-foreground max-w-md">
                    <div className="flex items-start gap-2">
                      {a.featured && <Star className="w-4 h-4 text-foreground mt-1" />}
                      <div className="line-clamp-2">{title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">
                      #{a.id}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getCategoryLabel(a)}
                  </TableCell>
                  <TableCell>{formatStatus(a.status, a.publishedAt)}</TableCell>
                  <TableCell className="text-muted-foreground">{typeof a.views === "number" ? a.views : 0}</TableCell>
                  <TableCell className="text-muted-foreground">{getAuthorLabel(a)}</TableCell>
                  <TableCell className="text-muted-foreground">{published}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canModerate && (
                        <>
                          <Button
                            variant="outline"
                            className="h-8 rounded-none border-foreground/20"
                            onClick={() => onApprove(a.id)}
                          >
                            Duyệt
                          </Button>
                          <Button
                            variant="destructive"
                            className="h-8 rounded-none"
                            onClick={() => onReject(a.id)}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Link href={`/longform/${a.slug || a.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" title="Xem">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/editor?id=${a.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" title="Sửa">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-foreground/5"
                        title="Xóa"
                        disabled={isLoading}
                        onClick={() => onDelete(a.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  Không có bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <CategoryPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminArticles;
