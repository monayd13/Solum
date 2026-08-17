import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solum · AI Companion That Calls, Listens & Remembers",
  description:
    "Solum is an AI companion platform where you can call and have conversations with personality-driven AI agents who remember you across sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
