import type { Metadata, Viewport } from "next";
import "./globals.css";

export const dynamic = "force-static";

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const metadataBase = new URL(publicSiteUrl);
const title = "Coğrafya Peşinde | KPSS Türkiye Harita Oyunu";
const description =
  "KPSS coğrafya konularını Türkiye haritasında şekillere tıklayarak öğren: dağlar, göller, akarsular, ovalar, platolar ve daha fazlası.";

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  icons: {
    icon: `${publicBasePath}/favicon.svg`,
    shortcut: `${publicBasePath}/favicon.svg`,
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "tr_TR",
    images: [{ url: `${publicSiteUrl}/og.png`, width: 1733, height: 909 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${publicSiteUrl}/og.png`],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f2e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" style={{ colorScheme: "only light" }}>
      <head>
        <meta name="color-scheme" content="only light" />
      </head>
      <body>{children}</body>
    </html>
  );
}
