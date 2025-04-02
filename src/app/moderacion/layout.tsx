import NavigationSidebar from "@/components/navigation-sidebar";

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationSidebar />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
} 