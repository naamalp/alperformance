import { notFound } from 'next/navigation';
import { getContentfulClient } from '@/lib/contentful';
import { ServiceContentType, PageContentType, ListingDynamicContentType } from '@/types/contentful';
import { Metadata } from 'next';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';

interface PageProps {
  params: {
    slug: string[];
  };
}

interface Breadcrumb {
  label: string;
  href: string;
}

async function getContentBySlug(slug: string) {
  try {
    const client = getContentfulClient();
    
    // First try to get a service
    const serviceResponse = await client.getEntries({
      content_type: 'service',
      'fields.slug': slug,
      include: 3
    });

    if (serviceResponse.items.length) {
      return {
        type: 'service',
        data: serviceResponse.items[0] as unknown as ServiceContentType
      };
    }

    // If no service found, try to get a page
    const pageResponse = await client.getEntries({
      content_type: 'page',
      'fields.slug': slug,
      include: 3
    });

    if (pageResponse.items.length) {
      return {
        type: 'page',
        data: pageResponse.items[0] as unknown as PageContentType
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

function generateBreadcrumbs(content: ServiceContentType | PageContentType, type: 'service' | 'page'): Breadcrumb[] {
  if (type === 'service') {
    const service = content as ServiceContentType;
    return [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/our-services' },
      { label: service.fields.name, href: `/services/${service.fields.slug}` },
    ];
  }

  const page = content as PageContentType;
  return [
    { label: 'Home', href: '/' },
    { label: page.fields.pageTitle, href: `/${page.fields.slug}` },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = await Promise.resolve(params.slug.join('/'));
  const content = await getContentBySlug(slug);
  
  if (!content) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }

  if (content.type === 'service') {
    const service = content.data as ServiceContentType;
    return {
      title: service.fields.name,
      description: service.fields.description,
    };
  }

  const page = content.data as PageContentType;
  return {
    title: page.fields.pageTitle,
    description: page.fields.pageDescription,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  try {
    const slug = await Promise.resolve(params.slug.join('/'));
    console.log('Processing slug:', slug);
    
    const content = await getContentBySlug(slug);
    console.log('Content type:', content?.type);
    
    if (!content) {
      notFound();
    }

    // Basic structure to verify rendering
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">
            {content.type === 'service' 
              ? (content.data as ServiceContentType).fields.name 
              : (content.data as PageContentType).fields.pageTitle}
          </h1>
          
          {content.type === 'page' && (
            <div className="mt-8">
              {/* Debug section */}
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8">
                <h2 className="text-xl font-bold">Debug Info</h2>
                <p>Body items: {(content.data as PageContentType).fields.body?.length || 0}</p>
                <pre className="mt-2 text-sm overflow-auto">
                  {JSON.stringify((content.data as PageContentType).fields.body, null, 2)}
                </pre>
              </div>

              {/* Content section */}
              <div className="space-y-8">
                {await Promise.all((content.data as PageContentType).fields.body?.map(async (item, index) => {
                  const entry = item as any;
                  const contentType = entry.sys?.contentType?.sys?.id;
                  
                  console.log(`Processing item ${index}:`, contentType);
                  console.log('Entry data:', JSON.stringify(entry, null, 2));
                  
                  if (contentType === 'heroBanner') {
                    const itemFields = entry.fields;
                    const imageData = itemFields.image?.fields || {};
                    const assetData = imageData.image?.fields || {};
                    
                    const heroBannerData = {
                      sys: {
                        id: entry.sys.id,
                        type: entry.sys.type,
                        linkType: entry.sys.linkType
                      },
                      fields: {
                        title: itemFields.title || '',
                        subTitle: itemFields.subTitle || '',
                        image: {
                          fields: {
                            title: assetData.title || '',
                            description: assetData.description || '',
                            file: {
                              url: assetData.file?.url || '',
                              contentType: assetData.file?.contentType || '',
                              details: {
                                image: {
                                  width: assetData.file?.details?.image?.width || 0,
                                  height: assetData.file?.details?.image?.height || 0
                                }
                              }
                            }
                          }
                        },
                        ctaGroup: itemFields.ctaGroup?.map((cta: any) => ({
                          sys: cta.sys,
                          fields: {
                            label: cta.fields.label.content[0]?.content[0]?.value || '',
                            link: cta.fields.link,
                            style: cta.fields.type.toLowerCase()
                          }
                        })) || []
                      }
                    };
                    
                    return <HeroBanner key={entry.sys.id} data={heroBannerData} />;
                  }

                  if (contentType === 'listingDynamic') {
                    console.log('Found listingDynamic content type');
                    const itemFields = entry.fields;
                    
                    const listingData = {
                      sys: {
                        id: entry.sys.id,
                        type: entry.sys.type,
                        linkType: entry.sys.linkType
                      },
                      fields: {
                        internalName: itemFields.internalName || '',
                        title: itemFields.title || '',
                        subTitle: itemFields.subTitle || '',
                        listingContent: itemFields.listingContent || 'Services',
                        category: itemFields.category || '',
                        style: itemFields.style || 'Grid',
                        filters: itemFields.filters || false,
                        limit: itemFields.limit || 8,
                        pagination: itemFields.pagination || false
                      }
                    };
                    
                    console.log('Listing data:', JSON.stringify(listingData, null, 2));
                    return <ListingDynamic key={entry.sys.id} data={listingData} />;
                  }

                  console.log('Unhandled content type:', contentType);
                  return null;
                }) || [])}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error in DynamicPage:', error);
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