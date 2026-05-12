import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendScan — Free AI Tool Spend Audit",
  description:
    "Find out if you're overspending on AI tools. Get an instant audit of your Cursor, Claude, ChatGPT, GitHub Copilot spend — free, no signup required.",
  openGraph: {
    title: "SpendScan — Free AI Tool Spend Audit",
    description:
      "Find out if you're overspending on AI tools. Instant audit, no signup required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendScan — Free AI Tool Spend Audit",
    description: "Are you overspending on AI tools? Find out in 60 seconds.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
