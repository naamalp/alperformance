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
    const response = await client.getEntries({
      content_type: 'page',
      'fields.slug': 'home',
      include: 3
    });

    if (!response.items.length) {
      return (
        <main className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to AL Performance</h1>
          </div>
        </main>
      );
    }

    const page = response.items[0] as unknown as PageContentType;

    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">{page.fields.pageTitle}</h1>
          {page.fields.body?.map((item) => {
            const contentType = item.sys.contentType.sys.id;
            
            if (contentType === 'heroBanner') {
              return <HeroBanner key={item.sys.id} data={item} />;
            }

            if (contentType === 'listingDynamic') {
              return <ListingDynamic key={item.sys.id} data={item} />;
            }

            return null;
          })}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-red-600">Error Loading Page</h1>
          <p className="mt-4 text-gray-600">There was an error loading the page content.</p>
        </div>
      </main>
    );
  }
}
