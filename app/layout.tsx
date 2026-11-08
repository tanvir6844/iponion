import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IPonion | 24/7 Home & Office IT Support in Dhaka",
  description: "Fast, reliable home and small-office IT support across Dhaka by IPonion."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
