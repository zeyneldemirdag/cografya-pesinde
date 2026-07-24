import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const base = new URL(`${protocol}://${host}`);
  const title = "Coğrafya Peşinde | KPSS Türkiye Harita Oyunu";
  const description =
    "KPSS coğrafya konularını Türkiye haritasında şekillere tıklayarak öğren: dağlar, göller, akarsular, ovalar, platolar ve daha fazlası.";

  return {
    metadataBase: base,
    title,
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "tr_TR",
      images: [{ url: new URL("/og.png", base).toString(), width: 1733, height: 909 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og.png", base).toString()],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
