'use client';

import { useEffect, useState } from 'react';
import { getContentfulClient } from '@/lib/contentful';
import Link from 'next/link';
import Image from 'next/image';
import { NavigationContentType } from '@/types/contentful';

export default function Footer() {
  const [footerContent, setFooterContent] = useState<NavigationContentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFooterContent() {
      try {
        const client = getContentfulClient();
        const response = await client.getEntry('7FMIdPlW6GP9JdFGBZcKlM', {
          include: 2 // Include 2 levels of linked entries
        });
        setFooterContent(response as unknown as NavigationContentType);
      } catch (err) {
        console.error('Error fetching footer content:', err);
        setError('Failed to load footer content');
      } finally {
        setLoading(false);
      }
    }

    fetchFooterContent();
  }, []);

  if (loading) {
    return (
      <footer className="bg-brand-primary-dark">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="text-center text-gray-300">Loading footer...</div>
        </div>
      </footer>
    );
  }

  if (error || !footerContent) {
    return (
      <footer className="bg-brand-primary-dark">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="text-center text-red-500">{error || 'Footer content not available'}</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-brand-primary-dark">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex flex-col md:items-center md:justify-between lg:px-8">
      <div className="flex items-center justify-center space-x-4 my-4">
            {footerContent.fields.logo?.fields?.file?.url && (
              <Image
                src={`https:${footerContent.fields.logo.fields.file.url}`}
                alt={footerContent.fields.logo.fields.title}
                width={footerContent.fields.logo.fields.file.details.image.width}
                height={footerContent.fields.logo.fields.file.details.image.height}
                className="h-8 w-auto"
              />
            )}
        </div>
        <div className="flex justify-center space-x-6 my-4">
          {footerContent.fields.items?.map((item) => {
            const link = item.fields.link;
            if (!link || !link.fields) {
              console.warn('No link found for item:', item);
              return null;
            }
            return (
              <Link
                key={item.sys.id}
                href={`/${link.fields.slug}`}
                className="text-gray-400 hover:text-gray-300"
              >
                {item.fields.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-8 md:mt-0 my-4">
            <p className="text-center text-xs leading-5 text-gray-400">
              © {new Date().getFullYear()} AL Performance. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
} 