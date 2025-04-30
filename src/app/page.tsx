import { getContentfulClient } from '@/lib/contentful';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';
import { EntrySkeletonType } from 'contentful';

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
    body: Array<{
      sys: {
        id: string;
        type: string;
        linkType: string;
        contentType: {
          sys: {
            id: string;
          };
        };
      };
      fields: {
        title: string;
        subTitle: string;
        image: {
          fields: {
            image: {
              fields: {
                file: {
                  url: string;
                  contentType: string;
                  details: {
                    image: {
                      width: number;
                      height: number;
                    };
                  };
                };
              };
            };
          };
        };
        ctaGroup?: Array<{
          sys: {
            id: string;
          };
          fields: {
            label: {
              content: Array<{
                content: Array<{
                  value: string;
                }>;
              }>;
            };
            link: {
              fields: {
                slug: string;
              };
            };
            type: 'Primary' | 'Link';
          };
        }>;
        listingContent: 'Services' | 'Articles';
        style?: string;
        filters?: Array<{
          sys: {
            id: string;
          };
          fields: {
            name: string;
            value: string;
          };
        }>;
        limit?: number;
        pagination?: boolean;
        internalName: string;
      };
    }>;
  };
}

type PageProps = {
  params: { slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

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
      {page.fields.body.map((item: PageEntry['fields']['body'][number]) => {
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
