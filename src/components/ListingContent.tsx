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
import PartnersCarousel from './PartnersCarousel';
import parse from 'html-react-parser';
import { generateSlugFromReference } from '@/lib/utils';

// Add all solid icons to the library
library.add(fas);

interface ListingContentProps {
  data: {
    fields: {
      internalName: string;
      title: string;
      subTitle?: string;
      items: Array<CardItem | Package | PersonItem | Partner | PageItem>;
      background?: 'Light' | 'Dark';
      style: 'Card' | 'Pricing' | 'Testimonial' | 'Partner';
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
    image?: any;
  };
}

interface Partner {
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
    name: string;
    logo: {
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
    website?: string;
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
    packageName: string;
    tagline: string;
    price: string;
    items: Array<{
      Label: string;
      ValueType: 'text' | 'icon';
      Value: string;
    }>;
    featured?: boolean;
  };
}

interface PageItem {
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
    pageTitle: string;
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
    slug: string;
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

function isPageItem(item: any): item is PageItem {
  return (
    item?.sys?.contentType?.sys?.id === 'page' &&
    item?.fields?.slug !== undefined
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

const PricingItem = ({ package: pkg, textColorClass }: { package: Package; textColorClass: string }) => {
  // Helper function to safely parse HTML content
  const parseHtmlContent = (content: string) => {
    try {
      // First, decode any HTML entities
      const decodedContent = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      return parse(decodedContent);
    } catch (error) {
      console.error('Error parsing HTML content:', error);
      return content;
    }
  };

  return (
    <div className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${pkg.fields.featured ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
      <div>
        <div className="flex items-center justify-between gap-x-4">
          <h3 className="text-lg font-semibold text-blue-600 leading-8">{pkg.fields.packageName}</h3>
          {pkg.fields.featured && (
            <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
              Most popular
            </p>
          )}
        </div>
        {pkg.fields.tagline && (
          <p className="mt-4 text-sm leading-6 text-gray-600">{pkg.fields.tagline}</p>
        )}
        {pkg.fields.items && pkg.fields.items.length > 0 && (
          <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
            {pkg.fields.items.map((item) => (
              <li key={item.Label} className="flex gap-x-3">
                {item.ValueType === 'icon' ? (
                  <svg className="h-6 w-5 flex-none text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : null}
                <span className="flex items-center gap-x-1">
                  {item.ValueType === 'text' ? (
                    <>
                      {item.Value && (
                        <span className="text-gray-500">
                          {parseHtmlContent(item.Value)}
                        </span>
                      )}
                      <span className="font-medium">{parseHtmlContent(item.Label)}</span>
                    </>
                  ) : (
                    parseHtmlContent(item.Label)
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-8">
        <a
          href="/contact"
          className="block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Get Started
        </a>
      </div>
    </div>
  );
};

// Helper function to check if an item is a person
function isPersonItem(item: any): item is PersonItem {
  return (
    item?.fields?.firstName !== undefined &&
    item?.fields?.lastName !== undefined &&
    item?.fields?.role !== undefined
  );
}

// Helper function to check if an item is a partner
function isPartnerItem(item: any): item is Partner {
  return (
    item?.fields?.name !== undefined &&
    item?.fields?.logo !== undefined
  );
}

const PageCardComponent = ({ item, textColorClass }: { item: PageItem; textColorClass: string }) => (
  <article className="flex flex-col items-start lg:col-span-2">
    <div className="max-w-xl">
      <div className="group relative">
        <h3 className={`text-xl font-semibold leading-7 ${textColorClass} group-hover:text-gray-600`}>
          <span className="absolute inset-0" />
          {item.fields.pageTitle}
        </h3>
        {item.fields.subTitle && (
          <p className="mt-2 text-base leading-7 text-gray-600">
            {item.fields.subTitle}
          </p>
        )}
        {item.fields.description && (
          <div className="mt-4 text-sm leading-6 text-gray-600">
            {documentToReactComponents(item.fields.description, options)}
          </div>
        )}
      </div>
      <div className="mt-6">
        <a
          href={`/${generateSlugFromReference(item)}`}
          className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500"
        >
          Learn more <FontAwesomeIcon icon={fas.faArrowRight} className="ml-1" />
        </a>
      </div>
    </div>
  </article>
);

export default function ListingContent({ data }: ListingContentProps) {
  // Check if all items are person items
  const allItemsArePersons = data.fields.items?.every(isPersonItem);

  // If all items are persons, render the PersonListing component
  if (allItemsArePersons) {
    const personItems = data.fields.items.filter(isPersonItem);
    // Add a new function to try different ways of getting the image
    const transformPersonImage = (image: any) => {
      // Case 1: image is an object with fields.file
      if (image?.fields?.file) {
        return {
          fields: {
            file: image.fields.file
          }
        };
      }
      
      // Default: can't handle this case
      return undefined;
    };
    
    const personData = {
      ...data,
      fields: {
        ...data.fields,
        items: personItems.map(item => ({
          ...item,
          fields: {
            ...item.fields,
            image: item.fields.image ? transformPersonImage(item.fields.image) : undefined
          }
        }))
      }
    };
    
    return <PersonListing data={personData} />;
  }

  // Check if this is a partners listing (either by style or by content type)
  const isPartners = data.fields.style === 'Partner' || 
    (data.fields.items && data.fields.items.length > 0 && 
     'contentType' in data.fields.items[0].sys && 
     data.fields.items[0].sys.contentType?.sys?.id === 'partner');
  
  if (isPartners) {
    const partnerItems = data.fields.items.filter(isPartnerItem);
    return (
      <PartnersCarousel 
        partners={partnerItems} 
        title={data.fields.title} 
        subTitle={data.fields.subTitle} 
        background={data.fields.background}
      />
    );
  }

  // Check if this is a testimonials listing
  const isTestimonials = data.fields.style === 'Testimonial';
  if (isTestimonials) {
    // Transform the testimonial data to match the expected structure
    const transformedTestimonials = data.fields.items.map((item: any) => ({
      sys: {
        id: item.sys.id,
        type: item.sys.type,
        linkType: item.sys.linkType
      },
      fields: {
        internalName: item.fields.internalName,
        active: item.fields.active,
        name: item.fields.name,
        role: item.fields.role,
        personImage: item.fields.personImage,
        organisation: item.fields.organisation,
        organisationImage: item.fields.organisationImage,
        rating: item.fields.rating,
        quote: item.fields.quote
      }
    }));
    return <TestimonialList testimonials={transformedTestimonials} style="carousel" />;
  }

  // Check if all items are pages
  const allItemsArePages = data.fields.items?.every(isPageItem);
  if (allItemsArePages) {
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
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-6 lg:pl-8">
            {data.fields.items?.map((item) => (
              <PageCardComponent key={item.sys.id} item={item as PageItem} textColorClass={textColorClass} />
            ))}
          </div>
        </div>
      </div>
    );
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
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-6 lg:pl-8">
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