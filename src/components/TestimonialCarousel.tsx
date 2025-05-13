'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import { useState, useRef } from 'react';

interface TestimonialCarouselProps {
  testimonials: Array<{
    sys: {
      id: string;
      type: string;
      linkType: string;
    };
    fields: {
      internalName: string;
      active: boolean;
      name: string;
      role?: string;
      personImage?: {
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
      organisation?: string;
      organisationImage?: {
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
      rating?: number;
      quote?: any;
    };
  }>;
}

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return <p className="relative text-xl/7 text-white">{children}</p>;
    },
  },
};

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const activeTestimonials = testimonials.filter(testimonial => testimonial.fields.active);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  console.log('Testimonials data:', activeTestimonials.map(t => ({
    id: t.sys.id,
    name: t.fields.name,
    imageUrl: t.fields.personImage?.fields?.file?.url
  })));

  const toggleExpand = (id: string) => {
    setExpandedTestimonials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToTestimonial = (index: number) => {
    if (!carouselRef.current) return;
    
    const testimonial = carouselRef.current.children[index] as HTMLElement;
    if (!testimonial) return;

    const scrollLeft = testimonial.offsetLeft - carouselRef.current.offsetLeft;
    carouselRef.current.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;

    const scrollLeft = carouselRef.current.scrollLeft;
    const testimonialWidth = carouselRef.current.children[0]?.clientWidth || 0;
    const gap = 32; // 8 * 4 (gap-8)
    
    const newIndex = Math.round(scrollLeft / (testimonialWidth + gap));
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="mt-16 mx-auto max-w-7xl pl-6 pr-0 lg:px-8">
      <div 
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex gap-8 px-[--scroll-padding] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [--scroll-padding:max(1.5rem,calc((100vw-(var(--container-2xl)))/2))] lg:[--scroll-padding:max(2rem,calc((100vw-(var(--container-7xl)))/2))]"
      >
        {activeTestimonials.map((testimonial) => (
          <div
            key={testimonial.sys.id}
            className="relative flex flex-col items-start w-[calc(33.333%-1.5rem)] min-w-[300px] shrink-0 snap-start scroll-ml-[--scroll-padding] overflow-hidden rounded-3xl"
          >
            {testimonial.fields.personImage?.fields?.file?.url && (
              <div className="relative h-[400px] w-[400px] mx-auto bg-gray-900">
                <Image
                  src={`https:${testimonial.fields.personImage.fields.file.url}`}
                  alt={testimonial.fields.name}
                  fill
                  className="object-contain"
                  sizes="400px"
                />
              </div>
            )}
            
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black from-[calc(7/16*100%)] ring-1 ring-gray-950/10 ring-inset sm:from-25%"
            />
            
            <figure className="relative flex flex-col flex-1 p-10 bg-gradient-to-t from-black from-[calc(7/16*100%)] to-[#051D40]">
              <div className={`relative flex-1 transition-all duration-300 ${expandedTestimonials[testimonial.sys.id] ? 'max-h-none' : 'max-h-[400px] overflow-hidden'}`}>
                <blockquote>
                  {testimonial.fields.quote && (
                    <div className="relative">
                      <span aria-hidden="true" className="absolute -translate-x-full">"</span>
                      {documentToReactComponents(testimonial.fields.quote, options)}
                      <span aria-hidden="true" className="absolute">"</span>
                    </div>
                  )}
                </blockquote>
                
                {!expandedTestimonials[testimonial.sys.id] && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                )}
              </div>
              
              <button
                onClick={() => toggleExpand(testimonial.sys.id)}
                className="mt-4 text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
              >
                {expandedTestimonials[testimonial.sys.id] ? 'Show Less' : 'Read More'}
              </button>

              <div className="mt-6 border-t border-white/20 pt-6">
                <figcaption>
                  <p className="text-sm/6 font-medium text-white">{testimonial.fields.name}</p>
                  {(testimonial.fields.role || testimonial.fields.organisation) && (
                    <p className="text-sm/6 font-medium">
                      <span className="bg-gradient-to-r from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] bg-clip-text text-transparent">
                        {[testimonial.fields.role, testimonial.fields.organisation]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </p>
                  )}
                </figcaption>
              </div>
            </figure>
          </div>
        ))}
        
        {/* Spacer for better scrolling experience */}
        <div className="w-2xl shrink-0 sm:w-[54rem]" />
      </div>

      <div className="flex justify-end mt-8">
        <div className="hidden sm:flex sm:gap-2">
          {activeTestimonials.map((testimonial, index) => (
            <button
              key={testimonial.sys.id}
              onClick={() => scrollToTestimonial(index)}
              aria-label={`Scroll to testimonial from ${testimonial.fields.name}`}
              className={`size-2.5 rounded-full border border-transparent bg-gray-300 transition hover:bg-gray-400 ${
                index === activeIndex ? 'bg-gray-400' : ''
              }`}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}