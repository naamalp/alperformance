import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.scss";
import Navigation from '@/components/Navigation';
import { getContentfulClient } from '@/lib/contentful';
import { NavigationContentType } from '@/types/contentful';

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "AL Performance",
  description: "AL Performance - Your trusted automotive service provider",
};

async function getNavigationData(): Promise<NavigationContentType | null> {
  try {
    const client = getContentfulClient();
    const entry = await client.getEntry('76xMjdWQDx8Tf290hdvXrN', { include: 3 });
    return entry as unknown as NavigationContentType;
  } catch (error) {
    console.error('Error fetching navigation data:', error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationData = await getNavigationData();

  return (
    <html lang="en" className={poppins.className}>
      <body className="font-sans">
        <Navigation data={navigationData} />
        {children}
      </body>
    </html>
  );
}
