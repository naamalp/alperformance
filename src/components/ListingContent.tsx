'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { IconDefinition, library, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import { FeatureContentType } from '@/types/contentful';
import Feature from './Feature';
import TestimonialList from './TestimonialList';

// Add all solid icons to the library
library.add(fas);

interface ListingContentProps {
  data: {
    contentTypeId: string;
    sys: {
      id: string;
      type: string;
    };
    fields: {
      internalName: string;
      title: string;
      subTitle?: string;
      items: Array<any>;
      background?: 'Light' | 'Dark';
      style?: 'default' | 'carousel' | 'Pricing' | 'Testimonial';
    };
  };
}

interface PackageItem {
  Label: string;
  Value: string;
  ValueType: 'text' | 'icon';
}

interface Package {
  sys: {
    id: string;
  };
  fields: {
    internalName: string;
    packageName: string;
    tagline: string;
    items: PackageItem[];
    price: string;
  };
}

interface CardItem {
  sys: {
    id: string;
  };
  fields: {
    internalName: string;
    firstName: string;
    lastName: string;
    role: string;
    internal: boolean;
    linkedIn?: string;
    bio: any;
    image?: {
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
        altText: string;
      };
    };
  };
}

function isPackage(item: any): item is Package {
  return (
    item?.fields?.packageName !== undefined &&
    item?.fields?.tagline !== undefined &&
    item?.fields?.items !== undefined &&
    item?.fields?.price !== undefined
  );
}

function isCardItem(item: any): item is CardItem {
  return (
    item?.fields?.firstName !== undefined &&
    item?.fields?.lastName !== undefined &&
    item?.fields?.role !== undefined
  );
}

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return <p className="mt-4 text-base leading-7 text-gray-600">{children}</p>;
    },
  },
};

const CardItemComponent = ({ item, textColorClass }: { item: CardItem; textColorClass: string }) => (
  <article className="flex flex-col items-start">
    <div className="relative w-full">
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
        {item.fields.image?.fields?.image?.fields?.file?.url && (
          <Image
            src={`https:${item.fields.image.fields.image.fields.file.url}`}
            alt={item.fields.image.fields.altText || ''}
            width={item.fields.image.fields.image.fields.file.details.image.width}
            height={item.fields.image.fields.image.fields.file.details.image.height}
            className="h-full w-full object-cover m-0"
            priority
          />
        )}
      </div>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
    </div>
    <div className="max-w-xl">
      <div className="mt-8 flex items-center gap-x-4 text-xs">
        <time dateTime="2020-03-16" className="text-gray-500">
          {item.fields.role}
        </time>
      </div>
      <div className="group relative">
        <h3 className={`mt-3 text-lg font-semibold leading-6 ${textColorClass} group-hover:text-gray-600`}>
          <span className="absolute inset-0" />
          {item.fields.firstName} {item.fields.lastName}
        </h3>
        <div className="mt-5 text-sm leading-6 text-gray-600">
          {item.fields.bio && documentToReactComponents(item.fields.bio, options)}
        </div>
        {item.fields.linkedIn && (
          <div className="mt-6 flex gap-6 relative z-10">
            <a 
              href={item.fields.linkedIn} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
            >
              <span className="sr-only">LinkedIn</span>
              <FontAwesomeIcon icon={faLinkedin} size="2x" />
            </a>
          </div>
        )}
      </div>
    </div>
  </article>
);

const PricingItem = ({ package: pkg, textColorClass }: { package: Package; textColorClass: string }) => (
  <article className="flex flex-col items-start">
    <div className="relative w-full">
      <div className="relative flex flex-col h-full p-8 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-lg transition-shadow duration-300">
        <div className="flex-1">
          <h3 className={`text-2xl font-bold ${textColorClass}`}>{pkg.fields.packageName}</h3>
          <p className="mt-2 text-lg text-gray-600">{pkg.fields.tagline}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold tracking-tight text-gray-900">{pkg.fields.price}</span>
          </div>
          <ul className="mt-8 space-y-4">
            {pkg.fields.items.map((item, index) => (
              <li key={index} className="flex items-start">
                {item.ValueType === 'icon' ? (
                  <div className="flex-shrink-0 h-6 w-6 text-green-500">
                    <FontAwesomeIcon 
                      icon={findIconDefinition({ prefix: 'fas', iconName: item.Value as any }) || fas.faCheck} 
                      className="h-5 w-5" 
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 h-6 w-6 font-bold text-gray-400">{item.Value}</div>
                )}
                <span 
                  className="ml-3 text-base text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: item.Label.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                  }} 
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <a
            href="#"
            className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get started
          </a>
        </div>
      </div>
    </div>
  </article>
);

export default function ListingContent({ data }: ListingContentProps) {
  console.log('ListingContent received data:', data);

  if (!data || !data.fields) {
    console.log('ListingContent: No data or fields found');
    return null;
  }

  const items = data.fields.items;
  console.log('ListingContent items:', items);

  if (data.contentTypeId === 'listingContent') {
    console.log('ListingContent: Content type is listingContent');
    
    const backgroundClass = data.fields.background === 'Dark' ? 'bg-brand-primary-dark' : 'bg-white';
    const textColorClass = data.fields.background === 'Dark' ? 'text-white' : 'text-gray-900';

    // For testimonials
    if (data.fields.style === 'Testimonial') {
      console.log('ListingContent: Rendering testimonials');
      return (
        <div className={`${backgroundClass} py-24 sm:py-32`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className={`text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
                {data.fields.title}
              </h2>
              {data.fields.subTitle && (
                <p className={`mt-2 text-lg leading-8 ${data.fields.background === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {data.fields.subTitle}
                </p>
              )}
            </div>
            <TestimonialList 
              testimonials={items} 
              style="carousel"
            />
          </div>
        </div>
      );
    }

    // For pricing
    if (data.fields.style === 'Pricing') {
      console.log('ListingContent: Rendering pricing');
      return (
        <div className={`${backgroundClass} py-24 sm:py-32`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className={`text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
                {data.fields.title}
              </h2>
              {data.fields.subTitle && (
                <p className={`mt-2 text-lg leading-8 ${data.fields.background === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {data.fields.subTitle}
                </p>
              )}
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {items.map((pkg) => (
                <PricingItem key={pkg.sys.id} package={pkg} textColorClass={textColorClass} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // For features
    if (data.fields.title.toLowerCase().includes('feature')) {
      console.log('ListingContent: Rendering features');
      return (
        <div className={`${backgroundClass} py-24 sm:py-32`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
            <h2 className={`text-base font-semibold leading-7 ${data.fields.background === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {data.fields.subTitle}
              </h2>
              <p className={`mt-2 text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
                {data.fields.title}
              </p>
            </div>
            <div className="mt-16 space-y-24">
              {items.map((feature: any) => (
                <Feature key={feature.sys.id} data={feature} />
              ))}
            </div>
          </div>
        </div>
      );
    }
  }

  console.log('ListingContent: No matching content type or title found');
  return null;
} 