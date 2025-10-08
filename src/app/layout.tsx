import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { LangProvider } from "@/app/context/LangContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://e-commetrics.com"),
  title: "E-commetrics | Dashboard & E-commerce Solutions for B2B and B2C",
  description:
    "E-commerce consulting with a team of digital experts in marketing and tech dev-ops, assembled, especially for B2B and B2C",
  keywords: [
    "E-commetrics",
    "e-commerce consulting",
    "digital marketing",
    "dev-ops",
    "B2B e-commerce",
    "B2C e-commerce",
    "e-commerce dashboard",
    "e-commerce solutions",
    "marketing analytics",
  ],
  authors: [{ name: "E-commetrics Team", url: "https://e-commetris.com" }],
  creator: "E-commetrics",
  publisher: "E-commetrics",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  openGraph: {
    title: "E-commetrics | Dashboard & E-commerce Solutions for B2B and B2C",
    description:
      "E-commerce consulting with a team of digital experts in marketing and tech dev-ops, assembled, especially for B2B and B2C",
    url: "https://e-commetrics.com/",
    siteName: "E-commetrics",
    locale: "es_mx",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LangProvider>
            <AuthProvider>{children}</AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
