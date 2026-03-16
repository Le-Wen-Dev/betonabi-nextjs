'use client';

import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-[#f9f9f9]">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
