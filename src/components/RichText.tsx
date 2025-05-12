'use client';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import Image from 'next/image';
import CTA from './CTA';

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

// Helper function to render CTA
const renderCTA = (entry: any) => {
  return <CTA data={entry} />;
};

export default function RichText({ data }: RichTextProps) {
  if (!data?.fields?.richText) {
    console.log('No rich text content found:', data);
    return null;
  }

  console.log('Rich Text Data:', {
    content: data.fields.richText,
    nodes: data.fields.richText.content
  });

  const backgroundClass = data.fields.background === 'Dark' ? 'bg-brand-primary-dark shadow-2xl sm:rounded-3xl' : 'bg-transparent';
  const textColorClass = data.fields.background === 'Dark' ? 'text-white' : 'text-gray-900';
  const alignmentClass = {
    'Left': 'text-left',
    'Center': 'text-center',
    'Right': 'text-right'
  }[data.fields.alignment || 'Left'];

  const options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
        // Skip paragraph rendering if parent is a list item
        if (node.parentNode?.nodeType === 'list-item') {
          return children;
        }
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
      [BLOCKS.HEADING_4]: (node: any, children: any) => {
        return <h4 className={`text-xl font-bold mt-6 mb-3 ${textColorClass}`}>{children}</h4>;
      },
      [BLOCKS.HEADING_5]: (node: any, children: any) => {
        return <h5 className={`text-lg font-bold mt-5 mb-2 ${textColorClass}`}>{children}</h5>;
      },
      [BLOCKS.HEADING_6]: (node: any, children: any) => {
        return <h6 className={`text-base font-bold mt-4 mb-2 ${textColorClass}`}>{children}</h6>;
      },
      [BLOCKS.UL_LIST]: (node: any, children: any) => {
        return <ul className="list-disc list-inside mt-4 space-y-2">{children}</ul>;
      },
      [BLOCKS.OL_LIST]: (node: any, children: any) => {
        return <ol className="list-decimal list-inside mt-4 space-y-2">{children}</ol>;
      },
      [BLOCKS.LIST_ITEM]: (node: any, children: any) => {
        // Extract text content directly from the node's content
        const content = node.content.map((contentNode: any) => {
          if (contentNode.nodeType === 'text') {
            return contentNode.value;
          }
          if (contentNode.nodeType === 'paragraph') {
            // For paragraphs inside list items, just return their text content
            return contentNode.content
              .filter((textNode: any) => textNode.nodeType === 'text')
              .map((textNode: any) => textNode.value)
              .join('');
          }
          return '';
        }).join('');

        return <li className={data.fields.background === 'Dark' ? 'text-gray-300' : 'text-gray-600'}>{content}</li>;
      },
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const { title, description, file } = node.data.target.fields;
        const imageUrl = file.url;
        const imageWidth = file.details.image.width;
        const imageHeight = file.details.image.height;
        const altText = description || title || '';

        return (
          <div className="my-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={`https:${imageUrl}`}
                alt={altText}
                width={imageWidth}
                height={imageHeight}
                className="object-cover"
                priority={false}
              />
            </div>
            {description && (
              <p className={`mt-2 text-sm ${data.fields.background === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {description}
              </p>
            )}
          </div>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        console.log('Block Embedded Entry:', {
          node,
          target: node.data.target,
          contentType: node.data.target?.sys?.contentType?.sys?.id
        });

        const entry = node.data.target;
        
        // Handle CTA entries
        if (entry.sys.contentType.sys.id === 'cta') {
          return (
            <div className="my-8 flex justify-center">
              {renderCTA(entry)}
            </div>
          );
        }

        // Handle other embedded entry types here
        return null;
      },
      [INLINES.EMBEDDED_ENTRY]: (node: any) => {
        console.log('Inline Embedded Entry:', {
          node,
          target: node.data.target,
          contentType: node.data.target?.sys?.contentType?.sys?.id
        });

        const entry = node.data.target;
        
        // Handle CTA entries
        if (entry.sys.contentType.sys.id === 'cta') {
          return (
            <div className="my-8 flex justify-center">
              {renderCTA(entry)}
            </div>
          );
        }

        // Handle other embedded entry types here
        return null;
      },
      [INLINES.HYPERLINK]: (node: any, children: any) => {
        return (
          <a href={node.data.uri} className={`${data.fields.background === 'Dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`}>
            {children}
          </a>
        );
      },
    },
    renderMark: {
      bold: (text: React.ReactNode) => <strong>{text}</strong>,
    },
  };

  return (
    <div className={`${backgroundClass} mx-auto max-w-7xl px-6 lg:px-8`}>
      <div className={`py-12 px-4 prose max-w-none ${textColorClass} ${alignmentClass}`}>
        {documentToReactComponents(data.fields.richText, options)}
      </div>
    </div>
  );
} 