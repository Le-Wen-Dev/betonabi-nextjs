'use client';

import Link from "next/link";
import { Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { categoryData } from "@/data/mockData";

// Flatten all articles from categories
const allArticles = Object.entries(categoryData).flatMap(([category, articles]) =>
  articles.map((article, index) => ({
    id: `${category}-${index}`,
    thumbnail: article.image,
    title: article.title,
    category: category,
    views: Math.floor(Math.random() * 50000) + 1000,
    status: Math.random() > 0.3 ? "published" : "draft",
  }))
);

const ArticlesTable = () => {
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const categoryDisplayNames: Record<string, string> = {
    "kinh-doanh": "Kinh doanh",
    "xa-hoi": "Xã hội",
    "doi-song": "Đời sống",
    "du-lich-van-hoa": "Du lịch - Văn hóa",
    "giao-duc": "Giáo dục",
    "suc-khoe": "Sức khỏe",
  };

  return (
    <div className="bg-background border border-foreground/20">
      <Table>
        <TableHeader>
          <TableRow className="border-foreground/20">
            <TableHead className="font-serif font-bold text-foreground w-16">ID</TableHead>
            <TableHead className="font-serif font-bold text-foreground w-20">Ảnh</TableHead>
            <TableHead className="font-serif font-bold text-foreground">Tiêu đề</TableHead>
            <TableHead className="font-serif font-bold text-foreground">Chuyên mục</TableHead>
            <TableHead className="font-serif font-bold text-foreground">Views</TableHead>
            <TableHead className="font-serif font-bold text-foreground w-24">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allArticles.slice(0, 10).map((article, index) => (
            <TableRow key={article.id} className="border-foreground/10">
              <TableCell className="text-muted-foreground font-mono text-sm">
                #{index + 1}
              </TableCell>
              <TableCell>
                {article.thumbnail && (
                  <img
                    src={article.thumbnail}
                    alt=""
                    className="w-16 h-12 object-cover"
                  />
                )}
              </TableCell>
              <TableCell className="font-serif font-bold text-foreground max-w-md">
                <span className="line-clamp-2">{article.title}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {categoryDisplayNames[article.category] || article.category}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatViews(article.views)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/longform/${article.id}`} target="_blank">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-foreground/5"
                      title="Xem bài viết"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/editor?id=${article.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-foreground/5"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-foreground/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ArticlesTable;
