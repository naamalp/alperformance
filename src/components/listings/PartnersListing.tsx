'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getContentfulClient } from '@/lib/contentful';

interface PartnersListingProps {
  data: {
    fields: {
      title: string;
      subTitle?: string;
      background?: 'Light' | 'Dark';
      limit?: number;
    };
  };
}

async function getPartners(limit?: number) {
  try {
    const client = getContentfulClient();
    
    const query = {
      content_type: 'partner',
      include: 2,
      order: 'fields.name'
    };

    console.log('Fetching all partners with query:', query);
    const response = await client.delivery.getEntries(query);
    console.log('Partners response:', {
      total: response.total,
      itemsFound: response.items.length,
      firstItem: response.items[0]?.fields
    });

    return response.items;
  } catch (error) {
    console.error('Error fetching partners:', error);
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

export default function PartnersListing({ data }: PartnersListingProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const background = data.fields.background || 'Light';
  const backgroundClass = background === 'Dark' ? 'bg-brand-primary-dark' : 'bg-white';
  const textColorClass = background === 'Dark' ? 'text-white' : 'text-gray-900';

  useEffect(() => {
    async function fetchPartners() {
      try {
        const fetchedPartners = await getPartners(data.fields.limit);
        setPartners(fetchedPartners);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, [data.fields.limit]);

  if (loading) {
    return (
      <div className={`${backgroundClass} py-24 sm:py-32`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className={textColorClass}>Loading partners...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${backgroundClass} py-24 sm:py-32`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading partners: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Function to get the appropriate logo based on background
  const getLogo = (partner: any) => {
    if (background === 'Dark' && partner.fields.logoLight) {
      return partner.fields.logoLight;
    }
    return partner.fields.logo;
  };

  return (
    <div className={`${backgroundClass} py-24 sm:py-32`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          {data.fields.subTitle && (
            <h2 className={`text-base font-semibold leading-7 ${background === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {data.fields.subTitle}
            </h2>
          )}
          {data.fields.title && (
            <p className={`mt-2 text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
              {data.fields.title}
            </p>
          )}
        </div>

        <div className="mx-auto grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {partners.map((partner) => {
            const logo = getLogo(partner);
            return (
              <a
                key={partner.sys.id}
                href={partner.fields.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center"
              >
                <div className="relative h-[150px] w-full flex items-center justify-center p-4 transition-transform duration-300 group-hover:scale-105">
                  {logo?.fields?.file?.url && (
                    <Image
                      src={`https:${logo.fields.file.url}`}
                      alt={partner.fields.name}
                      width={200}
                      height={100}
                      className="object-contain max-h-[120px] max-w-[180px]"
                      sizes="200px"
                    />
                  )}
                </div>
                <p className={`mt-4 text-base font-medium ${textColorClass} text-center group-hover:text-blue-600`}>
                  {partner.fields.name}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
} 