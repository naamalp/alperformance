'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

interface RichTextProps {
  data: {
    sys: {
      id: string;
      type: string;
      linkType: string;
    };
    fields: {
      [key: string]: any;
      richText?: any; // Contentful rich text document
      background?: 'Light' | 'Dark';
      alignment?: 'Left' | 'Center' | 'Right';
    };
  };
}

const options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
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
      return <li className="text-gray-600">{children}</li>;
    },
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      return (
        <a href={node.data.uri} className="text-blue-600 hover:text-blue-800 underline">
          {children}
        </a>
      );
    },
  },
};

export default function RichText({ data }: RichTextProps) {
  if (!data?.fields?.richText) {
    console.log('No rich text content found:', data);
    return null;
  }

  const backgroundClass = data.fields.background === 'Dark' ? 'bg-gray-900' : 'bg-white';
  const textColorClass = data.fields.background === 'Dark' ? 'text-white' : 'text-gray-900';
  const alignmentClass = {
    'Left': 'text-left',
    'Center': 'text-center',
    'Right': 'text-right'
  }[data.fields.alignment || 'Left'];

  return (
    <div className={`${backgroundClass} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`py-12 px-4 prose max-w-none ${textColorClass} ${alignmentClass}`}>
        {documentToReactComponents(data.fields.richText, {
          ...options,
          renderNode: {
            ...options.renderNode,
            [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
              return <p className={`mt-4 ${data.fields.background === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>{children}</p>;
            },
            [BLOCKS.HEADING_1]: (node: any, children: any) => {
              return <h1 className={`text-4xl font-bold mt-8 mb-4 ${textColorClass}`}>{children}</h1>;
            },
            [BLOCKS.HEADING_2]: (node: any, children: any) => {
              return <h2 className={`text-3xl font-bold mt-8 mb-4 ${textColorClass}`}>{children}</h2>;
            },
            [BLOCKS.HEADING_3]: (node: any, children: any) => {
              return <h3 className={`text-2xl font-bold mt-6 mb-3 ${textColorClass}`}>{children}</h3>;
            },
            [BLOCKS.LIST_ITEM]: (node: any, children: any) => {
              return <li className={data.fields.background === 'Dark' ? 'text-gray-300' : 'text-gray-600'}>{children}</li>;
            },
            [INLINES.HYPERLINK]: (node: any, children: any) => {
              return (
                <a href={node.data.uri} className={`${data.fields.background === 'Dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}>
                  {children}
                </a>
              );
            },
          }
        })}
      </div>
    </div>
  );
} 