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
    ogImage?: ContentfulEntry;
  };
}

export async function generateMetadata() {
  const client = getContentfulClient();
  
  // First get the page content
  const pageQuery = {
    content_type: 'page' as const,
    'fields.slug': '/',
    include: 3,
  };
  const pageResponse = await client.delivery.getEntries<PageEntry>(pageQuery);
  
  // Get the logo asset
  const logoAsset = await client.delivery.getAsset('5wsadgwpKdFVVPahhdvCCM');
  const logoUrl = logoAsset?.fields?.file?.url ? `https:${logoAsset.fields.file.url}` : undefined;
  const logoWidth = logoAsset?.fields?.file?.details?.image?.width;
  const logoHeight = logoAsset?.fields?.file?.details?.image?.height;
  const logoAlt = logoAsset?.fields?.description || 'Company Logo';
  
  try {
    const defaultImage = await client.delivery.getAsset('5cjlYuhGlw5DI48lLsYEL3');
    const imageUrl = defaultImage?.fields?.file?.url ? `https:${defaultImage.fields.file.url}` : undefined;
    const imageWidth = defaultImage?.fields?.file?.details?.image?.width;
    const imageHeight = defaultImage?.fields?.file?.details?.image?.height;
    const imageAlt = defaultImage?.fields?.description || 'Home';
    const page = pageResponse.items[0];
    if (!page) {
      return {
        title: 'Home',
        description: 'Welcome to our website',
        openGraph: {
          title: 'Home',
          description: 'Welcome to our website',
          type: 'website',
          images: imageUrl ? [{
            url: imageUrl,
            width: imageWidth,
            height: imageHeight,
            alt: imageAlt,
          }] : undefined,
          logo: logoUrl ? {
            url: logoUrl,
            width: logoWidth,
            height: logoHeight,
            alt: logoAlt,
          } : undefined,
        },
      };
    }

    return {
      title: page.fields.pageTitle,
      description: page.fields.pageDescription,
      openGraph: {
        title: page.fields.pageTitle,
        description: page.fields.pageDescription,
        type: 'website',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        images: imageUrl ? [{
          url: imageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt,
        }] : undefined,
        logo: logoUrl ? {
          url: logoUrl,
          width: logoWidth,
          height: logoHeight,
          alt: logoAlt,
        } : undefined,
      },
    };
  } catch (error) {
    // Return metadata without image if there's an error
    const page = pageResponse.items[0];
    if (!page) {
      return {
        title: 'Home',
        description: 'Welcome to our website',
        openGraph: {
          title: 'Home',
          description: 'Welcome to our website',
          type: 'website',
          logo: logoUrl ? {
            url: logoUrl,
            width: logoWidth,
            height: logoHeight,
            alt: logoAlt,
          } : undefined,
        },
      };
    }

    return {
      title: page.fields.pageTitle,
      description: page.fields.pageDescription,
      openGraph: {
        title: page.fields.pageTitle,
        description: page.fields.pageDescription,
        type: 'website',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        logo: logoUrl ? {
          url: logoUrl,
          width: logoWidth,
          height: logoHeight,
          alt: logoAlt,
        } : undefined,
      },
    };
  }
}

export default async function Home() {
  try {
    const client = getContentfulClient();
    const query = {
      content_type: 'page' as const,
      'fields.slug': '/',
      include: 10,
    };
    console.log('Contentful query:', query);
    const response = await client.delivery.getEntries<PageEntry>(query);
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
      {page.fields.body && Array.isArray(page.fields.body) && (page.fields.body as any[]).map((item: ContentfulEntry) => {
        console.log('Rendering body item:', {
          contentType: item.sys.contentType?.sys.id,
          fields: item.fields,
          linkedItems: item.fields.items
        });

        switch (item.sys.contentType?.sys.id) {
          case 'heroBanner':
            return <HeroBanner key={item.sys.id} data={item as any} />;
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
            console.log('Raw feature data from Contentful:', {
              title: item.fields.title,
              subTitle: item.fields.subTitle,
              alignment: item.fields.alignment,
              background: item.fields.background,
              mediaStyle: item.fields.mediaStyle,
              mediaSize: item.fields.mediaSize,
              hasMedia: !!item.fields.media,
              hasCTA: !!item.fields.cta,
              ctaLabel: item.fields.cta?.fields?.label,
              ctaType: item.fields.cta?.fields?.type
            });

            const featureData = {
              sys: {
                id: item.sys.id,
                type: item.sys.type,
                linkType: item.sys.linkType
              },
              fields: {
                internalName: item.fields.internalName || '',
                title: item.fields.title || '',
                subTitle: item.fields.subTitle || '',
                body: item.fields.body || '',
                media: item.fields.media || {
                  fields: {
                    image: {
                      fields: {
                        file: {
                          url: '',
                          contentType: '',
                          details: {
                            image: {
                              width: 0,
                              height: 0
                            }
                          }
                        }
                      }
                    }
                  }
                },
                alignment: item.fields.alignment || 'Left',
                background: item.fields.background || 'Light',
                mediaStyle: item.fields.mediaStyle,
                mediaSize: item.fields.mediaSize || 'Medium',
                cta: item.fields.cta ? {
                  sys: {
                    id: item.fields.cta.sys.id,
                    type: item.fields.cta.sys.type,
                    linkType: item.fields.cta.sys.linkType
                  },
                  fields: {
                    label: item.fields.cta.fields.label,
                    link: {
                      sys: {
                        id: item.fields.cta.fields.link.sys.id,
                        type: item.fields.cta.fields.link.sys.type,
                        linkType: item.fields.cta.fields.link.sys.linkType
                      },
                      fields: {
                        slug: item.fields.cta.fields.link.fields.slug
                      }
                    },
                    type: item.fields.cta.fields.type,
                    icon: item.fields.cta.fields.icon,
                    iconPosition: item.fields.cta.fields.iconPosition
                  }
                } : undefined
              }
            };

            console.log('Transformed feature data:', {
              title: featureData.fields.title,
              hasCTA: !!featureData.fields.cta,
              ctaLabel: featureData.fields.cta?.fields?.label,
              ctaType: featureData.fields.cta?.fields?.type
            });

            return <Feature key={item.sys.id} data={featureData as any} />;
          case 'listingContent':
            console.log('Found listingContent:', {
              item,
              fields: item.fields,
              items: item.fields.items,
              style: item.fields.style,
              linkedItems: response.includes?.Entry
            });
            
            const listingContentData = {
              fields: {
                internalName: item.fields.internalName || '',
                title: item.fields.title || '',
                subTitle: item.fields.subTitle || '',
                style: item.fields.style || 'Card',
                items: item.fields.items || [],
                background: item.fields.background || 'Light',
                contentTypeId: 'listingContent'
              }
            };
            
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
  } catch (error) {
    console.error('Error loading homepage:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AL Performance</h1>
          <p className="text-gray-600 mb-8">
            We're experiencing some technical difficulties. Please try again later.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }
}
