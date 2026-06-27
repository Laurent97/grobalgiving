import type { Metadata } from "next";
import { Aleo, Open_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
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
    default: "GlobalGiving — Together We Make a Difference",
    template: "%s | GlobalGiving",
  },
  description:
    "GlobalGiving connects donors with vetted nonprofits and community projects around the world. Fund education, health, environment, disaster relief and more.",
  metadataBase: new URL("https://globalgiving.online"),
  keywords: [
    "donate",
    "crowdfunding",
    "nonprofits",
    "charity",
    "GlobalGiving",
    "humanitarian",
    "Africa",
    "education",
    "health",
    "environment",
  ],
  authors: [{ name: "GlobalGiving" }],
  creator: "GlobalGiving",
  publisher: "GlobalGiving",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://globalgiving.online",
    siteName: "GlobalGiving",
    title: "GlobalGiving — Together We Make a Difference",
    description:
      "Connect with vetted nonprofits and community projects around the world. Your donation creates real, measurable impact.",
    images: [
      {
        url: "/images/og-default.svg",
        width: 1200,
        height: 630,
        alt: "GlobalGiving — Together We Make a Difference",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GlobalGiving",
    creator: "@GlobalGiving",
    title: "GlobalGiving — Together We Make a Difference",
    description:
      "Connect with vetted nonprofits and community projects around the world.",
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
  applicationName: "GlobalGiving",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GlobalGiving",
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
          <Navigation />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
