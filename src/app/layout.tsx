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

// Tab title + favicon: `title` below; favicon is `app/icon.svg` (Next.js file convention).
export const metadata: Metadata = {
  title: "Design Beanies",
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
      <body
        className="font-sans antialiased"
        // If the Tailwind CSS chunk fails to load, utility classes are inert; keep
        // a real sans stack + base colors so the page still reads as the design.
        style={{
          fontFamily:
            "var(--font-afacad, ui-sans-serif), system-ui, sans-serif",
          color: "#0f0000",
          backgroundColor: "#f7f8f8",
        }}
      >
        {children}
      </body>
    </html>
  );
}
