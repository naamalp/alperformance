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
  const imageUrl = data.fields.image?.fields?.image?.fields?.file?.url;
  
  if (!imageUrl) {
    console.error('Missing image data');
    return null;
  }

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      {/* Top decorative background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            {data.fields.title}
          </h1>
          {data.fields.subTitle && (
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              {data.fields.subTitle}
            </p>
          )}
          {data.fields.ctaGroup && data.fields.ctaGroup.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {data.fields.ctaGroup.map((cta) => (
                <CTA
                  key={cta.sys.id}
                  label={cta.fields.label.content[0]?.content[0]?.value || ''}
                  href={`/${cta.fields.link.fields.slug}`}
                  type={cta.fields.type.toLowerCase() as 'primary' | 'secondary' | 'outline'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom decorative background */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>
    </div>
  );
} 