import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "FindMyCampus | Admissions Intelligence",
  description: "Autonomous, 100% on-device university clearance engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-200"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
