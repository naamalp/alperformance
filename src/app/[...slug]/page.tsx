import { notFound } from 'next/navigation';
import { getContentfulClient } from '@/lib/contentful';
import { ServiceContentType, PageContentType } from '@/types/contentful';
import { Metadata } from 'next';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';

type PageProps = {
  params: {
    slug: string[];
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug.join('/');
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
      description: service.fields.shortDescription,
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
    const slug = params.slug.join('/');
    console.log('Processing slug:', slug);
    
    const content = await getContentBySlug(slug);
    console.log('Content type:', content?.type);
    
    if (!content) {
      console.log('No content found for slug:', slug);
      notFound();
    }

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
              <div className="prose max-w-none">
                {await Promise.all((content.data as PageContentType).fields.body?.map(async (item) => {
                  const contentType = item.sys.contentType?.sys?.id;
                  console.log('Content type:', contentType, 'Item:', JSON.stringify(item, null, 2));
                  
                  if (contentType === 'heroBanner') {
                    const itemFields = item.fields;
                    const imageData = itemFields.image?.fields;
                    
                    const heroBannerData = {
                      sys: {
                        id: item.sys.id,
                        type: item.sys.type,
                        linkType: item.sys.linkType
                      },
                      fields: {
                        title: itemFields.title || '',
                        subTitle: itemFields.subTitle || '',
                        image: {
                          fields: {
                            image: {
                              fields: {
                                file: {
                                  url: imageData?.file?.url || '',
                                  contentType: imageData?.file?.contentType || '',
                                  details: {
                                    image: {
                                      width: imageData?.file?.details?.image?.width || 0,
                                      height: imageData?.file?.details?.image?.height || 0
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        ctaGroup: itemFields.ctaGroup?.map((cta) => {
                          console.log('CTA fields:', JSON.stringify(cta.fields, null, 2));
                          return {
                            sys: {
                              id: cta.sys.id,
                              type: cta.sys.type,
                              linkType: cta.sys.linkType
                            },
                            fields: {
                              label: cta.fields.label?.content?.[0]?.content?.[0]?.value || '',
                              link: cta.fields.link,
                              type: cta.fields.type || 'Primary'
                            }
                          };
                        }) || []
                      }
                    };
                    
                    return <HeroBanner key={item.sys.id} data={heroBannerData} />;
                  }

                  if (contentType === 'listingDynamic') {
                    console.log('Found listingDynamic content type');
                    const itemFields = item.fields;
                    
                    const listingData = {
                      sys: {
                        id: item.sys.id,
                        type: item.sys.type,
                        linkType: item.sys.linkType
                      },
                      fields: {
                        internalName: itemFields.internalName,
                        title: itemFields.title || '',
                        subTitle: itemFields.subTitle || '',
                        listingContent: itemFields.listingContent,
                        category: itemFields.category || '',
                        style: itemFields.style,
                        filters: itemFields.filters || false,
                        limit: itemFields.limit || 8,
                        pagination: itemFields.pagination || false
                      }
                    };
                    
                    console.log('Listing data:', JSON.stringify(listingData, null, 2));
                    return <ListingDynamic key={item.sys.id} data={listingData} />;
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
    notFound();
  }
} 