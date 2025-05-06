'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import Image from 'next/image';

interface TestimonialProps {
  data: {
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
  };
}

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return <p className="text-gray-600">{children}</p>;
    },
    [BLOCKS.QUOTE]: (node: any, children: any) => {
      return <blockquote className="border-l-4 border-blue-500 pl-4 italic">{children}</blockquote>;
    },
    [BLOCKS.UL_LIST]: (node: any, children: any) => {
      return <ul className="list-disc list-inside mt-4 space-y-2">{children}</ul>;
    },
    [BLOCKS.OL_LIST]: (node: any, children: any) => {
      return <ol className="list-decimal list-inside mt-4 space-y-2">{children}</ol>;
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      return (
        <a href={node.data.uri} className="text-blue-600 hover:text-blue-800 underline">
          {children}
        </a>
      );
    },
  },
  renderMark: {
    bold: (text: React.ReactNode) => <strong>{text}</strong>,
    italic: (text: React.ReactNode) => <em>{text}</em>,
    underline: (text: React.ReactNode) => <u>{text}</u>,
    strikethrough: (text: React.ReactNode) => <s>{text}</s>,
  },
};

export default function Testimonial({ data }: TestimonialProps) {
  if (!data.fields.active) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      {data.fields.quote && (
        <div className="mb-6">
          {documentToReactComponents(data.fields.quote, options)}
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {data.fields.personImage && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={`https:${data.fields.personImage.fields.file.url}`}
              alt={data.fields.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{data.fields.name}</h3>
              {data.fields.role && (
                <p className="text-sm text-gray-600">{data.fields.role}</p>
              )}
            </div>
            
            {data.fields.organisationImage && (
              <div className="relative w-12 h-12">
                <Image
                  src={`https:${data.fields.organisationImage.fields.file.url}`}
                  alt={data.fields.organisation || 'Organization logo'}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
          
          {data.fields.organisation && (
            <p className="text-sm text-gray-500 mt-1">{data.fields.organisation}</p>
          )}
          
          {data.fields.rating && (
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-4 h-4 ${
                    index < data.fields.rating! ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 