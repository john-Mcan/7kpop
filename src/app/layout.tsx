import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/supabase/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "7Kpop - Para fans de Kpop en América Latina",
  description: "Una plataforma para fans de Kpop en América Latina",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="min-h-screen flex">
            {children}
          </div>
        </AuthProvider>
        <Script id="handle-body-attributes" strategy="afterInteractive">
          {`
            if (document.body.hasAttribute('cz-shortcut-listen')) {
              document.body.removeAttribute('cz-shortcut-listen');
            }
          `}
        </Script>
      </body>
    </html>
  );
} 