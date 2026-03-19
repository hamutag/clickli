import AdminSidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "פאנל ניהול - קליקלי",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminSidebar />
      <main className="mr-64 p-6">{children}</main>
    </div>
  );
}
