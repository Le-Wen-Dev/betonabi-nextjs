'use client';

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import CategoryPagination from "@/components/CategoryPagination";
import { pb } from "@/lib/pb";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
    id: string;
    name_vi?: string;
    name_jp?: string;
    slug: string;
    description_vi?: string;
    description_jp?: string;
    name?: string;
    description?: string;
    created?: string;
    updated?: string;
}

const CATEGORIES_COLLECTION = "categories";
const PER_PAGE = 20;

function escapePbFilterValue(value: string) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const AdminCategories = () => {
    const { toast } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [listLangTab, setListLangTab] = useState<"vi" | "jp">("vi");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name_vi: "",
        name_jp: "",
        slug: "",
        description_vi: "",
        description_jp: "",
    });
    const [activeLangTab, setActiveLangTab] = useState<"vi" | "jp">("vi");

    const filter = useMemo(() => {
        const q = search.trim();
        if (!q) return "";
        const esc = escapePbFilterValue(q);
        return `name_vi ~ "${esc}" || name_jp ~ "${esc}" || name ~ "${esc}" || slug ~ "${esc}" || description_vi ~ "${esc}" || description_jp ~ "${esc}" || description ~ "${esc}"`;
    }, [search]);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await pb.collection(CATEGORIES_COLLECTION).getList<Category>(page, PER_PAGE, {
                sort: "-created",
                filter,
            });
            setCategories(res.items);
            setTotalPages(Math.max(1, res.totalPages));
        } catch (err: any) {
            toast({
                title: "Không tải được danh mục",
                description: typeof err?.message === "string" ? err.message : "Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filter]);

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name_vi: category.name_vi || category.name || "",
                name_jp: category.name_jp || "",
                slug: category.slug,
                description_vi: category.description_vi || category.description || "",
                description_jp: category.description_jp || "",
            });
        } else {
            setEditingCategory(null);
            setFormData({ name_vi: "", name_jp: "", slug: "", description_vi: "", description_jp: "" });
        }
        setActiveLangTab("vi");
        setIsDialogOpen(true);
    };

    const getUniqueSlug = async (baseSlug: string, excludeId?: string) => {
        const base = baseSlug.trim();
        if (!base) return "";

        for (let i = 0; i < 50; i++) {
            const candidate = i === 0 ? base : `${base}-${i + 1}`;
            const slugEsc = escapePbFilterValue(candidate);
            const exclude = excludeId ? ` && id != "${escapePbFilterValue(excludeId)}"` : "";
            try {
                const res = await pb.collection(CATEGORIES_COLLECTION).getList<Category>(1, 1, {
                    filter: `slug = "${slugEsc}"${exclude}`,
                });
                if (!res.items || res.items.length === 0) return candidate;
            } catch (err: any) {
                throw err;
            }
        }
        throw new Error("Slug đã tồn tại. Vui lòng thử slug khác.");
    };

    const handleSubmit = async () => {
        if (!formData.name_vi || !formData.slug) {
            toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ Tên (VI) và đường dẫn (slug)", variant: "destructive" });
            return;
        }

        try {
            setIsLoading(true);
            const normalized = {
                name_vi: formData.name_vi.trim(),
                name_jp: formData.name_jp.trim(),
                slug: formData.slug.trim(),
                description_vi: formData.description_vi.trim(),
                description_jp: formData.description_jp.trim(),
            };

            const uniqueSlug = await getUniqueSlug(normalized.slug, editingCategory?.id);

            if (editingCategory) {
                await pb.collection(CATEGORIES_COLLECTION).update(editingCategory.id, { ...normalized, slug: uniqueSlug });
                toast({ title: "Thành công", description: "Đã cập nhật danh mục" });
            } else {
                await pb.collection(CATEGORIES_COLLECTION).create({ ...normalized, slug: uniqueSlug });
                toast({ title: "Thành công", description: "Đã thêm danh mục mới" });
            }

            setIsDialogOpen(false);
            fetchCategories();
        } catch (err: any) {
            toast({ title: "Thao tác thất bại", description: typeof err?.message === "string" ? err.message : "Vui lòng thử lại.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                setIsLoading(true);
                await pb.collection(CATEGORIES_COLLECTION).delete(id);
                toast({ title: "Thành công", description: "Đã xóa danh mục" });
                fetchCategories();
            } catch (err: any) {
                toast({ title: "Xóa thất bại", description: typeof err?.message === "string" ? err.message : "Vui lòng thử lại.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({ ...prev, name_vi: name, slug: !editingCategory ? generateSlug(name) : prev.slug }));
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">Quản lý danh mục</h1>
                    <p className="text-muted-foreground mt-1">Quản lý các chuyên mục tin tức trên hệ thống</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium">
                    <Plus className="w-4 h-4 mr-2" />Thêm danh mục
                </Button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Tìm theo tên/slug/mô tả..." className="pl-9 rounded-none border-foreground/20" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Button variant="outline" className="rounded-none border-foreground/20" onClick={fetchCategories} disabled={isLoading}>
                    {isLoading ? "Đang tải..." : "Tải lại"}
                </Button>
            </div>

            <div className="bg-background border border-foreground/20">
                <div className="px-4 pt-4">
                    <Tabs value={listLangTab} onValueChange={(v) => setListLangTab(v as "vi" | "jp")}>
                        <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b border-foreground/20">
                            <TabsTrigger value="vi" className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">VI</TabsTrigger>
                            <TabsTrigger value="jp" className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">JP</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-foreground/20">
                            <TableHead className="font-serif font-bold text-foreground w-16">ID</TableHead>
                            <TableHead className="font-serif font-bold text-foreground">Tên danh mục</TableHead>
                            <TableHead className="font-serif font-bold text-foreground">Đường dẫn (Slug)</TableHead>
                            <TableHead className="font-serif font-bold text-foreground">Mô tả</TableHead>
                            <TableHead className="font-serif font-bold text-foreground">Cập nhật</TableHead>
                            <TableHead className="font-serif font-bold text-foreground w-24 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category, index) => (
                            <TableRow key={category.id} className="border-foreground/10">
                                <TableCell className="text-muted-foreground font-mono text-sm">#{(page - 1) * PER_PAGE + index + 1}</TableCell>
                                <TableCell className="font-medium text-foreground">
                                    {listLangTab === "vi" ? (category.name_vi || category.name || "-") : (category.name_jp || "-")}
                                </TableCell>
                                <TableCell className="text-muted-foreground font-mono text-sm">{category.slug}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    <div className="line-clamp-2">
                                        {listLangTab === "vi" ? (category.description_vi || category.description || "-") : (category.description_jp || "-")}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{category.updated ? new Date(category.updated).toLocaleString() : "-"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" onClick={() => handleOpenDialog(category)}><Pencil className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" onClick={() => handleDelete(category.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">Không có danh mục nào.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <CategoryPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-none border border-foreground/20">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
                        <DialogDescription>Nhập thông tin chi tiết cho danh mục tin tức.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <Tabs value={activeLangTab} onValueChange={(v) => setActiveLangTab(v as "vi" | "jp")}>
                            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b border-foreground/20">
                                <TabsTrigger value="vi" className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">VI</TabsTrigger>
                                <TabsTrigger value="jp" className="rounded-none border-b-2 border-transparent px-6 py-3 font-serif data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">JP</TabsTrigger>
                            </TabsList>

                            <TabsContent value="vi" className="mt-4 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name_vi">Tên danh mục (VI)</Label>
                                    <Input id="name_vi" value={formData.name_vi} onChange={handleNameChange} placeholder="Ví dụ: Kinh doanh" className="rounded-none border-foreground/20" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description_vi">Mô tả (VI)</Label>
                                    <Textarea id="description_vi" value={formData.description_vi} onChange={(e) => setFormData({ ...formData, description_vi: e.target.value })} placeholder="Mô tả ngắn về danh mục..." className="rounded-none border-foreground/20 resize-none" />
                                </div>
                            </TabsContent>

                            <TabsContent value="jp" className="mt-4 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name_jp">Tên danh mục (JP)</Label>
                                    <Input id="name_jp" value={formData.name_jp} onChange={(e) => setFormData({ ...formData, name_jp: e.target.value })} placeholder="例: ビジネス" className="rounded-none border-foreground/20" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description_jp">Mô tả (JP)</Label>
                                    <Textarea id="description_jp" value={formData.description_jp} onChange={(e) => setFormData({ ...formData, description_jp: e.target.value })} placeholder="カテゴリー説明..." className="rounded-none border-foreground/20 resize-none" />
                                </div>
                            </TabsContent>
                        </Tabs>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">Đường dẫn (Slug)</Label>
                            <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="vi-du-kinh-doanh" className="rounded-none border-foreground/20 font-mono text-sm" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-none">Hủy</Button>
                        <Button onClick={handleSubmit} className="bg-foreground text-background hover:bg-foreground/90 rounded-none" disabled={isLoading}>
                            {editingCategory ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCategories;
