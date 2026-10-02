import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteUrl } from "@/lib/site";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Happy Healthy Marry",
    template: "%s · Happy Healthy Marry",
  },
  description: "Recipes worth repeating, and the life around the table.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${newsreader.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
