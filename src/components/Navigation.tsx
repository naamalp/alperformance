'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NavigationContentType } from '@/types/contentful';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { generateSlugFromReference } from '@/lib/utils';
import CTA from './CTA';

interface NavigationProps {
  data: NavigationContentType | null;
}

export default function Navigation({ data }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout>();
  const pathname = usePathname();

  // Handle null data gracefully
  if (!data || !data.fields) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                AL Performance
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const { fields } = data;
  const { logo, items, cta } = fields;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleDropdownEnter = (itemId: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(itemId);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200); // 200ms delay before closing
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubMenu = (itemId: string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderMenuItem = (item: any, isMobile = false) => {
    const href = item.fields.link?.fields ? `/${generateSlugFromReference(item.fields.link)}` : '/';
    const isActive = pathname === href;
    const hasSubItems = item.fields.items && item.fields.items.length > 0;
    const isSubMenuOpen = openSubMenus[item.sys.id];
    const isDropdownActive = activeDropdown === item.sys.id;

    if (isMobile) {
      return (
        <div key={item.sys.id}>
          <div className="flex items-center justify-between">
            <Link
              href={href}
              className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                isActive
                  ? 'border-brand-primary bg-brand-primary-light/10 text-brand-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={() => !hasSubItems && setIsOpen(false)}
            >
              {item.fields.label}
            </Link>
            {hasSubItems && (
              <button
                onClick={() => toggleSubMenu(item.sys.id)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`h-4 w-4 transform transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
          {hasSubItems && isSubMenuOpen && (
            <div className="pl-4 space-y-1 mt-1 border-l-2 border-gray-200">
              {item.fields.items.map((subItem: any) => {
                const subHref = subItem.fields.link?.fields ? `/${generateSlugFromReference(subItem.fields.link)}` : '/';
                const isSubActive = pathname === subHref;
                
                return (
                  <Link
                    key={subItem.sys.id}
                    href={subHref}
                    className={`block py-2 pl-3 pr-4 text-sm font-medium ${
                      isSubActive
                        ? 'text-brand-primary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
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
    }

    return (
      <div 
        key={item.sys.id} 
        className="relative"
        onMouseEnter={() => handleDropdownEnter(item.sys.id)}
        onMouseLeave={handleDropdownLeave}
      >
        <Link
          href={href}
          className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
            isActive
              ? 'border-b-2 border-brand-primary text-gray-900'
              : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          {item.fields.label}
          {hasSubItems && (
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`ml-1 h-3 w-3 transition-transform ${isDropdownActive ? 'rotate-180' : ''}`}
            />
          )}
        </Link>
        {hasSubItems && (
          <div 
            className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
              isDropdownActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="py-1">
              {item.fields.items.map((subItem: any) => {
                const subHref = subItem.fields.link?.fields ? `/${generateSlugFromReference(subItem.fields.link)}` : '/';
                const isSubActive = pathname === subHref;
                
                return (
                  <Link
                    key={subItem.sys.id}
                    href={subHref}
                    className={`block px-4 py-2 text-sm ${
                      isSubActive
                        ? 'bg-brand-primary-light/10 text-brand-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
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
    <nav className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 ${isScrolled ? 'bg-frosted-glass shadow-md' : 'bg-transparent'} z-[100]`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center relative z-50">
                {logo?.fields?.file?.url ? (
                  <Image
                    src={`https:${logo.fields.file.url}`}
                    alt={logo.fields.title || 'AL Performance Logo'}
                    width={logo.fields.file.details.image.width}
                    height={logo.fields.file.details.image.height}
                    className="h-8 w-auto"
                    priority
                  />
                ) : (
                  <span className="text-2xl font-bold text-brand-primary">
                    {logo?.fields?.title || 'AL Performance'}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8 relative z-50">
            {items?.map(item => renderMenuItem(item))}
            {cta && <CTA data={cta} />}
          </div>
          <div className="-mr-2 flex items-center sm:hidden relative z-50">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <div className="space-y-1 pb-3 pt-2">
            {items?.map(item => renderMenuItem(item, true))}
            {cta && (
              <div className="mt-4 px-3">
                <CTA data={cta} />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 