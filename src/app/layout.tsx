import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Dashboard - Notion Sync",
  description: "Live client dashboard powered by Notion and AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-950 font-sans">
        {children}
      </body>
    </html>
  );
}
