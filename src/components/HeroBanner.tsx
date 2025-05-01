'use client';

import CTA from '@/components/CTA';
import { CTAContentType } from '@/types/contentful';

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
      image?: {
        fields: {
          title: string;
          description: string;
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
      icon?: {
        fields: {
          internalName: string;
          altText: string;
          image: {
            fields: {
              title: string;
              description: string;
              file: {
                url: string;
                contentType: string;
                details: {
                  size: number;
                  image: {
                    width: number;
                    height: number;
                  };
                };
                fileName: string;
              };
            };
          };
        };
      };
      ctaGroup?: CTAContentType[];
      type: 'Full Page' | 'Header';
    };
  };
}

export default function HeroBanner({ data }: HeroBannerProps) {
  const imageUrl = data.fields.image?.fields?.file?.url;
  const iconUrl = data.fields.icon?.fields?.image?.fields?.file?.url;
  const type = data.fields.type || 'Full Page';
  
  console.log('HeroBanner data:', {
    type,
    iconUrl,
    imageUrl,
    iconData: data.fields.icon,
    imageData: data.fields.image,
    fullData: data
  });

  if (type === 'Header') {
    return (
      <div className="relative isolate overflow-hidden bg-white">
        
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            {iconUrl && (
              <div className="mb-8">
                <img
                  src={iconUrl}
                  alt={data.fields.icon?.fields?.altText || ''}
                  className="h-12 w-auto"
                />
              </div>
            )}
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {data.fields.title}
            </h1>
            {data.fields.subTitle && (
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {data.fields.subTitle}
              </p>
            )}
            {data.fields.ctaGroup && data.fields.ctaGroup.length > 0 && (
              <div className="mt-10 flex items-center gap-x-6">
                {data.fields.ctaGroup.map((cta) => (
                  <CTA
                    key={cta.sys.id}
                    data={cta}
                  />
                ))}
              </div>
            )}
            {/* Bottom decorative background */}
            <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
              <div 
                className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#1C3BD4] to-[#051D40] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
                style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
              />
            </div>
          </div>
          {imageUrl && (
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <img
                  src={imageUrl}
                  alt={data.fields.image?.fields?.description || ''}
                  className="max-h-[40rem] object-cover rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full Page type
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      {/* Top decorative background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#051D40] to-[#1C3BD4] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          {iconUrl && (
            <div className="mb-8">
              <img
                src={iconUrl}
                alt={data.fields.icon?.fields?.altText || ''}
                className="mx-auto h-12 w-auto"
              />
            </div>
          )}
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
                  data={cta}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom decorative background */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#1C3BD4] to-[#051D40] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>
    </div>
  );
} 