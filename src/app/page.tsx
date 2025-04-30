import { getContentfulClient } from '@/lib/contentful';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';
import { EntrySkeletonType } from 'contentful';

interface ContentfulEntry {
  sys: {
    id: string;
    type: string;
    linkType: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    [key: string]: any;
  };
}

interface PageEntry extends EntrySkeletonType {
  contentTypeId: 'page';
  sys: {
    id: string;
    type: string;
  };
  fields: {
    internalName: string;
    pageTitle: string;
    pageDescription: string;
    pageType: string;
    slug: string;
    body: ContentfulEntry[];
  };
}

export async function generateMetadata() {
  const client = getContentfulClient();
  const query = {
    content_type: 'page' as const,
    'fields.slug': '/',
    include: 3,
  };
  const response = await client.getEntries<PageEntry>(query);

  const page = response.items[0];
  if (!page) {
    return {
      title: 'Home',
    };
  }

  return {
    title: page.fields.pageTitle,
  };
}

export default async function Home() {
  const client = getContentfulClient();
  const query = {
    content_type: 'page' as const,
    'fields.slug': '/',
    include: 3,
  };
  console.log('Contentful query:', query);
  const response = await client.getEntries<PageEntry>(query);
  console.log('Contentful response:', {
    total: response.total,
    items: response.items.length,
    firstItem: response.items[0]?.fields
  });

  const page = response.items[0];
  if (!page) {
    console.log('No page found with slug "/"');
    return <div>Page not found</div>;
  }

  return (
    <main>
      {page.fields.body.map((item: ContentfulEntry) => {
        console.log('Rendering body item:', {
          contentType: item.sys.contentType?.sys.id,
          fields: item.fields
        });
        switch (item.sys.contentType?.sys.id) {
          case 'heroBanner':
            return <HeroBanner key={item.sys.id} data={item} />;
          case 'listingDynamic':
            return <ListingDynamic key={item.sys.id} data={item} />;
          default:
            console.log('Unknown content type:', item.sys.contentType?.sys.id);
            return null;
        }
      })}
    </main>
  );
}
