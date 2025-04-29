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
    if (!link) return '/';
    
    // If the link is to a service with a parent, include the parent's slug
    if (link.sys.contentType.sys.id === 'service' && link.fields.parent) {
      return `/${link.fields.parent.fields.slug}/${link.fields.slug}`;
    }
    
    // For regular pages, just use their slug
    return `/${link.fields.slug}`;
  };

  const renderMenuItem = (item: NavigationContentType['fields']['items'][0]) => {
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
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          {items?.map((item) => {
            const pageUrl = getPageUrl(item.fields.link);
            return (
              <div key={item.sys.id}>
                <Link
                  href={pageUrl}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.fields.label}
                </Link>
                {item.fields.items && item.fields.items.length > 0 && (
                  <div className="pl-4">
                    {item.fields.items.map((subItem) => {
                      const subPageUrl = getPageUrl(subItem.fields.link);
                      return (
                        <Link
                          key={subItem.sys.id}
                          href={subPageUrl}
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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
    </nav>
  );
} 