import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export const metadata = {
  title: "פאנל ניהול - קליקלי",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
