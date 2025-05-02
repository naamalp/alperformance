'use client';

import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import { ServiceContentType } from '@/types/contentful';
import HeroBanner from './HeroBanner';

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return <p className="mt-4 text-base leading-7 text-gray-600">{children}</p>;
    },
  },
};

interface ServiceLayoutProps {
  data: ServiceContentType;
}

export default function ServiceLayout({ data }: ServiceLayoutProps) {
  if (!data || !data.fields) {
    return null;
  }

  console.log('Service data:', {
    fields: data.fields,
    featuredImage: data.fields.featuredImage,
    featuredImageFields: data.fields.featuredImage?.fields,
    imageFields: data.fields.featuredImage?.fields?.image?.fields,
    logo: data.fields.logo,
    logoFields: data.fields.logo?.fields
  });

  // Transform service data into hero banner format
  const heroBannerData = {
    sys: {
      id: data.sys.id,
      type: data.sys.type,
      linkType: data.sys.linkType
    },
    fields: {
      title: data.fields.name,
      subTitle: data.fields.shortDescription,
      type: 'Header' as const,
      icon: data.fields.icon?.fields?.image?.fields ? {
        fields: {
          image: {
            fields: {
              file: {
                url: `https:${data.fields.icon.fields.image.fields.file.url}`,
                contentType: data.fields.icon.fields.image.fields.file.contentType,
                details: {
                  image: {
                    width: data.fields.icon.fields.image.fields.file.details.image.width,
                    height: data.fields.icon.fields.image.fields.file.details.image.height
                  }
                }
              }
            }
          }
        }
      } : undefined,
      ctaGroup: data.fields.ctaGroup || []
    }
  };

  console.log('Hero banner data:', heroBannerData);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroBanner data={heroBannerData} />

      {/* Content Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <div className="prose prose-lg max-w-none">
            {data.fields.body && documentToReactComponents(data.fields.body, options)}
          </div>
        </div>
      </div>

      {/* Features Section */}
      {data.fields.features && data.fields.features.length > 0 && (
        <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Features</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to know
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {data.fields.features.map((feature) => (
                  <div key={feature.sys.id} className="flex flex-col">
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      {feature.fields.title}
                    </dt>
                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.fields.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
} 