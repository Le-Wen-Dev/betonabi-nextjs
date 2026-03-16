'use client';

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import { pb } from "@/lib/pb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryPagination from "@/components/CategoryPagination";

type Role = "admin" | "author" | "user";

type UserRecord = {
  id: string;
  email?: string;
  name?: string;
  role?: Role;
  allowedCategories?: string[];
  verified?: boolean;
  created: string;
  updated: string;
};

type CategoryRecord = {
  id: string;
  slug: string;
  name_vi?: string;
  name?: string;
};

function escapePbFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getErrorMessage(err: unknown): string | undefined {
  if (!err) return undefined;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

function roleBadge(role: Role | undefined) {
  const r: Role = role || "user";
  const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  if (r === "admin") return `${base} bg-purple-100 text-purple-700`;
  if (r === "author") return `${base} bg-blue-100 text-blue-700`;
  return `${base} bg-green-100 text-green-700`;
}

const PER_PAGE = 20;
const CATEGORIES_COLLECTION = "categories";

const AdminUsers = () => {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<UserRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [roleFilterInput, setRoleFilterInput] = useState<Role | "all">("all");
  const [roleFilterDebounced, setRoleFilterDebounced] = useState<Role | "all">("all");
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<Role>("user");
  const [formAllowedCategories, setFormAllowedCategories] = useState<string[]>([]);
  const [formPassword, setFormPassword] = useState("");
  const [formPasswordConfirm, setFormPasswordConfirm] = useState("");
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const [categories, setCategories] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    const next = searchInput.trim();
    setIsDebouncing(next !== searchDebounced || roleFilterInput !== roleFilterDebounced);
    const t = window.setTimeout(() => {
      setSearchDebounced(next);
      setRoleFilterDebounced(roleFilterInput);
      setIsDebouncing(false);
      setPage(1);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [searchInput, searchDebounced, roleFilterInput, roleFilterDebounced]);

  const filter = useMemo(() => {
    const q = searchDebounced.trim();
    const esc = escapePbFilterValue(q);
    const rolePart = roleFilterDebounced === "all" ? "" : `role = "${roleFilterDebounced}"`;
    const searchPart = q ? `(email ~ "${esc}" || name ~ "${esc}")` : "";
    if (rolePart && searchPart) return `${rolePart} && ${searchPart}`;
    return rolePart || searchPart || "";
  }, [searchDebounced, roleFilterDebounced]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await pb.collection("users").getList<UserRecord>(page, PER_PAGE, { sort: "-created", filter });
      setItems(res.items);
      setTotalPages(Math.max(1, res.totalPages));
    } catch (err: unknown) {
      toast({ title: "Không tải được danh sách user", description: getErrorMessage(err) || "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let res: { items: CategoryRecord[] };
        try {
          res = await pb.collection(CATEGORIES_COLLECTION).getList<CategoryRecord>(1, 200, { sort: "name_vi" });
        } catch {
          res = await pb.collection(CATEGORIES_COLLECTION).getList<CategoryRecord>(1, 200, { sort: "name" });
        }
        setCategories(res.items || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const openCreate = () => {
    setDialogMode("create");
    setEditingUser(null);
    setFormEmail(""); setFormName(""); setFormRole("user"); setFormAllowedCategories([]);
    setFormPassword(""); setFormPasswordConfirm("");
    setIsDialogOpen(true);
  };

  const openEdit = (u: UserRecord) => {
    setDialogMode("edit");
    setEditingUser(u);
    setFormEmail(u.email || ""); setFormName(u.name || ""); setFormRole((u.role || "user") as Role);
    setFormAllowedCategories(Array.isArray(u.allowedCategories) ? u.allowedCategories : []);
    setFormPassword(""); setFormPasswordConfirm("");
    setCategoryPickerOpen(false);
    setIsDialogOpen(true);
  };

  const allCategoryIds = useMemo(() => categories.map((c) => c.id), [categories]);
  const selectedCategoryIds = useMemo(() => {
    const set = new Set(allCategoryIds);
    return formAllowedCategories.filter((id) => set.has(id));
  }, [formAllowedCategories, allCategoryIds]);
  const isAllSelected = useMemo(() => allCategoryIds.length > 0 && selectedCategoryIds.length === allCategoryIds.length, [selectedCategoryIds.length, allCategoryIds.length]);

  const toggleAllowedCategory = (categoryId: string) => {
    setFormAllowedCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
  };

  const submit = async () => {
    try {
      if (dialogMode === "create") {
        if (!formEmail.trim() || !formPassword || !formPasswordConfirm) {
          toast({ title: "Thiếu thông tin", description: "Vui lòng nhập email và mật khẩu.", variant: "destructive" });
          return;
        }
        if (formPassword !== formPasswordConfirm) {
          toast({ title: "Mật khẩu không khớp", description: "Vui lòng kiểm tra lại xác nhận mật khẩu.", variant: "destructive" });
          return;
        }

        const payload: Record<string, unknown> = {
          email: formEmail.trim(), password: formPassword, passwordConfirm: formPasswordConfirm,
          name: formName.trim(), role: formRole, emailVisibility: true,
        };
        if (formRole === "author") payload.allowedCategories = selectedCategoryIds;

        const created = await pb.collection("users").create(payload);
        try {
          const createdId = (created as { id?: string }).id;
          if (createdId) await pb.collection("users").update(createdId, { emailVisibility: true });
        } catch {
          toast({ title: "Chưa bật được emailVisibility", description: "Để admin thấy email của user/author, hãy bật emailVisibility=true cho các record." });
        }

        toast({ title: "Thành công", description: "Đã tạo tài khoản." });
        setIsDialogOpen(false);
        fetchUsers();
        return;
      }

      if (!editingUser) return;

      const payload: Record<string, unknown> = {};
      const nextName = formName.trim();
      if (nextName !== (editingUser.name || "")) payload.name = nextName;
      if (formRole !== (editingUser.role || "user")) payload.role = formRole;
      if (formRole === "author") {
        payload.allowedCategories = selectedCategoryIds;
      } else if (editingUser.role === "author") {
        payload.allowedCategories = [];
      }

      if (formPassword || formPasswordConfirm) {
        if (!formPassword || !formPasswordConfirm) {
          toast({ title: "Thiếu mật khẩu", description: "Vui lòng nhập đủ mật khẩu và xác nhận mật khẩu.", variant: "destructive" });
          return;
        }
        if (formPassword !== formPasswordConfirm) {
          toast({ title: "Mật khẩu không khớp", description: "Vui lòng kiểm tra lại xác nhận mật khẩu.", variant: "destructive" });
          return;
        }
        payload.password = formPassword;
        payload.passwordConfirm = formPasswordConfirm;
      }

      if (Object.keys(payload).length === 0) {
        toast({ title: "Không có thay đổi", description: "Bạn chưa chỉnh sửa gì." });
        return;
      }

      await pb.collection("users").update(editingUser.id, payload);
      toast({ title: "Thành công", description: "Đã cập nhật user." });
      setIsDialogOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      toast({ title: "Thao tác thất bại", description: getErrorMessage(err) || "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const onDelete = async (u: UserRecord) => {
    if (!window.confirm(`Xóa user "${u.email}"?`)) return;
    try {
      await pb.collection("users").delete(u.id);
      toast({ title: "Đã xóa", description: "User đã được xóa." });
      fetchUsers();
    } catch (err: unknown) {
      toast({ title: "Xóa thất bại", description: getErrorMessage(err) || "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Quản lý tài khoản</h1>
        </div>
        <Button onClick={openCreate} className="bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium">
          <Plus className="w-4 h-4 mr-2" />Tạo tài khoản
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {(isDebouncing || isLoading) && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
          <Input autoComplete="off" placeholder="Tìm theo email hoặc tên..." className="pl-9 pr-9 rounded-none border-foreground/20" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <div className="w-44">
          <Select value={roleFilterInput} onValueChange={(v) => setRoleFilterInput(v as Role | "all")}>
            <SelectTrigger className="rounded-none border-foreground/20"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="user">user</SelectItem>
              <SelectItem value="author">author</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="rounded-none border-foreground/20" onClick={fetchUsers} disabled={isLoading}>
          {isLoading ? "Đang tải..." : "Tải lại"}
        </Button>
      </div>

      <div className="bg-background border border-foreground/20">
        <Table>
          <TableHeader>
            <TableRow className="border-foreground/20">
              <TableHead className="font-serif font-bold text-foreground">Tên</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Email</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Vai trò</TableHead>
              <TableHead className="font-serif font-bold text-foreground">Tạo lúc</TableHead>
              <TableHead className="font-serif font-bold text-foreground text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((u) => (
              <TableRow key={u.id} className="border-foreground/10">
                <TableCell className="font-medium text-foreground">{u.name || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{u.email || "(hidden)"}</TableCell>
                <TableCell><span className={roleBadge(u.role)}>{(u.role || "user").toUpperCase()}</span></TableCell>
                <TableCell className="text-muted-foreground">{new Date(u.created).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" onClick={() => onDelete(u)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">Không có user nào.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-none border border-foreground/20">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{dialogMode === "create" ? "Tạo tài khoản" : "Cập nhật user"}</DialogTitle>
          </DialogHeader>

          <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-4 py-2">
            <input tabIndex={-1} aria-hidden="true" className="hidden" name="username" autoComplete="username" />
            <input tabIndex={-1} aria-hidden="true" className="hidden" type="password" name="password" autoComplete="new-password" />

            <div className="grid gap-2">
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" autoComplete="off" name="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="rounded-none border-foreground/20" disabled={dialogMode === "edit"} placeholder="email@example.com" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="u-name">Tên</Label>
              <Input id="u-name" autoComplete="off" name="name" value={formName} onChange={(e) => setFormName(e.target.value)} className="rounded-none border-foreground/20" placeholder="Tên hiển thị" />
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={(v) => { const next = v as Role; setFormRole(next); if (next !== "author") { setFormAllowedCategories([]); setCategoryPickerOpen(false); } }}>
                <SelectTrigger className="rounded-none border-foreground/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="author">author</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formRole === "author" && (
              <div className="grid gap-2">
                <Label>Danh mục được phép viết</Label>
                <Popover open={categoryPickerOpen} onOpenChange={setCategoryPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" role="combobox" aria-expanded={categoryPickerOpen} className="w-full justify-between rounded-none border-foreground/20" disabled={categories.length === 0}>
                      {categories.length === 0 ? "Chưa có danh mục" : isAllSelected ? "All categories" : selectedCategoryIds.length === 0 ? "Chọn danh mục..." : `Đã chọn ${selectedCategoryIds.length} danh mục`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Tìm danh mục..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy danh mục.</CommandEmpty>
                        <CommandGroup heading="Tùy chọn">
                          <CommandItem onSelect={() => setFormAllowedCategories(allCategoryIds)}><span className="mr-2 w-4" />Select all</CommandItem>
                          <CommandItem onSelect={() => setFormAllowedCategories([])}><span className="mr-2 w-4" />Clear</CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Danh mục">
                          {categories.map((c) => {
                            const label = c.name_vi || c.name || c.slug;
                            const selected = selectedCategoryIds.includes(c.id);
                            return (
                              <CommandItem key={c.id} value={`${label} ${c.slug}`} onSelect={() => toggleAllowedCategory(c.id)}>
                                <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                                <span className="flex-1">{label}</span>
                                <span className="text-xs text-muted-foreground font-mono">{c.slug}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="text-xs text-muted-foreground">
                  {categories.length > 0 && (isAllSelected ? "Đang chọn: All" : `Đang chọn: ${selectedCategoryIds.length}/${categories.length}`)}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="u-password">{dialogMode === "edit" ? "Mật khẩu mới (tuỳ chọn)" : "Mật khẩu"}</Label>
              <Input id="u-password" type="password" autoComplete="new-password" name="new-password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="rounded-none border-foreground/20" placeholder={dialogMode === "edit" ? "Để trống nếu không đổi" : ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="u-passwordConfirm">{dialogMode === "edit" ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu"}</Label>
              <Input id="u-passwordConfirm" type="password" autoComplete="new-password" name="new-password-confirm" value={formPasswordConfirm} onChange={(e) => setFormPasswordConfirm(e.target.value)} className="rounded-none border-foreground/20" />
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" className="rounded-none" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-none" onClick={submit} type="button">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
