import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listMedia, type MediaRecord } from "@/lib/media";
import { getPbFileUrl } from "@/lib/pbFiles";
import { pb } from "@/lib/pb";

const PER_PAGE = 12;

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

interface MediaGalleryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const MediaGallery = ({ onSelect, onClose }: MediaGalleryProps) => {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMedia({ page, perPage: PER_PAGE, search: searchQuery });
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch {
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSelect = (record: MediaRecord) => {
    const url = getFullFileUrl(record);
    if (url) {
      onSelect(url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-foreground/20 w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/20">
          <h2 className="font-serif text-xl font-bold">Chọn ảnh từ Media</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-foreground/20">
          <Input
            placeholder="Tìm theo tên file..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="rounded-none"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-muted-foreground py-12 text-center">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              Không tìm thấy ảnh nào.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.filter((record) => isImageFile(record.file)).map((record) => {
                const url = getPbFileUrl(record, record.file);
                const label = record.name || record.file || record.id;

                return (
                  <div
                    key={record.id}
                    className="group border border-foreground/10 overflow-hidden bg-muted/30 cursor-pointer hover:border-foreground/40 transition-colors"
                    onClick={() => handleSelect(record)}
                  >
                    <div className="aspect-square flex items-center justify-center bg-muted/50">
                      {url ? (
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2 border-t border-foreground/10">
                      <p className="text-xs text-foreground truncate" title={label}>
                        {label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-foreground/20">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

