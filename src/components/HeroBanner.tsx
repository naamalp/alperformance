'use client';

import CTA from '@/components/CTA';

interface HeroBannerProps {
  data: {
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
          altText: string;
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
    };
  };
}

export default function HeroBanner({ data }: HeroBannerProps) {
  const { title, subTitle, image, ctaGroup } = data.fields;

  // Get the image URL from the nested structure
  const imageUrl = image?.fields?.image?.fields?.file?.url;
  const altText = image?.fields?.altText || '';

  if (!imageUrl) {
    console.error('Missing image data:', image);
    return null;
  }

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      {/* Background gradient */}
      <div 
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#051D40] to-[#1C3BD4] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
            Announcing our next round of funding.{' '}
            <a href="#" className="font-semibold text-indigo-600">
              <span className="absolute inset-0" aria-hidden="true" />
              Read more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            {title}
          </h1>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl leading-8">
            {subTitle}
          </p>

          {ctaGroup && ctaGroup.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {ctaGroup.map((cta) => {
                if (!cta.fields.link?.fields?.slug) {
                  console.error('Missing CTA link data:', cta);
                  return null;
                }

                // Extract the label text from the rich text structure
                const label = cta.fields.label?.content?.[0]?.content?.[0]?.value || '';

                // Map Contentful CTA types to component types
                const ctaType = cta.fields.type === 'Primary' ? 'Primary' : 'Secondary';

                return (
                  <CTA
                    key={cta.sys.id}
                    label={label}
                    href={`/${cta.fields.link.fields.slug}`}
                    type={ctaType}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient */}
      <div 
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#1C3BD4] to-[#051D40] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>
    </div>
  );
} 

