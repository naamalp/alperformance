'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';

interface PartnersCarouselProps {
  partners: Array<{
    sys: {
      id: string;
    };
    fields: {
      internalName: string;
      name: string;
      logo: {
        fields: {
          file: {
            url: string;
            contentType: string;
            details: {
              image: {
                width: number;
                height: number;
              };
            };
          };
        };
      };
      logoLight?: {
        fields: {
          file: {
            url: string;
            contentType: string;
            details: {
              image: {
                width: number;
                height: number;
              };
            };
          };
        };
      };
      url?: string;
    };
  }>;
  title?: string;
  subTitle?: string;
  background?: 'Light' | 'Dark';
}

export default function PartnersCarousel({ partners, title, subTitle, background = 'Light' }: PartnersCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const backgroundClass = background === 'Dark' ? 'bg-brand-primary-dark' : 'bg-white';
  const textColorClass = background === 'Dark' ? 'text-white' : 'text-gray-900';

  // Function to get the appropriate logo based on background
  const getLogo = (partner: PartnersCarouselProps['partners'][0]) => {
    if (background === 'Dark' && partner.fields.logoLight) {
      return partner.fields.logoLight;
    }
    return partner.fields.logo;
  };

  const scrollToPartner = (index: number) => {
    if (!carouselRef.current) return;
    
    // Calculate how many partners to show per view (4 by default)
    const partnersPerView = 4;
    const pageIndex = Math.floor(index / partnersPerView);
    const firstPartnerInPage = pageIndex * partnersPerView;
    
    const partnerElement = carouselRef.current.children[firstPartnerInPage] as HTMLElement;
    if (!partnerElement) return;

    const scrollLeft = partnerElement.offsetLeft - carouselRef.current.offsetLeft;
    carouselRef.current.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
    setActiveIndex(firstPartnerInPage);
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;

    const scrollLeft = carouselRef.current.scrollLeft;
    const partnerWidth = carouselRef.current.children[0]?.clientWidth || 0;
    const gap = 32; // 8 * 4 (gap-8)
    
    // Calculate items per view
    const containerWidth = carouselRef.current.clientWidth;
    const partnersPerView = 4;
    const itemWidth = (partnerWidth + gap);
    
    // Calculate which page we're on
    const pageIndex = Math.floor(scrollLeft / (itemWidth * partnersPerView));
    const newIndex = pageIndex * partnersPerView;
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Calculate number of pages
  const partnersPerView = 4;
  const totalPages = Math.ceil(partners.length / partnersPerView);
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className={`${backgroundClass} py-24 sm:py-32`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || subTitle) && (
          <div className="mx-auto max-w-2xl text-center mb-8">
            {subTitle && (
              <h2 className={`text-base font-semibold leading-7 ${background === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {subTitle}
              </h2>
            )}
            {title && (
              <p className={`mt-2 text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
                {title}
              </p>
            )}
          </div>
        )}
        
        <div 
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-8 px-[--scroll-padding] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [--scroll-padding:max(1.5rem,calc((100vw-(var(--container-2xl)))/2))] lg:[--scroll-padding:max(2rem,calc((100vw-(var(--container-7xl)))/2))]"
        >
          {partners.map((partner) => {
            const logo = getLogo(partner);
            return (
              <div
                key={partner.sys.id}
                className="relative flex flex-col items-center justify-center w-[calc(25%-1.5rem)] min-w-[200px] h-[150px] shrink-0 snap-start scroll-ml-[--scroll-padding] overflow-hidden rounded-lg p-4"
              >
                {logo?.fields?.file?.url && (
                  <a 
                    href={partner.fields.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={`https:${logo.fields.file.url}`}
                      alt={partner.fields.name}
                      width={200}
                      height={100}
                      className="object-contain max-h-[120px] max-w-[180px]"
                      sizes="200px"
                    />
                  </a>
                )}
              </div>
            );
          })}
          
          {/* Spacer for better scrolling experience */}
          <div className="w-2xl shrink-0 sm:w-[54rem]" />
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="hidden sm:flex sm:gap-2">
              {pages.map((pageIndex) => (
                <button
                  key={pageIndex}
                  onClick={() => scrollToPartner(pageIndex * partnersPerView)}
                  aria-label={`View page ${pageIndex + 1} of partners`}
                  className={`size-2.5 rounded-full border border-transparent bg-gray-300 transition hover:bg-gray-400 ${
                    Math.floor(activeIndex / partnersPerView) === pageIndex ? 'bg-gray-400' : ''
                  }`}
                  type="button"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 