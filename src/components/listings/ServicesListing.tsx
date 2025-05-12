'use client';

import { ListingDynamicContentType } from '@/types/contentful';
import { getContentfulClient } from '@/lib/contentful';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Entry } from 'contentful';

interface ServiceParent {
  fields: {
    name: string;
    slug: string;
    parent?: ServiceParent;
  };
}

interface ServiceContentType {
  sys: {
    id: string;
  };
  fields: {
    name: string;
    slug: string;
    shortDescription?: string;
    parent?: ServiceParent;
    featuredImage?: {
      fields: {
        image: {
          fields: {
            file: {
              url: string;
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

interface ServicesListingProps {
  data: ListingDynamicContentType;
}

async function getServices(limit?: number) {
  try {
    const client = getContentfulClient();
    
    // First, get all services
    const query = {
      content_type: 'service',
      limit: limit || 8,
      include: 2, // Include the immediate parent
      order: 'fields.order'
    };

    console.log('Fetching services with query:', query);
    const response = await client.getEntries(query);
    console.log('Initial services response:', {
      itemsFound: response.items.length,
      firstItem: response.items[0]?.fields
    });

    // For each service, fetch its parent page and its parent's parent
    const servicesWithFullParentChain = await Promise.all(
      response.items.map(async (service) => {
        console.log('Processing service:', {
          name: service.fields.name,
          slug: service.fields.slug,
          hasParent: !!service.fields.parent
        });

        const parent = service.fields.parent as Entry<any> | undefined;
        if (parent) {
          console.log('Fetching parent page:', {
            id: parent.sys.id,
            name: parent.fields.name,
            slug: parent.fields.slug
          });

          // Fetch the parent page
          const parentResponse = await client.getEntries({
            content_type: 'page',
            'sys.id': parent.sys.id,
            include: 2 // Include the parent's parent
          });

          console.log('Parent page response:', {
            itemsFound: parentResponse.items.length,
            firstItem: parentResponse.items[0]?.fields
          });

          if (parentResponse.items.length > 0) {
            // Replace the parent reference with the full parent entry
            service.fields.parent = parentResponse.items[0];
            const updatedParent = service.fields.parent as Entry<any>;
            console.log('Updated service parent:', {
              name: service.fields.name,
              parentName: updatedParent.fields.name,
              parentSlug: updatedParent.fields.slug,
              hasGrandparent: !!updatedParent.fields.pageParent
            });
          }
        }
        return service;
      })
    );

    const sortedItems = servicesWithFullParentChain.sort((a, b) => {
      const orderA = Number(a.fields.order) || 999;
      const orderB = Number(b.fields.order) || 999;
      return orderA - orderB;
    });

    console.log('Final services:', sortedItems.map(service => {
      const parent = service.fields.parent as Entry<any> | undefined;
      const grandparent = parent?.fields?.pageParent as Entry<any> | undefined;
      return {
        name: service.fields.name,
        slug: service.fields.slug,
        parentName: parent?.fields?.name,
        parentSlug: parent?.fields?.slug,
        grandparentName: grandparent?.fields?.name,
        grandparentSlug: grandparent?.fields?.slug
      };
    }));

    return sortedItems as unknown as ServiceContentType[];
  } catch (error) {
    console.error('Error fetching services:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return [];
  }
}

export default function ServicesListing({ data }: ServicesListingProps) {
  const [services, setServices] = useState<ServiceContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const fetchedServices = await getServices(data.fields.limit);
        setServices(fetchedServices);
      } catch (error) {
        console.error('Error in fetchServices:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [data.fields.limit]);

  if (loading) {
    return (
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading services: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">No services found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base/7 font-semibold text-indigo-600">{data.fields.title}</h2>
        {data.fields.subTitle && (
          <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            {data.fields.subTitle}
          </p>
        )}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          {services.map((service, index) => {
            // Build the URL based on nested parent relationships
            let url = '';
            let currentParent = service.fields.parent;
            const slugs: string[] = [service.fields.slug];

            // Add all parent slugs in order
            while (currentParent?.fields?.slug) {
              slugs.unshift(currentParent.fields.slug);
              // For pages, use pageParent to get the next parent
              currentParent = currentParent.fields.pageParent;
            }

            url = `/${slugs.join('/')}`;

            // Determine the size and position of each card based on its index
            let positionClasses = '';
            if (services.length === 6) {
              switch (index) {
                case 0: // First service - spans 2 rows
                  positionClasses = 'relative lg:row-span-2';
                  break;
                case 1: // Second service - first row
                  positionClasses = 'relative';
                  break;
                case 2: // Third service - second row, second column
                  positionClasses = 'relative lg:col-start-2 lg:row-start-2';
                  break;
                case 3: // Fourth service - spans 2 rows
                  positionClasses = 'relative lg:row-span-2';
                  break;
                case 4: // Fifth service - 50% width
                  positionClasses = 'relative lg:col-start-1 lg:col-span-1';
                  break;
                case 5: // Sixth service - 50% width
                  positionClasses = 'relative lg:col-start-2 lg:col-span-2';
                  break;
              }
            } else {
              // Fallback for other numbers of services
              const isFirst = index === 0;
              const isLast = index === services.length - 1;
              positionClasses = isFirst || isLast ? 'relative lg:row-span-2' : 'relative';
            }
            
            // Calculate border radius classes
            const roundedClasses = [
              // Mobile border radius
              index === 0 ? 'max-lg:rounded-t-[2rem]' : '',
              index === 5 ? 'max-lg:rounded-b-[2rem]' : '',
              // Desktop border radius
              index === 0 ? 'lg:rounded-tl-[2rem]' : '',
              index === 3 ? 'lg:rounded-tr-[2rem]' : '',
              index === 4 ? 'lg:rounded-bl-[2rem]' : '',
              index === 5 ? 'lg:rounded-br-[2rem]' : ''
            ].filter(Boolean).join(' ');

            return (
              <div key={service.sys.id} className={`${positionClasses} w-full`}>
                <div className={`absolute inset-px rounded-lg bg-white ${roundedClasses}`}></div>
                <Link
                  href={url}
                  className={`relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] rounded-lg bg-white ${roundedClasses}`}
                >
                  <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                    <h3 className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                      {service.fields.name}
                    </h3>
                    {service.fields.shortDescription && (
                      <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                        {service.fields.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className={`@container relative w-full grow max-lg:mx-auto max-lg:max-w-full rounded-[calc(var(--radius-lg)+1px)] rounded-lg bg-white flex flex-col justify-end ${roundedClasses}`}>
                    {service.fields.featuredImage?.fields?.image?.fields?.file?.url && (
                      <div className="flex flex-col justify-end h-full">
                        <Image
                          src={`https:${service.fields.featuredImage.fields.image.fields.file.url}`}
                          alt={service.fields.featuredImage.fields.altText || service.fields.name}
                          width={service.fields.featuredImage.fields.image.fields.file.details.image.width}
                          height={service.fields.featuredImage.fields.image.fields.file.details.image.height}
                          className={`w-full object-contain object-bottom ${roundedClasses}`}
                        />
                      </div>
                    )}
                  </div>
                  <div className={`pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 ${roundedClasses}`}></div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 