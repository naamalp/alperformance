import { notFound } from 'next/navigation';
import { getContentfulClient } from '@/lib/contentful';
import { PageContentType } from '@/types/contentful';
import { Metadata } from 'next';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';

export async function generateMetadata(): Promise<Metadata> {
  const client = getContentfulClient();
  const page = await client.getEntries({
    content_type: 'page',
    'fields.slug': '/',
    include: 3,
  });

  if (!page.items.length) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }

  const pageData = page.items[0] as unknown as PageContentType;
  return {
    title: pageData.fields.pageTitle,
    description: pageData.fields.pageDescription,
  };
}

export default async function Home() {
  try {
    const client = getContentfulClient();
    console.log('Fetching home page content...');
    
    const page = await client.getEntries({
      content_type: 'page',
      'fields.slug': '/',
      include: 3,
    });

    if (!page.items.length) {
      console.log('No home page found in Contentful');
      notFound();
    }

    const pageData = page.items[0] as unknown as PageContentType;
    console.log('Page data:', pageData);
    console.log('Body items:', pageData.fields.body?.length);

    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {pageData.fields.body?.map((item, index) => {
            const entry = item as any;
            const contentType = entry.sys?.contentType?.sys?.id;
            
            console.log(`Processing item ${index}:`, contentType);
            
            switch (contentType) {
              case 'heroBanner':
                return (
                  <div key={entry.sys.id} className="mb-12">
                    <HeroBanner data={entry} />
                  </div>
                );
              case 'listingDynamic':
                return (
                  <div key={entry.sys.id} className="mb-12">
                    <ListingDynamic data={entry} />
                  </div>
                );
              default:
                console.warn(`Unhandled content type: ${contentType}`);
                return null;
            }
          })}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching home page:', error);
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-red-600">Error Loading Page</h1>
          <p className="mt-4 text-gray-600">There was an error loading the page content.</p>
          <pre className="mt-4 p-4 bg-red-50 text-red-700 rounded">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </main>
    );
  }
}
