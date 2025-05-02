import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.scss";
import Navigation from "@/components/Navigation";
import { getContentfulClient } from "@/lib/contentful";
import { NavigationContentType } from "@/types/contentful";
import '@/lib/fontawesome';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Tell Font Awesome to skip adding CSS automatically since we imported it above
config.autoAddCss = false;

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
    content_type: 'navigation' as const,
    limit: 1,
    include: 3 as const, // Include up to 3 levels of linked entries
  };
  const response = await client.getEntries<NavigationContentType>(query);
  console.log('Navigation data:', JSON.stringify(response.items[0], null, 2));
  return response.items[0] as unknown as NavigationContentType || null;
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
