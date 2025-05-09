'use client';

import { ListingDynamicContentType } from '@/types/contentful';
import { getContentfulClient } from '@/lib/contentful';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface TestimonialContentType {
  sys: {
    id: string;
  };
  fields: {
    name: string;
    role: string;
    organisation: string;
    personImage?: {
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
    organisationImage?: {
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
    quote: {
      content: Array<{
        content: Array<{
          value: string;
        }>;
      }>;
    };
  };
}

interface TestimonialsListingProps {
  data: ListingDynamicContentType;
}

async function getTestimonials() {
  try {
    const client = getContentfulClient();
    
    const query = {
      content_type: 'testimonial',
      include: 3,
      order: 'fields.name'
    };

    const response = await client.getEntries(query);
    return response.items as unknown as TestimonialContentType[];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
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

export default function TestimonialsListing({ data }: TestimonialsListingProps) {
  const [testimonials, setTestimonials] = useState<TestimonialContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = data.fields.limit || 8;

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const fetchedTestimonials = await getTestimonials();
        setTestimonials(fetchedTestimonials);
      } catch (error) {
        console.error('Error in fetchTestimonials:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  const paginate = (items: TestimonialContentType[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Loading testimonials...</p>
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
            <p className="text-red-600">Error loading testimonials: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">No testimonials found.</p>
          </div>
        </div>
      </div>
    );
  }

  const paginatedTestimonials = data.fields.pagination ? paginate(testimonials) : testimonials;

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base/7 font-semibold text-indigo-600">{data.fields.title}</h2>
        {data.fields.subTitle && (
          <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            {data.fields.subTitle}
          </p>
        )}
        <div className="mt-16 space-y-8 sm:mt-20">
          {paginatedTestimonials.map((testimonial) => (
            <div key={testimonial.sys.id} className="relative flex flex-col md:flex-row rounded-2xl bg-gray-900 overflow-hidden">
              {/* Image Section */}
              <div className="relative w-full md:w-1/3 aspect-square">
                {(testimonial.fields.personImage?.fields?.file?.url || testimonial.fields.organisationImage?.fields?.file?.url) && (
                  <div className={`relative h-full w-full ${!testimonial.fields.personImage?.fields?.file?.url && testimonial.fields.organisationImage?.fields?.file?.url ? 'p-5' : ''}`}>
                    <Image
                      src={`https:${testimonial.fields.personImage?.fields?.file?.url || testimonial.fields.organisationImage?.fields?.file?.url}`}
                      alt={testimonial.fields.name}
                      width={testimonial.fields.personImage?.fields?.file?.details?.image?.width || testimonial.fields.organisationImage?.fields?.file?.details?.image?.width || 800}
                      height={testimonial.fields.personImage?.fields?.file?.details?.image?.height || testimonial.fields.organisationImage?.fields?.file?.details?.image?.height || 800}
                      className={`w-full ${testimonial.fields.personImage?.fields?.file?.url ? 'object-contain object-top-left' : 'h-full object-contain'}`}
                    />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="relative flex-1 p-8">
                <div className="relative">
                  <svg className="absolute -top-6 -left-2 h-16 w-16 text-indigo-500/20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="relative mt-6 text-lg font-semibold leading-8 text-white">
                    {testimonial.fields.quote.content.map((paragraph, i) => (
                      <span key={i}>
                        {paragraph.content.map((text, j) => text.value).join('')}
                        {i < testimonial.fields.quote.content.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-x-4">
                  <div className="h-12 w-12 flex-none rounded-full bg-gray-800">
                    {(testimonial.fields.personImage?.fields?.file?.url || testimonial.fields.organisationImage?.fields?.file?.url) && (
                      <Image
                        src={`https:${testimonial.fields.organisationImage?.fields?.file?.url}`}
                        alt={testimonial.fields.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-contain"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.fields.name}</div>
                    <div className="bg-gradient-to-r from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] bg-clip-text text-transparent">
                      {testimonial.fields.role}
                      {testimonial.fields.organisation && ` at ${testimonial.fields.organisation}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.fields.pagination && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 