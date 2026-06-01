import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8da101" },
    { media: "(prefers-color-scheme: dark)", color: "#a7c080" },
  ],
};

export const metadata: Metadata = {
  title: "Opus - Job Search Tracker",
  description: "Track your job applications with ease.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          <div className="pt-[4.5rem] flex-1">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
