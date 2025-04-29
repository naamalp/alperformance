'use client';

import Link from 'next/link';

interface CTAProps {
  label: string;
  href: string;
  type: 'Primary' | 'Secondary' | 'Outline' | 'primary' | 'secondary' | 'outline';
}

const styleClasses = {
  Primary: 'rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  Secondary: 'text-sm font-semibold leading-6 text-gray-900',
  Outline: 'rounded-md border border-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  primary: 'rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  secondary: 'text-sm font-semibold leading-6 text-gray-900',
  outline: 'rounded-md border border-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
};

export default function CTA({ label, href, type }: CTAProps) {
  return (
    <Link
      href={href}
      className={styleClasses[type]}
    >
      {label}
    </Link>
  );
} 