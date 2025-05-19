import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.scss";
import Navigation from "@/components/Navigation";
import { getContentfulClient } from "@/lib/contentful";
import { NavigationContentType } from "@/types/contentful";
import '@/lib/fontawesome';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Footer from '@/components/Footer';

// Tell Font Awesome to skip adding CSS automatically since we imported it above
config.autoAddCss = false;

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

// Add metadata configuration
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon/safari-pinned-tab.svg',
        color: '#051D40'
      },
    ],
  },
  manifest: '/favicon/site.webmanifest',
};

async function getNavigationData() {
  const client = getContentfulClient();
  const response = await client.delivery.getEntry('76xMjdWQDx8Tf290hdvXrN', {
    include: 3 // Include up to 3 levels of linked entries
  });
  return response as unknown as NavigationContentType || null;
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
        <Footer />
      </body>
    </html>
  );
}
