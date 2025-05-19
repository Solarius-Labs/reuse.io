import Navbar from "~/components/shared/nav";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
          <main className="min-h-screen bg-background pt-4 pb-12">
            {children}
          </main>
      </body>
    </html>
  );
}