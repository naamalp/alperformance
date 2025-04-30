'use client';

import Link from 'next/link';

interface CTAProps {
  label: string | { content: Array<{ content: Array<{ value: string }> }> };
  href: string;
  type: 'Primary' | 'Secondary' | 'Link';
}

const styleClasses = {
  Primary: 'inline-flex items-center justify-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  Secondary: 'inline-flex items-center justify-center rounded-md border border-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  Link: 'inline-flex items-center justify-center text-sm font-semibold leading-6 text-gray-900'
};

export default function CTA({ label, href, type }: CTAProps) {
  // Extract text from rich text structure if needed
  const labelText = typeof label === 'string' 
    ? label 
    : label?.content?.[0]?.content?.[0]?.value || '';

  return (
    <Link
      href={href}
      className={styleClasses[type]}
    >
      {labelText}
    </Link>
  );
} 