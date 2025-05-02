import { notFound } from 'next/navigation';
import { getContentfulClient } from '@/lib/contentful';
import { ServiceContentType, PageContentType, FeatureContentType } from '@/types/contentful';
import { Metadata } from 'next';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';
import RichText from '@/components/RichText';
import Feature from '@/components/Feature';
import ListingContent from '@/components/ListingContent';
import ServiceLayout from '@/components/ServiceLayout';

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
    internalName?: string;
    title?: string;
    body?: any;
    media?: {
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
    alignment?: 'Left' | 'Center' | 'Right';
    background?: 'Light' | 'Dark';
  };
}

async function getContentBySlug(slug: string) {
  try {
    const client = getContentfulClient();
    
    // First try to get a service
    const serviceResponse = await client.getEntries({
      content_type: 'service',
      include: 10
    });

    // Find the service that matches the slug pattern
    const service = serviceResponse.items.find((item: any) => {
      const serviceSlug = item.fields.slug;
      const parentSlug = item.fields.parent?.fields?.slug;
      
      // If there's a parent, check if the slug matches parent/slug
      if (parentSlug) {
        return slug === `${parentSlug}/${serviceSlug}`;
      }
      // If no parent, check if the slug matches directly
      return slug === serviceSlug;
    });

    if (service) {
      return {
        type: 'service',
        data: service as unknown as ServiceContentType
      };
    }

    // If no service found, try to get a page
    const pageResponse = await client.getEntries({
      content_type: 'page',
      'fields.slug': slug,
      include: 10
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

export default async function Page({
  params,
}: {
  params: { slug: string[] };
}) {
  try {
    const slug = params.slug.join('/');
    console.log('Processing slug:', slug);
    
    const content = await getContentBySlug(slug);
    console.log('Content type:', content?.type);
    
    if (!content) {
      console.log('No content found for slug:', slug);
      notFound();
    }

    // If it's a service, use the ServiceLayout
    if (content.type === 'service') {
      return <ServiceLayout data={content.data as ServiceContentType} />;
    }

    const pageContent = (content.data as PageContentType).fields.body;

    const renderContent = async (item: ContentfulEntry) => {
      const contentType = item.sys.contentType?.sys?.id;
      console.log('Content type:', contentType, 'Item:', JSON.stringify(item, null, 2));
      
      if (contentType === 'heroBanner') {
        const itemFields = item.fields;
        const imageData = itemFields.image?.fields;
        
        console.log('Raw hero banner data:', {
          itemFields,
          imageData,
          imageUrl: itemFields.image?.fields?.file?.url,
          fullImage: itemFields.image
        });
        
        const heroBannerData = {
          sys: {
            id: item.sys.id,
            type: item.sys.type,
            linkType: item.sys.linkType
          },
          fields: {
            title: itemFields.title || '',
            subTitle: itemFields.subTitle || '',
            type: itemFields.type || 'Full Page',
            icon: itemFields.icon ? {
              fields: {
                internalName: itemFields.icon.fields.internalName || '',
                altText: itemFields.icon.fields.altText || '',
                image: {
                  fields: {
                    title: itemFields.icon.fields.image.fields.title || '',
                    description: itemFields.icon.fields.image.fields.description || '',
                    file: {
                      url: itemFields.icon.fields.image.fields.file?.url || '',
                      contentType: itemFields.icon.fields.image.fields.file?.contentType || '',
                      details: {
                        size: itemFields.icon.fields.image.fields.file?.details?.size || 0,
                        image: {
                          width: itemFields.icon.fields.image.fields.file?.details?.image?.width || 0,
                          height: itemFields.icon.fields.image.fields.file?.details?.image?.height || 0
                        }
                      },
                      fileName: itemFields.icon.fields.image.fields.file?.fileName || ''
                    }
                  }
                }
              }
            } : undefined,
            image: itemFields.image ? {
              fields: {
                title: itemFields.image.fields.image.fields.title || '',
                description: itemFields.image.fields.image.fields.description || '',
                file: {
                  url: `https:${itemFields.image.fields.image.fields.file?.url}` || '',
                  contentType: itemFields.image.fields.image.fields.file?.contentType || '',
                  details: {
                    image: {
                      width: itemFields.image.fields.image.fields.file?.details?.image?.width || 0,
                      height: itemFields.image.fields.image.fields.file?.details?.image?.height || 0
                    }
                  }
                }
              }
            } : undefined,
            ctaGroup: itemFields.ctaGroup?.map((cta: ContentfulEntry) => {
              console.log('CTA fields:', JSON.stringify(cta.fields, null, 2));
              return {
                sys: {
                  id: cta.sys.id,
                  type: cta.sys.type,
                  linkType: cta.sys.linkType
                },
                fields: {
                  label: cta.fields.label?.content?.[0]?.content?.[0]?.value || '',
                  link: {
                    sys: {
                      id: cta.fields.link.sys.id,
                      type: cta.fields.link.sys.type,
                      linkType: cta.fields.link.sys.linkType
                    },
                    fields: {
                      slug: cta.fields.link.fields.slug
                    }
                  },
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
            internalName: itemFields.internalName || '',
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

      if (contentType === 'richText') {
        return <RichText key={item.sys.id} data={item} />;
      }

      if (contentType === 'feature') {
        const featureData = {
          sys: {
            id: item.sys.id,
            type: item.sys.type,
            linkType: item.sys.linkType
          },
          fields: {
            internalName: item.fields.internalName || '',
            title: item.fields.title || '',
            body: item.fields.body || '',
            media: item.fields.media,
            alignment: item.fields.alignment || 'Left',
            background: item.fields.background || 'Light'
          }
        };
        return <Feature key={item.sys.id} data={featureData} />;
      }

      if (contentType === 'listingContent') {
        console.log('Found listingContent content type:', {
          item,
          fields: item.fields,
          items: item.fields.items,
          style: item.fields.style
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
            style: item.fields.style || 'Card',
            items: item.fields.items || [],
            background: item.fields.background || 'Light'
          }
        } as FeatureContentType;
        
        console.log('Transformed listingContent data:', listingContentData);
        return <ListingContent key={item.sys.id} data={listingContentData} />;
      }

      console.log('Unhandled content type:', contentType);
      return null;
    };

    const renderedContent = await Promise.all(pageContent?.map(renderContent) || []);

    return (
      <main className="min-h-screen bg-white">
        <div className="prose max-w-none">
          {renderedContent}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error in DynamicPage:', error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}): Promise<Metadata> {
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