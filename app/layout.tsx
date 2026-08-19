import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamOps AI",
  description: "AI workforce intelligence for support teams.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
