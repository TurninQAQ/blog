import "./admin.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="manga-admin-shell min-h-svh overflow-x-clip bg-lab-base text-lab-text">
      {children}
    </div>
  );
}
