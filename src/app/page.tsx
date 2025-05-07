import { getContentfulClient } from '@/lib/contentful';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';
import RichText from '@/components/RichText';
import Feature from '@/components/Feature';
import ListingContent from '@/components/ListingContent';
import { EntrySkeletonType } from 'contentful';
import { FeatureContentType } from '@/types/contentful';

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
    include: 10,
  };
  console.log('Contentful query:', query);
  const response = await client.getEntries<PageEntry>(query);
  console.log('Contentful response:', {
    total: response.total,
    items: response.items.length,
    firstItem: response.items[0]?.fields,
    includes: response.includes
  });

  const page = response.items[0];
  if (!page) {
    console.log('No page found with slug "/"');
    return <div>Page not found</div>;
  }

  return (
    <>
      {page.fields.body.map((item: ContentfulEntry) => {
        console.log('Rendering body item:', {
          contentType: item.sys.contentType?.sys.id,
          fields: item.fields,
          linkedItems: item.fields.items
        });

        switch (item.sys.contentType?.sys.id) {
          case 'heroBanner':
            return <HeroBanner key={item.sys.id} data={item} />;
          case 'listingDynamic':
            const listingData = {
              sys: {
                id: item.sys.id,
                type: item.sys.type,
                linkType: item.sys.linkType
              },
              fields: {
                internalName: item.fields.internalName || '',
                title: item.fields.title || '',
                subTitle: item.fields.subTitle || '',
                listingContent: item.fields.listingContent,
                category: item.fields.category || '',
                style: item.fields.style,
                filters: item.fields.filters || false,
                limit: item.fields.limit || 8,
                pagination: item.fields.pagination || false
              }
            };
            return <ListingDynamic key={item.sys.id} data={listingData} />;
          case 'richText':
            return <RichText key={item.sys.id} data={item} />;
          case 'feature':
            return <Feature key={item.sys.id} data={item} />;
          case 'listingContent':
            console.log('Found listingContent:', {
              item,
              fields: item.fields,
              items: item.fields.items,
              style: item.fields.style,
              linkedItems: response.includes?.Entry
            });
            
            const listingContentData = {
              contentTypeId: 'listingContent' as const,
              sys: {
                id: item.sys.id,
                type: item.sys.type,
                linkType: item.sys.linkType
              },
              fields: {
                internalName: item.fields.internalName || '',
                title: item.fields.title || '',
                subTitle: item.fields.subTitle || '',
                style: item.fields.style || 'Card',
                items: item.fields.items || [],
                background: item.fields.background || 'Light'
              }
            } as FeatureContentType;
            
            console.log('Transformed listingContent data:', listingContentData);
            return <ListingContent key={item.sys.id} data={listingContentData} />;
          default:
            console.log('Unknown content type:', item.sys.contentType?.sys.id);
            return null;
        }
      })}
      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-brand-primary-dark px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Contact us today to learn more about our services and how we can help you achieve your goals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/contact"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
