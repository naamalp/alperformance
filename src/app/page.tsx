import { getContentfulClient } from '@/lib/contentful';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';
import { EntrySkeletonType, EntriesQueries, QueryOptions } from 'contentful';

interface PageEntry extends EntrySkeletonType {
  contentTypeId: 'page';
  sys: {
    id: string;
    type: string;
  };
  fields: {
    title: string;
    slug: string;
    body: Array<{
      sys: {
        id: string;
        type: string;
        linkType: string;
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

export async function generateMetadata() {
  const client = getContentfulClient();
  const query: QueryOptions = {
    content_type: 'page',
    'fields.slug': 'home',
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
    title: page.fields.title,
  };
}

export default async function Home() {
  const client = getContentfulClient();
  const query: QueryOptions = {
    content_type: 'page',
    'fields.slug': 'home',
    include: 3,
  };
  const response = await client.getEntries<PageEntry>(query);

  const page = response.items[0];
  if (!page) {
    return <div>Page not found</div>;
  }

  return (
    <main>
      {page.fields.body.map((item) => {
        switch (item.sys.type) {
          case 'heroBanner':
            return <HeroBanner key={item.sys.id} data={item} />;
          case 'listingDynamic':
            return <ListingDynamic key={item.sys.id} data={item} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
