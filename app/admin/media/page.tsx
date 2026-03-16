'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Upload, Copy, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listMedia, uploadMedia, deleteMedia, type MediaRecord } from "@/lib/media";
import { getPbFileUrl } from "@/lib/pbFiles";
import { pb } from "@/lib/pb";
import { useToast } from "@/components/ui/use-toast";

const PER_PAGE = 24;

const isImageFile = (filename?: string) => {
  if (!filename) return false;
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext ?? "");
};

const getFullFileUrl = (record: MediaRecord): string => {
  const url = getPbFileUrl(record, record.file);
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const base = (pb as unknown as { baseUrl?: string }).baseUrl ?? "";
  return base ? `${base.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}` : url;
};

const AdminMedia = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMedia({ page, perPage: PER_PAGE, search: searchDebounced || undefined });
      setItems(res.items ?? []);
      setTotalPages(Math.max(1, res.totalPages ?? 1));
    } catch {
      toast({ title: "Không tải được media", description: "Kiểm tra collection `media` và API rules.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounced, toast]);

  useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [searchDebounced]);
  useEffect(() => { fetchList(); }, [fetchList]);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploading(true);
      let ok = 0;
      let err = 0;
      try {
        for (let i = 0; i < files.length; i++) {
          try {
            await uploadMedia(files[i]);
            ok++;
          } catch {
            err++;
          }
        }
        if (ok) {
          toast({ title: "Đã tải lên", description: `${ok} tệp đã được thêm.` });
          fetchList();
        }
        if (err) {
          toast({ title: "Một số tệp lỗi", description: `${err} tệp không tải được.`, variant: "destructive" });
        }
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [toast, fetchList]
  );

  const handleCopyUrl = useCallback(
    (record: MediaRecord) => {
      const url = getFullFileUrl(record);
      if (!url) {
        toast({ title: "Không có URL", variant: "destructive" });
        return;
      }
      navigator.clipboard.writeText(url).then(
        () => toast({ title: "Đã copy URL" }),
        () => toast({ title: "Copy thất bại", variant: "destructive" })
      );
    },
    [toast]
  );

  const handleDelete = useCallback(
    async (record: MediaRecord) => {
      if (!window.confirm(`Xóa file "${record.file || record.name || record.id}"?`)) return;
      try {
        await deleteMedia(record.id);
        toast({ title: "Đã xóa", description: "File đã được xóa." });
        fetchList();
      } catch {
        toast({ title: "Không xóa được", description: "Kiểm tra quyền API.", variant: "destructive" });
      }
    },
    [toast, fetchList]
  );

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }, [handleUpload]);
  const onDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Quản lý Media</h1>
          <p className="text-muted-foreground mt-1">Thư viện file đã tải lên trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Tìm theo tên file..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="max-w-[200px] rounded-none" />
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          <Button className="rounded-none font-medium bg-foreground text-background hover:bg-foreground/90" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Đang tải..." : "Tải lên"}
          </Button>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-foreground/20 bg-background p-12 text-center mb-8 cursor-pointer hover:border-foreground/40 transition-colors"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">Kéo thả tệp vào đây</p>
        <p className="text-sm text-muted-foreground">hoặc click để chọn tệp (ảnh, PDF, doc…)</p>
      </div>

      <div className="bg-background border border-foreground/20 p-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-4">File đã tải lên</h2>

        {loading ? (
          <div className="text-muted-foreground py-12 text-center">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">Chưa có file nào. Hãy tải lên từ vùng kéo thả phía trên.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {items.map((record) => {
                const url = getPbFileUrl(record, record.file);
                const isImage = isImageFile(record.file);
                const label = record.name || record.file || record.id;

                return (
                  <div key={record.id} className="group border border-foreground/10 overflow-hidden bg-muted/30">
                    <div className="aspect-square flex items-center justify-center bg-muted/50 relative">
                      {isImage && url ? (
                        <img src={url} alt={label} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="rounded-none h-8 w-8" onClick={(e) => { e.stopPropagation(); handleCopyUrl(record); }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="rounded-none h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(record); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 border-t border-foreground/10">
                      <p className="text-xs text-foreground truncate" title={label}>{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" className="rounded-none" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</Button>
                <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" className="rounded-none" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Sau</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMedia;
