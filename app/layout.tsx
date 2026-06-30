import type { Metadata } from "next";
import { Aleo, Open_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const aleo = Aleo({
  variable: "--font-aleo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AcaciaGiving — Rooted in Giving",
    template: "%s | AcaciaGiving",
  },
  description:
    "AcaciaGiving connects donors with vetted nonprofits and community projects across Africa and the world. Fund education, health, environment, disaster relief and more.",
  metadataBase: new URL("https://acaciagiving.org"),
  keywords: [
    "donate",
    "crowdfunding",
    "nonprofits",
    "charity",
    "AcaciaGiving",
    "humanitarian",
    "Africa",
    "education",
    "health",
    "environment",
  ],
  authors: [{ name: "AcaciaGiving" }],
  creator: "AcaciaGiving",
  publisher: "AcaciaGiving",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://acaciagiving.org",
    siteName: "AcaciaGiving",
    title: "AcaciaGiving — Rooted in Giving",
    description:
      "Connect with vetted nonprofits and community projects across Africa. Your donation creates real, measurable impact.",
    images: [
      {
        url: "/images/og-default.svg",
        width: 1200,
        height: 630,
        alt: "AcaciaGiving — Rooted in Giving",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@acaciagiving",
    creator: "@acaciagiving",
    title: "AcaciaGiving — Rooted in Giving",
    description:
      "Connect with vetted nonprofits and community projects across Africa.",
    images: ["/images/og-default.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.json",
  themeColor: "#F08B1D",
  applicationName: "AcaciaGiving",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AcaciaGiving",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${aleo.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
