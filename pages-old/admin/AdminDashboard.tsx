import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import RecentActivityTable from "@/components/admin/RecentActivityTable";
import { getDashboardStats } from "@/lib/dashboard";
import type { DashboardStats } from "@/lib/dashboard";
import { ArticleRecord } from "@/lib/articles";
import { pb } from "@/lib/pb";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Users, Clock, CheckCircle } from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<ArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [statsRes, recentRes] = await Promise.all([
          getDashboardStats(),
          pb
            .collection("articles")
            .getList<ArticleRecord>(1, 10, {
              sort: "-updated",
              expand: "author",
            }),
        ]);
        setStats(statsRes);
        setRecentArticles(recentRes.items ?? []);
      } catch {
        toast({
          title: "Không tải được dashboard",
          description: "Vui lòng kiểm tra kết nối và quyền API.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [toast]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getAuthorName = (a: ArticleRecord) => {
    const exp = a.expand as { author?: { name?: string; email?: string } } | undefined;
    const au = exp?.author;
    return au?.name || au?.email || a.author || "—";
  };

  const statCards = stats
    ? [
      {
        label: "Tổng bài viết",
        value: String(stats.totalArticles),
        description: "Tất cả trạng thái",
        icon: FileText,
      },
      {
        label: "Bài chờ duyệt",
        value: String(stats.pendingArticles),
        description: "Cần xử lý",
        icon: Clock,
      },
      {
        label: "Đã xuất bản",
        value: String(stats.publishedArticles),
        description: "Bài đã public",
        icon: CheckCircle,
      },
      {
        label: "Tổng tài khoản",
        value: String(stats.totalUsers),
        description: "User / Author / Admin",
        icon: Users,
      },
    ]
    : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tổng quan hoạt động trang tin</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground py-12">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((s, i) => (
              <StatCard
                key={i}
                label={s.label}
                value={s.value}
                description={s.description}
                icon={s.icon}
              />
            ))}
          </div>

          <RecentActivityTable
            items={recentArticles.map((a) => ({
              id: a.id,
              title: a.title_vi || a.title_jp || "(Chưa có tiêu đề)",
              authorName: getAuthorName(a),
              status: a.status ?? "draft",
              date: formatDate(a.updated),
            }))}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
