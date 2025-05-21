import 'dotenv/config';
console.log('ENV:', {
  SPACE_ID: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  ACCESS_TOKEN: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  MGMT_TOKEN: process.env.CONTENTFUL_MANAGEMENT_TOKEN
});
import { getContentfulClient } from '../lib/contentful';
import { Entry, EntrySkeletonType } from 'contentful';

interface PageFields {
  slug: string;
}

interface ServiceFields {
  slug: string;
}

type PageEntry = EntrySkeletonType<PageFields>;
type ServiceEntry = EntrySkeletonType<ServiceFields>;

export async function generateSitemap() {
  const baseUrl = 'https://www.alperformance.co.uk';
  const staticPages = [''];
  
  // Get Contentful client
  const client = getContentfulClient();
  console.log('Contentful client:', !!client.delivery);
  
  // Fetch all page slugs
  const pageEntries = await client.delivery.getEntries<PageEntry>({
    content_type: 'page',
    select: ['fields.slug'],
    limit: 1000
  });
  console.log('Page entries:', pageEntries.items.map((item: Entry<PageEntry>) => item.fields.slug));
  
  // Fetch all service slugs
  const serviceEntries = await client.delivery.getEntries<ServiceEntry>({
    content_type: 'service',
    select: ['fields.slug'],
    limit: 1000
  });
  console.log('Service entries:', serviceEntries.items.map((item: Entry<ServiceEntry>) => item.fields.slug));

  // Combine all URLs
  const urls = [
    ...staticPages,
    ...pageEntries.items.map((item: Entry<PageEntry>) => `/${item.fields.slug}`),
    ...serviceEntries.items.map((item: Entry<ServiceEntry>) => `/services/${item.fields.slug}`)
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
    <url>
      <loc>${baseUrl}${url}</loc>
      <changefreq>weekly</changefreq>
      <priority>${url === '/' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
</urlset>`;

  return sitemap;
}

// Run if this file is executed directly
if (require.main === module) {
  generateSitemap()
    .then(sitemap => {
      const fs = require('fs');
      fs.writeFileSync('public/sitemap.xml', sitemap);
      console.log('Sitemap generated successfully!');
    })
    .catch(error => {
      console.error('Error generating sitemap:', error);
      process.exit(1);
    });
} 