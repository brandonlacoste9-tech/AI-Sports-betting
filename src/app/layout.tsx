import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/dictionaries";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "BetEdge AI";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} — AI Sports Betting Tips`,
    template: `%s | ${appName}`,
  },
  description:
    "Daily AI-generated sports betting picks for NFL, NBA, MLB, NHL, UFC, and Soccer. Edge analysis, confidence scores, and bankroll tools.",
  keywords: [
    "sports betting tips",
    "AI picks",
    "NFL picks",
    "NBA picks",
    "betting analytics",
    "BetEdge AI",
  ],
  openGraph: {
    title: `${appName} — AI Sports Betting Tips`,
    description: "Data-driven daily picks with transparent edge and confidence.",
    type: "website",
    url: appUrl,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const initialLocale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <AuthSessionProvider>
          <LocaleProvider initialLocale={initialLocale}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </LocaleProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
