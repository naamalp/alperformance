'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NavigationContentType } from '@/types/contentful';

interface NavigationProps {
  data: NavigationContentType | null;
}

export default function Navigation({ data }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!data?.fields) {
    return (
      <nav className="fixed w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  const { logo, items } = data.fields;

  const getPageUrl = (link: NavigationContentType['fields']['items'][0]['fields']['link']) => {
    // If no link or fields, return home
    if (!link?.fields?.slug) return '/';
    
    // For regular pages, just use their slug
    return `/${link.fields.slug}`;
  };

  const renderMenuItem = (item: NavigationContentType['fields']['items'][0]) => {
    // Skip if item or fields is missing
    if (!item?.fields) return null;
    
    const hasSubItems = item.fields.items && item.fields.items.length > 0;
    const pageUrl = getPageUrl(item.fields.link);
    
    return (
      <div key={item.sys.id} className="relative group">
        <Link
          href={pageUrl}
          className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
        >
          {item.fields.label}
        </Link>
        {hasSubItems && (
          <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
            <div className="py-1">
              {item.fields.items?.map((subItem) => {
                // Skip if subItem or fields is missing
                if (!subItem?.fields?.link) return null;
                
                const subPageUrl = getPageUrl(subItem.fields.link);
                return (
                  <Link
                    key={subItem.sys.id}
                    href={subPageUrl}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {subItem.fields.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {logo?.fields?.file?.url && (
                <Image
                  src={`https:${logo.fields.file.url}`}
                  alt={logo.fields.title || 'AL Performance Logo'}
                  width={logo.fields.file.details.image.width}
                  height={logo.fields.file.details.image.height}
                  className="h-8 w-auto"
                  priority
                />
              )}
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {items?.map(renderMenuItem)}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:hidden`} role="dialog" aria-modal="true">
        {/* Background backdrop */}
        <div className="fixed inset-0 z-50 bg-gray-900/80" onClick={() => setIsOpen(false)}></div>
        
        {/* Mobile menu panel */}
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">AL Performance</span>
              {logo?.fields?.file?.url && (
                <Image
                  src={`https:${logo.fields.file.url}`}
                  alt={logo.fields.title || 'AL Performance Logo'}
                  width={logo.fields.file.details.image.width}
                  height={logo.fields.file.details.image.height}
                  className="h-8 w-auto"
                  priority
                />
              )}
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {items?.map((item) => {
                  if (!item?.fields) return null;
                  
                  const pageUrl = getPageUrl(item.fields.link);
                  return (
                    <div key={item.sys.id}>
                      <Link
                        href={pageUrl}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.fields.label}
                      </Link>
                      {item.fields.items && item.fields.items.length > 0 && (
                        <div className="pl-4 space-y-2">
                          {item.fields.items.map((subItem) => {
                            if (!subItem?.fields?.link) return null;
                            
                            const subPageUrl = getPageUrl(subItem.fields.link);
                            return (
                              <Link
                                key={subItem.sys.id}
                                href={subPageUrl}
                                className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.fields.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 