'use client';

import { ListingDynamicContentType, ServiceContentType } from '@/types/contentful';
import { getContentfulClient } from '@/lib/contentful';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ListingDynamicProps {
  data: ListingDynamicContentType;
}

async function getServices(limit?: number) {
  try {
    console.log('Fetching services with limit:', limit);
    const client = getContentfulClient();
    
    const query = {
      content_type: 'service',
      limit: limit || 8,
      include: 3,
      order: 'fields.order'
    };
    console.log('Contentful query:', query);

    const response = await client.getEntries(query);
    console.log('Contentful response:', {
      total: response.total,
      items: response.items.length,
      firstItemFields: response.items[0]?.fields,
      firstItemSys: response.items[0]?.sys,
      firstItemFeaturedImage: response.items[0]?.fields?.featuredImage
    });

    const sortedItems = response.items.sort((a, b) => {
      const orderA = Number(a.fields.order) || 999;
      const orderB = Number(b.fields.order) || 999;
      return orderA - orderB;
    });

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

export default function ListingDynamic({ data }: ListingDynamicProps) {
  const [services, setServices] = useState<ServiceContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        console.log('Starting to fetch services...');
        const fetchedServices = await getServices(data.fields.limit);
        console.log('Fetched services:', fetchedServices);
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
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          {services.map((service, index) => {
            // Build the URL based on parent relationship
            const url = service.fields.parent
              ? `/services/${service.fields.parent.fields.slug}/${service.fields.slug}`
              : `/services/${service.fields.slug}`;

            // Determine the size and position of each card based on its index
            let positionClasses = '';
            if (services.length === 6) {
              switch (index) {
                case 0: // First service - spans 2 rows
                  positionClasses = 'relative lg:row-span-2';
                  break;
                case 1: // Second service - first row
                  positionClasses = 'relative max-lg:row-start-1';
                  break;
                case 2: // Third service - second row, second column
                  positionClasses = 'relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2';
                  break;
                case 3: // Fourth service - spans 2 rows
                  positionClasses = 'relative lg:row-span-2';
                  break;
                case 4: // Fifth service - 50% width
                  positionClasses = 'relative max-lg:row-start-3 lg:col-start-1 lg:col-span-1';
                  break;
                case 5: // Sixth service - 50% width
                  positionClasses = 'relative max-lg:row-start-3 lg:col-start-2 lg:col-span-2';
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
              index === 0 ? 'lg:rounded-tl-[2rem]' : '',
              index === 3 ? 'lg:rounded-tr-[2rem]' : '',
              index === 4 ? 'lg:rounded-bl-[2rem]' : '',
              index === 5 ? 'lg:rounded-br-[2rem]' : ''
            ].filter(Boolean).join(' ');

            return (
              <div key={service.sys.id} className={positionClasses}>
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
                  <div className={`@container relative w-full grow max-lg:mx-auto max-lg:max-w-sm rounded-[calc(var(--radius-lg)+1px)] rounded-lg bg-white ${roundedClasses}`}>
                    {service.fields.featuredImage?.fields?.image?.fields?.file?.url && (
                      <>
                        <Image
                          src={`https:${service.fields.featuredImage.fields.image.fields.file.url}`}
                          alt={service.fields.featuredImage.fields.altText || service.fields.name}
                          width={service.fields.featuredImage.fields.image.fields.file.details.image.width}
                          height={service.fields.featuredImage.fields.image.fields.file.details.image.height}
                          className="w-full object-contain object-center"
                        />
                      </>
                    )}
                  </div>
                </Link>
                <div className={`pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 ${roundedClasses}`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}