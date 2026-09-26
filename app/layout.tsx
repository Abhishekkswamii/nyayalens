import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { DocumentSessionProvider } from "@/lib/client/session-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nyayalens.vercel.app"),
  title: {
    default: "NyayaLens — Understand Before You Sign",
    template: "%s · NyayaLens",
  },
  description:
    "AI-powered legal document intelligence for clearer summaries, clauses, risks, obligations and evidence-backed questions.",
  openGraph: {
    title: "NyayaLens — Understand Before You Sign",
    description:
      "AI-powered legal document intelligence for clearer summaries, clauses, risks, obligations and evidence-backed questions.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NyayaLens — Understand Before You Sign",
    description: "AI-powered legal document intelligence. Understand. Verify. Decide.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="font-sans antialiased">
        <DocumentSessionProvider>{children}</DocumentSessionProvider>
      </body>
    </html>
  );
}
