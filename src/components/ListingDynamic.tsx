'use client';

import { ListingDynamicContentType } from '@/types/contentful';
import { useEffect, useState } from 'react';
import ServicesListing from './listings/ServicesListing';
import TestimonialsListing from './listings/TestimonialsListing';

interface ListingDynamicProps {
  data: ListingDynamicContentType;
}

export default function ListingDynamic({ data }: ListingDynamicProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
      ) : (
        <ServicesListing data={data} />
      )}
    </>
  );
}