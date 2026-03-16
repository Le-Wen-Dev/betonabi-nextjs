'use client';

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ActivityItem = {
  id: string;
  title: string;
  authorName: string;
  status: "published" | "draft" | "pending" | "rejected" | "scheduled";
  date: string;
};

interface RecentActivityTableProps {
  items: ActivityItem[];
}

const statusLabels: Record<string, string> = {
  published: "Đã xuất bản",
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  rejected: "Từ chối",
  scheduled: "Đã đặt lịch",
};

const RecentActivityTable = ({ items }: RecentActivityTableProps) => {
  return (
    <div className="bg-background border border-foreground/20">
      <div className="p-4 border-b border-foreground/20 flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-foreground">
          Hoạt động gần đây
        </h2>
        <Link
          href="/admin/articles"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Xem tất cả
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-foreground/20">
            <TableHead className="font-serif font-bold text-foreground">Tiêu đề</TableHead>
            <TableHead className="font-serif font-bold text-foreground">Tác giả</TableHead>
            <TableHead className="font-serif font-bold text-foreground">Trạng thái</TableHead>
            <TableHead className="font-serif font-bold text-foreground">Cập nhật</TableHead>
            <TableHead className="w-[80px] font-serif font-bold text-foreground">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow className="border-foreground/10">
              <TableCell colSpan={5} className="text-muted-foreground text-center py-8">
                Chưa có bài viết nào.
              </TableCell>
            </TableRow>
          ) : (
            items.map((activity) => (
              <TableRow key={activity.id} className="border-foreground/10">
                <TableCell className="font-medium max-w-xs truncate">
                  {activity.title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.authorName}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 text-xs border ${activity.status === "published"
                        ? "border-foreground text-foreground"
                        : activity.status === "pending"
                          ? "border-amber-600 text-amber-700"
                          : activity.status === "rejected"
                            ? "border-destructive text-destructive"
                            : "border-dashed border-muted-foreground text-muted-foreground"
                      }`}
                  >
                    {statusLabels[activity.status] ?? activity.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.date}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/editor?id=${activity.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Sửa
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentActivityTable;
