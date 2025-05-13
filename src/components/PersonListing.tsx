'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';

interface PersonListingProps {
  data: {
    fields: {
      internalName: string;
      title: string;
      subTitle?: string;
      items: Array<PersonItem>;
      background?: 'Light' | 'Dark';
    };
  };
}

interface PersonItem {
  sys: {
    id: string;
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    internalName: string;
    firstName: string;
    lastName: string;
    role: string;
    internal: boolean;
    featured?: boolean;
    linkedIn?: string;
    bio: any;
    image?: {
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
  };
}

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      return <p className="mt-4 text-base leading-7 text-gray-600">{children}</p>;
    },
  },
};

const PersonCard = ({ item, textColorClass }: { item: PersonItem; textColorClass: string }) => {
  console.log('PersonCard rendering item:', {
    id: item.sys.id,
    name: `${item.fields.firstName} ${item.fields.lastName}`,
    image: {
      exists: !!item.fields.image,
      type: item.fields.image ? typeof item.fields.image : 'none',
      hasFields: item.fields.image?.fields ? 'yes' : 'no',
      hasFile: item.fields.image?.fields?.file ? 'yes' : 'no',
      hasUrl: item.fields.image?.fields?.file?.url ? 'yes' : 'no',
      url: item.fields.image?.fields?.file?.url,
      fullImage: item.fields.image
    }
  });

  return (
    <article className={`flex flex-col items-start ${item.fields.featured ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
      <div className="relative w-full">
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
          {item.fields.image?.fields?.file?.url && (
            <Image
              src={`https:${item.fields.image.fields.file.url}`}
              alt={`${item.fields.firstName} ${item.fields.lastName}`}
              width={item.fields.image.fields.file.details.image.width}
              height={item.fields.image.fields.file.details.image.height}
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
          <div className="mt-5 text-sm leading-6 text-gray-600">
            {item.fields.bio && documentToReactComponents(item.fields.bio, options)}
          </div>
          {item.fields.linkedIn && (
            <div className="mt-6 flex gap-6 relative z-10">
              <a 
                href={item.fields.linkedIn} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <span className="sr-only">LinkedIn</span>
                <FontAwesomeIcon icon={faLinkedin} size="2x" />
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default function PersonListing({ data }: PersonListingProps) {
  console.log('PersonListing: Rendering with data:', {
    title: data.fields.title,
    itemsCount: data.fields.items?.length,
    firstItem: data.fields.items?.[0] ? {
      id: data.fields.items[0].sys.id,
      name: `${data.fields.items[0].fields.firstName} ${data.fields.items[0].fields.lastName}`,
      image: {
        exists: !!data.fields.items[0].fields.image,
        type: data.fields.items[0].fields.image ? typeof data.fields.items[0].fields.image : 'none',
        hasFields: data.fields.items[0].fields.image?.fields ? 'yes' : 'no',
        hasFile: data.fields.items[0].fields.image?.fields?.file ? 'yes' : 'no',
        hasUrl: data.fields.items[0].fields.image?.fields?.file?.url ? 'yes' : 'no',
        url: data.fields.items[0].fields.image?.fields?.file?.url
      }
    } : null
  });

  const backgroundClass = data.fields.background === 'Dark' ? 'bg-brand-primary-dark' : 'bg-white';
  const textColorClass = data.fields.background === 'Dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`${backgroundClass} py-24 sm:py-32`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className={`text-base font-semibold leading-7 ${data.fields.background === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            {data.fields.subTitle}
          </h2>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
            {data.fields.title}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-6">
          {data.fields.items?.map((item) => (
            <PersonCard key={item.sys.id} item={item} textColorClass={textColorClass} />
          ))}
        </div>
      </div>
    </div>
  );
} 