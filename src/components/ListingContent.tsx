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
import { getContentfulClient } from '@/lib/contentful';
import { useEffect, useState } from 'react';
import PersonListing from './PersonListing';

// Add all solid icons to the library
library.add(fas);

interface ListingContentProps {
  data: {
    fields: {
      internalName: string;
      title: string;
      subTitle?: string;
      items: Array<CardItem | Package | PersonItem>;
      background?: 'Light' | 'Dark';
      style: 'Card' | 'Pricing';
      contentTypeId: string;
    };
  };
}

interface PersonItem {
  sys: {
    id: string;
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    internalName: string;
    firstName: string;
    lastName: string;
    role: string;
    internal: boolean;
    featured?: boolean;
    linkedIn?: string;
    bio: any;
    image?: {
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
}

interface CardItem {
  sys: {
    id: string;
  };
  fields: {
    internalName: string;
    title: string;
    subTitle?: string;
    description?: any;
    image?: {
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
    featured?: boolean;
  };
}

interface Package {
  sys: {
    id: string;
  };
  fields: {
    internalName: string;
    title: string;
    subTitle?: string;
    description?: any;
    price?: string;
    features?: string[];
    ctaText?: string;
    ctaLink?: string;
    featured?: boolean;
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
  <article className={`flex flex-col items-start ${item.fields.featured ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
    <div className="relative w-full">
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
        {item.fields.image?.fields?.file?.url && (
          <Image
            src={`https:${item.fields.image.fields.file.url}`}
            alt={item.fields.title}
            width={item.fields.image.fields.file.details.image.width}
            height={item.fields.image.fields.file.details.image.height}
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
          {item.fields.subTitle}
        </time>
      </div>
      <div className="group relative">
        <h3 className={`mt-3 text-lg font-semibold leading-6 ${textColorClass} group-hover:text-gray-600`}>
          <span className="absolute inset-0" />
          {item.fields.title}
        </h3>
        <div className="mt-5 text-sm leading-6 text-gray-600">
          {item.fields.description && documentToReactComponents(item.fields.description, options)}
        </div>
      </div>
    </div>
  </article>
);

const PricingItem = ({ package: pkg, textColorClass }: { package: Package; textColorClass: string }) => (
  <div className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${pkg.fields.featured ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
    <div>
      <div className="flex items-center justify-between gap-x-4">
        <h3 className={`text-lg font-semibold leading-8 ${textColorClass}`}>{pkg.fields.title}</h3>
        {pkg.fields.featured && (
          <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
            Most popular
          </p>
        )}
      </div>
      {pkg.fields.subTitle && (
        <p className="mt-4 text-sm leading-6 text-gray-600">{pkg.fields.subTitle}</p>
      )}
      <p className="mt-6 flex items-baseline gap-x-1">
        <span className="text-4xl font-bold tracking-tight text-gray-900">{pkg.fields.price}</span>
      </p>
      <div className="mt-8 text-sm leading-6 text-gray-600">
        {pkg.fields.description && documentToReactComponents(pkg.fields.description, options)}
      </div>
      {pkg.fields.features && pkg.fields.features.length > 0 && (
        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
          {pkg.fields.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <svg className="h-6 w-5 flex-none text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
    {pkg.fields.ctaLink && pkg.fields.ctaText && (
      <a
        href={pkg.fields.ctaLink}
        className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          pkg.fields.featured
            ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600'
            : 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600'
        }`}
      >
        {pkg.fields.ctaText}
      </a>
    )}
  </div>
);

function isPersonItem(item: any): item is PersonItem {
  return (
    item?.fields?.firstName !== undefined &&
    item?.fields?.lastName !== undefined &&
    item?.fields?.role !== undefined
  );
}

export default function ListingContent({ data }: ListingContentProps) {
  // Check if all items are person items
  const allItemsArePersons = data.fields.items?.every(isPersonItem);

  // If all items are persons, render the PersonListing component
  if (allItemsArePersons) {
    const personData = {
      ...data,
      fields: {
        ...data.fields,
        items: data.fields.items as PersonItem[]
      }
    };
    return <PersonListing data={personData} />;
  }

  const backgroundClass = data.fields.background === 'Dark' ? 'bg-brand-primary-dark' : 'bg-white';
  const textColorClass = data.fields.background === 'Dark' ? 'text-white' : 'text-gray-900';

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
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-6">
          {data.fields.items?.map((item) => {
            if ('price' in item.fields) {
              return <PricingItem key={item.sys.id} package={item as Package} textColorClass={textColorClass} />;
            }
            return <CardItemComponent key={item.sys.id} item={item as CardItem} textColorClass={textColorClass} />;
          })}
        </div>
      </div>
    </div>
  );
} 