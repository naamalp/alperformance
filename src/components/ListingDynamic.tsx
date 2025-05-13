'use client';

import { ListingDynamicContentType } from '@/types/contentful';
import { useEffect, useState } from 'react';
import ServicesListing from './listings/ServicesListing';
import TestimonialsListing from './listings/TestimonialsListing';
import ListingContent from './ListingContent';
import { getContentfulClient } from '@/lib/contentful';

interface ListingDynamicProps {
  data: ListingDynamicContentType;
}

async function getPackages(limit?: number) {
  try {
    const client = getContentfulClient();
    
    const query = {
      content_type: 'package',
      limit: limit || 8,
      include: 2,
      order: 'fields.order'
    };

    console.log('Fetching packages with query:', query);
    const response = await client.delivery.getEntries(query);
    console.log('Packages response:', {
      itemsFound: response.items.length,
      firstItem: response.items[0]?.fields
    });

    return response.items;
  } catch (error) {
    console.error('Error fetching packages:', error);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchContent() {
      try {
        if (data.fields.listingContent === 'Packages') {
          const fetchedPackages = await getPackages(data.fields.limit);
          setPackages(fetchedPackages);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      fetchContent();
    }, 500);

    return () => clearTimeout(timer);
  }, [data.fields.listingContent, data.fields.limit]);

  if (loading) {
    return (
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Loading content...</p>
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
            <p className="text-red-600">Error loading content: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {data.fields.listingContent === 'Testimonials' ? (
        <TestimonialsListing data={data} />
      ) : data.fields.listingContent === 'Services' ? (
        <ServicesListing data={data} />
      ) : data.fields.listingContent === 'Packages' ? (
        <ListingContent data={{
          fields: {
            internalName: 'Packages',
            title: data.fields.title,
            subTitle: data.fields.subTitle,
            items: packages,
            background: 'Light',
            style: 'Pricing',
            contentTypeId: 'package'
          }
        }} />
      ) : null}
    </>
  );
}