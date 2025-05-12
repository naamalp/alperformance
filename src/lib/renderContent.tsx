import { PageContentType, ServiceContentType } from '@/types/contentful';
import HeroBanner from '@/components/HeroBanner';
import ListingDynamic from '@/components/ListingDynamic';
import RichText from '@/components/RichText';
import Feature from '@/components/Feature';
import ListingContent from '@/components/ListingContent';
import ServiceLayout from '@/components/ServiceLayout';

export function renderContent(content: PageContentType | ServiceContentType) {
  if ('body' in content.fields) {
    const { body } = content.fields;

    if (!body) {
      return null;
    }

    // Check if body is an array (page) or rich text object (service)
    if (Array.isArray(body)) {
      return body.map((item) => {
        const contentType = item.sys.contentType?.sys?.id;
        console.log('Rendering body item:', {
          contentType,
          fields: item.fields
        });

        switch (contentType) {
          case 'heroBanner':
            return <HeroBanner key={item.sys.id} data={item} />;
          case 'listingDynamic':
            return <ListingDynamic key={item.sys.id} data={item} />;
          case 'richText':
            return <RichText key={item.sys.id} data={item} />;
          case 'feature':
            return <Feature key={item.sys.id} data={item} />;
          case 'listingContent':
          case 'person':
            return <ListingContent key={item.sys.id} data={{
              ...item,
              contentTypeId: contentType
            }} />;
          default:
            console.warn('Unhandled content type:', contentType);
            return null;
        }
      });
    } else {
      // Handle rich text body for services
      const serviceContent = content as ServiceContentType;
      return <ServiceLayout data={serviceContent} />;
    }
  } else {
    // For services without body field
    const serviceContent = content as ServiceContentType;
    return <ServiceLayout data={serviceContent} />;
  }
} 