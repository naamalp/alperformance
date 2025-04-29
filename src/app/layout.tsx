import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "AL Performance",
  description: "AL Performance - Your trusted automotive service provider",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
