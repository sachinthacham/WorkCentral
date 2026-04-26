import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";
import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorkCentral",
  description:
    "Plan work, ship faster, and keep your team aligned in one calm, focused place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${outfit.variable}`}
    >
      <body className="antialiased font-sans">
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  );
}
