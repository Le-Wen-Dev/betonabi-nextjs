'use client';

import { useEffect, useState } from "react";
import { Loader2, Trash2, Search, Eye, MessageSquare } from "lucide-react";
import { pb } from "@/lib/pb";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import CategoryPagination from "@/components/CategoryPagination";
import { listAllComments, deleteComment, deleteComments, type CommentRecord } from "@/lib/comments";

function getErrorMessage(err: unknown): string | undefined {
  if (!err) return undefined;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

const PER_PAGE = 20;

const AdminComments = () => {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<CommentRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<CommentRecord | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [detailComment, setDetailComment] = useState<CommentRecord | null>(null);

  useEffect(() => {
    const next = searchInput.trim();
    setIsDebouncing(next !== searchDebounced);
    const t = window.setTimeout(() => {
      setSearchDebounced(next);
      setIsDebouncing(false);
      setPage(1);
    }, 800);
    return () => window.clearTimeout(t);
  }, [searchInput, searchDebounced]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await listAllComments({ page, perPage: PER_PAGE, search: searchDebounced || undefined });
      setItems(res.items || []);
      setTotalPages(Math.max(1, res.totalPages));
      setTotalItems(res.totalItems ?? 0);
    } catch (err: unknown) {
      toast({ title: "Không tải được bình luận", description: getErrorMessage(err) || "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchComments(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, searchDebounced]);
  useEffect(() => { setSelectedIds(new Set()); }, [page, searchDebounced]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((c) => c.id)));
  };
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  const onDeleteSingle = async () => {
    if (!deleteTarget) return;
    try {
      await deleteComment(deleteTarget.id);
      toast({ title: "Đã xóa", description: "Bình luận đã được xóa." });
      setDeleteTarget(null);
      fetchComments();
    } catch (err: unknown) {
      toast({ title: "Xóa thất bại", description: getErrorMessage(err) || "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const onBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      const result = await deleteComments(ids);
      toast({ title: "Đã xóa", description: `Đã xóa ${result.deleted}/${result.total} bình luận.${result.failed > 0 ? ` ${result.failed} thất bại.` : ""}` });
      setSelectedIds(new Set());
      setIsBulkDeleteOpen(false);
      fetchComments();
    } catch (err: unknown) {
      toast({ title: "Xóa thất bại", description: getErrorMessage(err) || "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const getArticleTitle = (c: CommentRecord) => {
    const art = c.expand?.article;
    if (!art) return "(Bài viết)";
    return art.title_vi || art.title_jp || art.title || art.slug || "(Bài viết)";
  };

  const getUserName = (c: CommentRecord) => {
    const u = c.expand?.user;
    if (!u) return "(Người dùng)";
    return u.name || u.email || "(Người dùng)";
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Quản lý bình luận</h1>
          <p className="text-muted-foreground mt-1">Tổng cộng {totalItems} bình luận</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {(isDebouncing || isLoading) && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
          <Input autoComplete="off" placeholder="Tìm theo nội dung bình luận..." className="pl-9 pr-9 rounded-none border-foreground/20" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <Button variant="outline" className="rounded-none border-foreground/20" onClick={fetchComments} disabled={isLoading}>
          {isLoading ? "Đang tải..." : "Tải lại"}
        </Button>
        {selectedIds.size > 0 && (
          <Button variant="destructive" className="rounded-none" onClick={() => setIsBulkDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />Xóa {selectedIds.size} bình luận
          </Button>
        )}
      </div>

      <div className="bg-background border border-foreground/20">
        <Table>
          <TableHeader>
            <TableRow className="border-foreground/20">
              <TableHead className="w-10">
                <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="rounded border-foreground/30" />
              </TableHead>
              <TableHead className="font-serif font-bold text-foreground">Người dùng</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Nội dung</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Bài viết</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Ngày tạo</TableHead>
              <TableHead className="font-serif font-bold text-foreground text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id} className="border-foreground/10">
                <TableCell><input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-foreground/30" /></TableCell>
                <TableCell className="font-medium text-foreground whitespace-nowrap">{getUserName(c)}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs"><span title={c.content}>{truncate(c.content || "", 80)}</span></TableCell>
                <TableCell className="text-muted-foreground max-w-[200px]"><span title={getArticleTitle(c)}>{truncate(getArticleTitle(c), 40)}</span></TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{c.created ? new Date(c.created).toLocaleString() : "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" title="Xem chi tiết" onClick={() => setDetailComment(c)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" title="Xóa bình luận" onClick={() => setDeleteTarget(c)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Không có bình luận nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-none border border-foreground/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Xóa bình luận?</AlertDialogTitle>
            <AlertDialogDescription>
              Bình luận của <strong>{deleteTarget ? getUserName(deleteTarget) : ""}</strong>:{" "}
              <em>"{truncate(deleteTarget?.content || "", 100)}"</em><br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700 rounded-none" onClick={onDeleteSingle}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="rounded-none border border-foreground/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Xóa {selectedIds.size} bình luận?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang xóa <strong>{selectedIds.size}</strong> bình luận đã chọn.<br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700 rounded-none" onClick={onBulkDelete}>Xóa tất cả</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!detailComment} onOpenChange={(open) => { if (!open) setDetailComment(null); }}>
        <DialogContent className="sm:max-w-[600px] rounded-none border border-foreground/20">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Chi tiết bình luận</DialogTitle>
          </DialogHeader>
          {detailComment && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Người dùng</p>
                <p className="font-medium">{getUserName(detailComment)}</p>
                {detailComment.expand?.user?.email && <p className="text-sm text-muted-foreground">{detailComment.expand.user.email}</p>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Bài viết</p>
                <p className="font-medium">{getArticleTitle(detailComment)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ngày tạo</p>
                <p>{detailComment.created ? new Date(detailComment.created).toLocaleString() : "-"}</p>
              </div>
              {detailComment.parent && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Trả lời cho</p>
                  <p className="text-sm font-mono text-muted-foreground">{detailComment.parent}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nội dung</p>
                <div className="bg-muted/50 border border-foreground/10 p-4 rounded text-sm whitespace-pre-wrap">
                  {DOMPurify.sanitize(detailComment.content || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="destructive" className="rounded-none" onClick={() => { setDetailComment(null); setDeleteTarget(detailComment); }}>
                  <Trash2 className="w-4 h-4 mr-2" />Xóa bình luận này
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminComments;
