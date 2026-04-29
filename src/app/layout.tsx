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
// `metadataBase` makes `og:image` and similar URLs absolute for link previews (Slack, iMessage, LinkedIn).
// Must match the public site origin including GitHub Pages base path.
const siteUrl = "https://designbeanies.github.io/ChaelaWatkins-Portfolio";

const heroDescription =
  "I design strategic, creative experiences that reduce friction and impact those numbers people stare at in meetings.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Design Beanies",
  description: heroDescription,
  openGraph: {
    title: "Design Beanies",
    description: heroDescription,
    url: siteUrl,
    siteName: "Design Beanies",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Chaela Watkins — UX & Product Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Beanies",
    description: heroDescription,
    images: ["/og.png"],
  },
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
