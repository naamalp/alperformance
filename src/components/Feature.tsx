'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import CTA from './CTA';
import { CTAContentType } from '@/types/contentful';

interface FeatureProps {
  data: {
    sys: {
      id: string;
      type: string;
      linkType: string;
    };
    fields: {
      internalName: string;
      subTitle: string;
      title: string;
      body: any;
      media: {
        fields: {
          image: {
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
      };
      alignment: 'Left' | 'Center' | 'Right';
      background: 'Light' | 'Dark';
      mediaStyle?: boolean;
      mediaSize?: 'Small' | 'Medium' | 'Large';
      cta?: CTAContentType;
    };
  };
}

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      if (node.parentNode?.nodeType === 'list-item') {
        return children;
      }
      return <p className="mt-4 text-gray-600">{children}</p>;
    },
    [BLOCKS.HEADING_1]: (node: any, children: any) => {
      return <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>;
    },
    [BLOCKS.HEADING_2]: (node: any, children: any) => {
      return <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>;
    },
    [BLOCKS.HEADING_3]: (node: any, children: any) => {
      return <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>;
    },
    [BLOCKS.UL_LIST]: (node: any, children: any) => {
      return <ul className="list-disc list-inside mt-4 space-y-2">{children}</ul>;
    },
    [BLOCKS.OL_LIST]: (node: any, children: any) => {
      return <ol className="list-decimal list-inside mt-4 space-y-2">{children}</ol>;
    },
    [BLOCKS.LIST_ITEM]: (node: any, children: any) => {
      const content = node.content.map((contentNode: any) => {
        if (contentNode.nodeType === 'text') {
          return contentNode.value;
        }
        if (contentNode.nodeType === 'paragraph') {
          return contentNode.content
            .filter((textNode: any) => textNode.nodeType === 'text')
            .map((textNode: any) => textNode.value)
            .join('');
        }
        return '';
      }).join('');

      return <li className="text-gray-600">{content}</li>;
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
  },
};

const getMediaSizeClass = (size?: 'Small' | 'Medium' | 'Large') => {
  switch (size) {
    case 'Small':
      return 'max-w-sm mx-auto';
    case 'Medium':
      return 'max-w-xl mx-auto';
    case 'Large':
      return 'max-w-3xl mx-auto';
    default:
      return 'max-w-xl mx-auto';
  }
};

const getMediaStyleClass = (hasStyle?: boolean) => {
  if (hasStyle === false) {
    return '';
  }
  return 'relative rounded-2xl bg-white/5 p-2 ring-1 ring-white/10';
};

const getImageStyleClass = (hasStyle?: boolean) => {
  if (hasStyle === false) {
    return 'w-full object-cover';
  }
  return 'w-full rounded-xl shadow-2xl ring-1 ring-gray-400/10 object-cover';
};

export default function Feature({ data }: FeatureProps) {  
  const backgroundClass = data.fields.background === 'Dark' ? 'bg-brand-primary-dark' : 'bg-transparent';
  const textColorClass = data.fields.background === 'Dark' ? 'text-white' : 'text-gray-900';
 

  const renderContent = () => {

    return (
      <div>
        <h2 className={`text-base font-semibold leading-7 ${data.fields.background === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>
          {data.fields.subTitle}
        </h2>
        <p className={`mt-2 text-3xl font-bold tracking-tight ${textColorClass} sm:text-4xl`}>
          {data.fields.title}
        </p>
        <div className={`mt-6 max-w-xl text-lg leading-8 ${data.fields.background === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {documentToReactComponents(data.fields.body, options)}
        </div>
        {data.fields.cta && (
          <div className="mt-8">
            <CTA data={data.fields.cta} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${backgroundClass} py-24 sm:py-32`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none ${
          data.fields.mediaSize === 'Small' ? 'lg:grid-cols-5' : 'lg:grid-cols-2'
        }`}>
          {data.fields.alignment === 'Left' ? (
            <>
              <div className={`relative ${data.fields.mediaSize === 'Small' ? 'lg:col-span-2' : ''}`}>
                <div className={`relative ${getMediaSizeClass(data.fields.mediaSize)}`}>
                  {data.fields.media?.fields?.image?.fields?.file?.url && (
                    <div className={getMediaStyleClass(data.fields.mediaStyle)}>
                      <img
                        src={`https:${data.fields.media.fields.image.fields.file.url}`}
                        alt={data.fields.title}
                        className={getImageStyleClass(data.fields.mediaStyle)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={`${data.fields.mediaSize === 'Small' ? 'lg:col-span-3' : ''} lg:pl-8 lg:pt-4`}>
                {renderContent()}
              </div>
            </>
          ) : (
            <>
              <div className={`${data.fields.mediaSize === 'Small' ? 'lg:col-span-3' : ''} lg:pr-8 lg:pt-4`}>
                {renderContent()}
              </div>
              <div className={`relative ${data.fields.mediaSize === 'Small' ? 'lg:col-span-2' : ''}`}>
                <div className={`relative ${getMediaSizeClass(data.fields.mediaSize)}`}>
                  {data.fields.media?.fields?.image?.fields?.file?.url && (
                    <div className={getMediaStyleClass(data.fields.mediaStyle)}>
                      <img
                        src={`https:${data.fields.media.fields.image.fields.file.url}`}
                        alt={data.fields.title}
                        className={getImageStyleClass(data.fields.mediaStyle)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 