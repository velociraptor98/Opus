import type { Metadata, Viewport } from "next";
import { Quicksand, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { KindProvider } from "@/context/KindContext";
import Navbar from "@/components/Navbar";

// Two voices. Quicksand is the brand voice — rounded, warm, the wordmark and
// headings. Space Mono is the system voice — labels, captions, metadata.
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  // The app renders on paper only.
  themeColor: "#f6f2ea",
};

export const metadata: Metadata = {
  title: "Opus — job search tracker",
  description: "Track your job applications, calmly.",
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
    <html
      lang="en"
      className={`${quicksand.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <ToastProvider>
            <KindProvider>
              <Navbar />
              <div className="pt-[4.5rem] flex-1">
                {children}
              </div>
            </KindProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
