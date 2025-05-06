'use client';

import Testimonial from './Testimonial';
import TestimonialCarousel from './TestimonialCarousel';

interface TestimonialListProps {
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
  style?: 'default' | 'carousel';
}

export default function TestimonialList({ testimonials, style = 'default' }: TestimonialListProps) {
  if (style === 'carousel') {
    return <TestimonialCarousel testimonials={testimonials} />;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {testimonials
        .filter(testimonial => testimonial.fields.active)
        .map(testimonial => (
          <Testimonial key={testimonial.sys.id} data={testimonial} />
        ))}
    </div>
  );
} 