'use client';

import Link from 'next/link';
import { CTAContentType } from '@/types/contentful';

interface CTAProps {
  data?: CTAContentType;
}

export default function CTA({ data }: CTAProps) {
  if (!data) {
    return null;
  }

  const { fields } = data;
  const { label, link, type = 'Primary' } = fields || {};

  // Extract text from rich text structure
  const labelText = typeof label === 'string' 
    ? label 
    : label?.content?.[0]?.content?.[0]?.value || '';

  const styleClasses = {
    Primary: 'inline-flex items-center justify-center rounded-md bg-brand-primary-light px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-light/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-light',
    Secondary: 'inline-flex items-center justify-center rounded-md border-2 border-brand-primary px-3.5 py-2.5 text-sm font-semibold text-brand-primary shadow-sm hover:bg-brand-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
    Link: 'inline-flex items-center justify-center text-sm font-semibold leading-6 text-brand-primary hover:text-brand-primary/80'
  };

  return (
    <Link
      href={link?.fields?.slug || '/'}
      className={styleClasses[type]}
    >
      {labelText}
    </Link>
  );
} 