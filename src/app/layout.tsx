import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { KindProvider } from "@/context/KindContext";

// One voice, two weights. Archivo is loaded as a variable font, so 400 (body)
// and 800 (every heading, number and wordmark) ship in a single file — the
// design leans on that weight jump for all of its hierarchy.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#f3f2f2",
};

export const metadata: Metadata = {
  title: "Opus — application tracker",
  description: "Every application, one page.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Opus",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      {/* The header is no longer fixed — it's the first band of the app shell,
          and each screen owns its own header (the sign-in split has none), so
          it's rendered per-screen rather than here. */}
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
            <KindProvider>{children}</KindProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
