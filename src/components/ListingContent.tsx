'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import { FeatureContentType } from '@/types/contentful';

interface ListingContentProps {
  data: FeatureContentType | null;
}

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return <p className="mt-4 text-base leading-7 text-gray-600">{children}</p>;
    },
  },
};

export default function ListingContent({ data }: ListingContentProps) {
  if (!data || !data.fields) {
    return null;
  }

  const backgroundClass = data.fields.background === 'Dark' ? 'bg-gray-900' : 'bg-white';
  const textColorClass = data.fields.background === 'Dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`${backgroundClass} py-24 sm:py-32`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className={`text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
            {data.fields.title}
          </h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {data.fields.items?.map((item) => {
            if (!item || !item.fields) return null;
            
            return (
              <article key={item.sys.id} className="flex flex-col items-start">
                <div className="relative w-full">
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                    {item.fields.image?.fields?.image?.fields?.file?.url && (
                      <Image
                        src={`https:${item.fields.image.fields.image.fields.file.url}`}
                        alt={item.fields.image.fields.altText || ''}
                        width={item.fields.image.fields.image.fields.file.details.image.width}
                        height={item.fields.image.fields.image.fields.file.details.image.height}
                        className="h-full w-full object-cover m-0"
                        priority
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div className="max-w-xl">
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time dateTime="2020-03-16" className="text-gray-500">
                      {item.fields.role}
                    </time>
                  </div>
                  <div className="group relative">
                    <h3 className={`mt-3 text-lg font-semibold leading-6 ${textColorClass} group-hover:text-gray-600`}>
                      <span className="absolute inset-0" />
                      {item.fields.firstName} {item.fields.lastName}
                    </h3>
                    <div className={`mt-5 text-sm leading-6 ${data.fields.background === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.fields.bio && documentToReactComponents(item.fields.bio, options)}
                    </div>
                    {(item.fields.linkedIn || item.fields.twitter || item.fields.email) && (
                      <div className="mt-6 flex gap-6 relative z-10">
                        {item.fields.linkedIn && (
                          <a 
                            href={item.fields.linkedIn} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                          >
                            <span className="sr-only">LinkedIn</span>
                            <FontAwesomeIcon icon={faLinkedin} size="2x" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
} 