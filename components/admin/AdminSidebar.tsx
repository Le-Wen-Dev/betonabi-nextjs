'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Image, Settings, LogOut, ListTree, Users, MessageSquare, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type MenuItem = { title: string; path: string; icon: typeof LayoutDashboard; adminOnly?: boolean };

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, adminOnly: true },
  { title: 'Bài viết', path: '/admin/articles', icon: FileText },
  { title: 'Danh mục', path: '/admin/categories', icon: ListTree, adminOnly: true },
  { title: 'Bình luận', path: '/admin/comments', icon: MessageSquare, adminOnly: true },
  { title: 'Liên hệ', path: '/admin/contacts', icon: Mail, adminOnly: true },
  { title: 'Tài khoản', path: '/admin/users', icon: Users, adminOnly: true },
  { title: 'Media', path: '/admin/media', icon: Image },
  { title: 'Cài đặt', path: '/admin/settings', icon: Settings, adminOnly: true },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout, isAdmin } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-background border-r border-foreground/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-foreground/20">
        <h1 className="font-serif text-xl font-bold text-foreground">
          Betonabi
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems
            .filter((item) => (item.adminOnly ? isAdmin : true))
            .map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive
                      ? 'font-serif font-bold text-foreground border-b-2 border-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-foreground/20">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
