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
    <div className="relative">
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={data.fields.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {data.fields.title}
          </h1>
          {data.fields.subTitle && (
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
              {data.fields.subTitle}
            </p>
          )}
          {data.fields.ctaGroup && data.fields.ctaGroup.length > 0 && (
            <div className="mt-10 flex justify-center gap-x-6">
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
    </div>
  );
} 

