import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.scss";
import Navigation from "@/components/Navigation";
import { getContentfulClient } from "@/lib/contentful";
import { NavigationContentType } from "@/types/contentful";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "AL Performance",
  description: "AL Performance - Your trusted automotive service provider",
};

async function getNavigationData() {
  const client = getContentfulClient();
  const query = {
    content_type: 'navigation',
    limit: 1,
  };
  const response = await client.getEntries<NavigationContentType>(query);
  return response.items[0] || null;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationData = await getNavigationData();

  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <Navigation data={navigationData} />
        <main>{children}</main>
      </body>
    </html>
  );
}
