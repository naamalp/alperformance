import { notFound } from 'next/navigation';
import { getContentfulClient } from '@/lib/contentful';
import HeroBanner from '@/components/HeroBanner';
import { PageContentType } from '@/types/contentful';
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  console.log('Generating metadata for slug:', params.slug);
  const client = getContentfulClient();
  const page = await client.getEntries({
    content_type: 'page',
    'fields.slug': params.slug,
    include: 3,
  });

  if (!page.items.length) {
    console.log('No page found for slug:', params.slug);
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

export default async function Page({ params }: PageProps) {
  console.log('Rendering page for slug:', params.slug);
  
  const client = getContentfulClient();
  console.log('Contentful client initialized');
  
  try {
    const page = await client.getEntries({
      content_type: 'page',
      'fields.slug': params.slug,
      include: 3,
    });
    console.log('Contentful response:', page);

    if (!page.items.length) {
      console.log('No items found in response');
      notFound();
    }

    const pageData = page.items[0] as unknown as PageContentType;
    console.log('Page data:', pageData);
    console.log('Body items:', pageData.fields.body?.length);

    return (
      <main>
        <h1>{pageData.fields.pageTitle}</h1>
        <p>{pageData.fields.pageDescription}</p>
        
        {pageData.fields.body?.map((item, index) => {
          console.log(`Processing body item ${index}`);
          
          const entry = item as unknown as { sys: { id: string; type: string; contentType: { sys: { id: string } } } };
          console.log(`Entry ${index} type:`, entry.sys.type);
          console.log(`Entry ${index} contentType:`, entry.sys.contentType?.sys?.id);
          
          if (entry.sys.type === 'Entry' && entry.sys.contentType?.sys?.id === 'heroBanner') {
            console.log(`Rendering HeroBanner for item ${index}`);
            return <HeroBanner key={entry.sys.id} data={item} />;
          }
          
          return null;
        })}
      </main>
    );
  } catch (error) {
    console.error('Error fetching page:', error);
    notFound();
  }
} 