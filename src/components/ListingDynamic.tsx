'use client';

import { ListingDynamicContentType, ServiceContentType } from '@/types/contentful';
import { getContentfulClient } from '@/lib/contentful';
import Link from 'next/link';
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
      include: 3
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

    return response.items as unknown as ServiceContentType[];
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-red-600">Error loading services: {error}</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">No services found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">{data.fields.title}</h2>
        {data.fields.subTitle && (
          <p className="mt-4 text-xl text-gray-600">{data.fields.subTitle}</p>
        )}
      </div>

      <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
        {services.map((service, index) => {
          // Build the URL based on parent relationship
          const url = service.fields.parent
            ? `/services/${service.fields.parent.fields.slug}/${service.fields.slug}`
            : `/services/${service.fields.slug}`;

          // Determine the size of each card based on its position
          const isLarge = index % 5 === 0; // First card and every 5th card
          const isMedium = index % 3 === 0; // Every 3rd card
          
          return (
            <div key={service.sys.id} className={`relative ${
              isLarge ? 'lg:row-span-2' : 
              isMedium ? 'max-lg:row-start-1 lg:col-start-2 lg:row-start-2' : 
              'max-lg:row-start-3'
            }`}>
              <div className={`absolute inset-px rounded-lg bg-white ${
                isLarge ? 'lg:rounded-l-[2rem]' : 
                isMedium ? 'max-lg:rounded-t-[2rem]' : 
                ''
              }`}></div>
              <Link
                href={url}
                className={`relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] ${
                  isLarge ? 'lg:rounded-l-[calc(2rem+1px)]' : 
                  isMedium ? 'max-lg:rounded-t-[calc(2rem+1px)]' : 
                  ''
                }`}
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
                {isLarge && (
                  <div className="@container relative min-h-[30rem] w-full grow max-lg:mx-auto max-lg:max-w-sm">
                      {service.fields.featuredImage?.fields?.image?.fields?.file?.url && (
                        <>
                          <img
                            src={`https:${service.fields.featuredImage.fields.image.fields.file.url}`}
                            alt={service.fields.featuredImage.fields.altText || service.fields.name}
                            className="size-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        </>
                      )}
                    </div>
                )}
              </Link>
              <div className={`pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 ${
                isLarge ? 'lg:rounded-l-[2rem]' : 
                isMedium ? 'max-lg:rounded-t-[2rem]' : 
                ''
              }`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 