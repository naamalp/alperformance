'use client';

import Link from 'next/link';
import { CTAContentType } from '@/types/contentful';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition, library, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { generateSlugFromReference } from '@/lib/utils';

// Add all icons to the library
library.add(fas, far, fab);

interface CTAProps {
  data?: CTAContentType;
}

export default function CTA({ data }: CTAProps) {
  if (!data) {
    return null;
  }

  const { fields } = data;
  const { label, link, type = 'Primary', icon, iconPosition = 'Left' } = fields || {};

  // Extract text from rich text structure
  const labelText = typeof label === 'string' 
    ? label 
    : label?.content?.[0]?.content?.[0]?.value || '';

  const styleClasses = {
    Primary: 'inline-flex items-center justify-center rounded-md bg-brand-primary-light px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-light/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-light',
    Secondary: 'inline-flex items-center justify-center rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-light',
    Link: 'inline-flex items-center justify-center text-sm font-semibold leading-6 text-brand-primary hover:text-brand-primary/80'
  };
  
  // Skip icon if value is 'None'
  if (icon === 'None') {
    return (
      <Link
        href={link?.fields ? `/${generateSlugFromReference(link)}` : '/'}
        className={styleClasses[type]}
      >
        {labelText}
      </Link>
    );
  }
  
  // Remove 'fa-' prefix if present and convert to camelCase
  const iconName = icon?.replace('fa-', '') || '';
  
  const iconDefinition = iconName 
    ? findIconDefinition({ prefix: 'fas', iconName: iconName as any }) || fas.faArrowRight
    : null;

  return (
    <Link
      href={link?.fields ? `/${generateSlugFromReference(link)}` : '/'}
      className={styleClasses[type]}
    >
      {iconDefinition && iconPosition === 'Left' && (
        <FontAwesomeIcon 
          icon={iconDefinition} 
          className="mr-2 h-4 w-4" 
        />
      )}
      {labelText}
      {iconDefinition && iconPosition === 'Right' && (
        <FontAwesomeIcon 
          icon={iconDefinition} 
          className="ml-2 h-4 w-4" 
        />
      )}
    </Link>
  );
} 