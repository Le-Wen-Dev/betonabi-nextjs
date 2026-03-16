import { pb } from "@/lib/pb";

export type DashboardStats = {
  totalArticles: number;
  pendingArticles: number;
  publishedArticles: number;
  totalUsers: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [articlesRes, pendingRes, publishedRes, usersRes] = await Promise.all([
    pb.collection("articles").getList(1, 1),
    pb.collection("articles").getList(1, 1, { filter: 'status = "pending"' }),
    pb.collection("articles").getList(1, 1, { filter: 'status = "published"' }),
    pb.collection("users").getList(1, 1),
  ]);

  return {
    totalArticles: articlesRes.totalItems ?? 0,
    pendingArticles: pendingRes.totalItems ?? 0,
    publishedArticles: publishedRes.totalItems ?? 0,
    totalUsers: usersRes.totalItems ?? 0,
  };
}
