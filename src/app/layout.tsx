import type { Metadata } from "next";
import { Afacad } from "next/font/google";
import "./globals.css";

const afacad = Afacad({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-afacad",
  // Afacad is not in next/font’s capsize metrics table; without this, Next logs
  // "Failed to find font override values" and can surface it as a server/compile error.
  adjustFontFallback: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chaela Watkins — UX & Product Designer",
  description:
    "I design experiences that reduce friction and move metrics across ecommerce, fintech, and enterprise SaaS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={afacad.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
