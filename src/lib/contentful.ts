import { createClient } from 'contentful';
import { PageContentType, ServiceContentType } from '@/types/contentful';
import { Entry, Asset } from 'contentful';

export function getContentfulClient() {
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !accessToken) {
    throw new Error("Contentful credentials are missing. Check your .env file.");
  }

  return createClient({
    space: spaceId,
    accessToken: accessToken,
    environment: 'master',
  });
}

export async function getEntries(contentType: string) {
  try {
    const client = getContentfulClient();
    const entries = await client.getEntries({
      content_type: contentType,
      include: 3,
    });
    
    console.log('Contentful response:', {
      items: entries.items.length,
      includes: {
        Asset: entries.includes?.Asset?.length,
        Entry: entries.includes?.Entry?.length
      }
    });

    // Process the entries to resolve linked entries and assets
    const processedEntries = await Promise.all(entries.items.map(async entry => {
      const fields = entry.fields as any;
      if (fields.image && typeof fields.image === 'object' && 'sys' in fields.image) {
        try {
          // Fetch the linked entry directly
          const linkedEntry = await client.getEntry(fields.image.sys.id, { include: 2 });
          console.log('Linked entry fetched:', {
            id: linkedEntry.sys.id,
            contentType: linkedEntry.sys.contentType.sys.id,
            fields: linkedEntry.fields
          });

          if (linkedEntry) {
            // If the linked entry has an image field that's a link, resolve that too
            const imageField = linkedEntry.fields.image;
            if (imageField && typeof imageField === 'object' && 'sys' in imageField) {
              const imageAsset = await client.getAsset(imageField.sys.id);
              console.log('Image asset fetched:', {
                id: imageAsset.sys.id,
                fields: imageAsset.fields
              });
              if (imageAsset) {
                fields.image = imageAsset;
              }
            }
          }
        } catch (error) {
          console.error('Error resolving linked entry:', error);
        }
      }
      return entry;
    }));

    return processedEntries;
  } catch (error) {
    console.error('Error fetching Contentful entries:', error);
    throw error;
  }
}

export async function getEntry(entryId: string) {
  try {
    const client = getContentfulClient();
    const entry = await client.getEntry(entryId, {
      include: 3,
    });
    return entry;
  } catch (error) {
    console.error('Error fetching Contentful entry:', error);
    throw error;
  }
}

export async function getPageBySlug(slug: string): Promise<PageContentType | ServiceContentType | null> {
  try {
    const client = getContentfulClient();
    
    // Split the slug into parts
    const slugParts = slug.split('/');
    const lastPart = slugParts[slugParts.length - 1];
    
    // Try to find the page with the exact slug
    let response = await client.getEntries({
      content_type: 'page',
      'fields.slug': lastPart,
      include: 2 // Only include immediate parent
    });

    // If no page found, try to find a service
    if (response.items.length === 0) {
      response = await client.getEntries({
        content_type: 'service',
        'fields.slug': lastPart,
        include: 2 // Only include immediate parent
      });

      // If we found a service, fetch its parent page with its own parent
      if (response.items.length > 0) {
        const service = response.items[0];
        const parent = service.fields.parent as Entry<any> | undefined;
        if (parent) {
          const parentResponse = await client.getEntries({
            content_type: 'page',
            'sys.id': parent.sys.id,
            include: 2 // Only include immediate parent
          });

          if (parentResponse.items.length > 0) {
            // Replace the parent reference with the full parent entry
            service.fields.parent = parentResponse.items[0];
          }
        }
      }
    }



    // If no page or service found, return null
    if (response.items.length === 0) {
      return null;
    }

    // Get the page or service
    const content = response.items[0] as Entry<any>;
    const contentType = content.sys.contentType.sys.id;

    // Build the expected path by traversing up the parent chain
    let currentContent = content;
    const pathParts: string[] = [content.fields.slug as string];
    
    // Handle both page and service parent structures
    while (true) {

      if (contentType === 'page') {
        const parent = currentContent.fields.pageParent as Entry<any> | undefined;
        if (!parent) {
          break;
        }
        currentContent = parent;
        pathParts.unshift(currentContent.fields.slug as string);
      } else {
        // For services, we need to get the parent page
        const parent = currentContent.fields.parent as Entry<any> | undefined;
        if (!parent) {
          break;
        }
        
        // Add the parent page's slug
        pathParts.unshift(parent.fields.slug as string);
        
        // If the parent has its own parent, add that too
        const parentPageParent = parent.fields.pageParent as Entry<any> | undefined;
        if (parentPageParent) {
          pathParts.unshift(parentPageParent.fields.slug as string);
        }
        break; // We've added all parents for the service
      }
    }

    const expectedPath = pathParts.join('/');

    // Check if the paths match
    if (expectedPath !== slug) {
      return null;
    }

    // Clean up circular references before returning
    const cleanContent = JSON.parse(JSON.stringify(content, (key, value) => {
      // Remove circular references
      if (key === 'pageParent' && typeof value === 'object' && value !== null) {
        return {
          sys: value.sys,
          fields: {
            slug: value.fields.slug,
            pageTitle: value.fields.pageTitle,
            pageDescription: value.fields.pageDescription
          }
        };
      }
      return value;
    }));
    return cleanContent as unknown as PageContentType | ServiceContentType;
  } catch (error) {
    return null;
  }
}