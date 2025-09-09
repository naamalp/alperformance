import { createClient } from 'contentful';
import { createClient as createManagementClient } from 'contentful-management';
import { PageContentType, ServiceContentType } from '../types/contentful';
import { Entry, Asset, AssetFile, AssetSys, EntrySys } from 'contentful';

// Add type definitions for our custom types
interface ContentfulAsset extends Omit<Asset, 'sys' | 'fields' | 'metadata'> {
  metadata: {
    tags: any[];
    concepts: any[];
  };
  sys: AssetSys & {
    type: 'Asset';
    revision: number;
    contentType?: { sys: { type: string; linkType: string; id: string } };
  };
  fields: {
    title?: string;
    description?: string;
    file: AssetFile;
  };
}

interface ContentfulEntry extends Omit<Entry<any>, 'sys' | 'fields' | 'metadata'> {
  metadata: {
    tags: any[];
    concepts: any[];
  };
  sys: EntrySys & {
    type: 'Entry';
    revision: number;
    contentType?: { 
      sys?: { type: string; linkType: string; id: string };
      linkType?: string;
      id?: string;
    };
  };
  fields: {
    [key: string]: any;
  };
}

interface ContentfulResponse {
  items: ContentfulEntry[];
  includes?: {
    Entry?: ContentfulEntry[];
    Asset?: ContentfulAsset[];
  };
}

interface ResolvedImageAsset {
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
}

// Type guard functions
function isAsset(value: any): value is ContentfulAsset {
  return value && 
         typeof value === 'object' && 
         'sys' in value && 
         value.sys.type === 'Asset' &&
         'fields' in value &&
         'metadata' in value;
}

function isEntry(value: any): value is ContentfulEntry {
  return value && 
         typeof value === 'object' && 
         'sys' in value && 
         value.sys.type === 'Entry' &&
         'fields' in value &&
         'metadata' in value;
}

function isAssetLink(value: any): value is { sys: { type: 'Link'; linkType: 'Asset'; id: string } } {
  return value && 
         typeof value === 'object' && 
         'sys' in value && 
         value.sys.type === 'Link' && 
         value.sys.linkType === 'Asset';
}

function isEntryLink(value: any): value is { sys: { type: 'Link'; linkType: 'Entry'; id: string } } {
  return value && 
         typeof value === 'object' && 
         'sys' in value && 
         value.sys.type === 'Link' && 
         value.sys.linkType === 'Entry';
}

// Helper function to safely get content type ID
function getContentTypeId(content: any): string | undefined {
  if (!content?.sys) return undefined;
  
  // First try to get it from the content's own sys object
  if (content.sys.contentType?.sys?.id) {
    return content.sys.contentType.sys.id;
  }
  
  // If contentType is a link, try to get it from the includes
  if (content.sys.type === 'Entry' && content.sys.contentType) {
    // Handle both direct ID and sys object formats
    if (typeof content.sys.contentType === 'object') {
      return content.sys.contentType.sys?.id || content.sys.contentType.id;
    }
    // Handle string format
    if (typeof content.sys.contentType === 'string') {
      return content.sys.contentType;
    }
  }
  
  // Try to get it from the content type link
  if (content.sys.contentType?.linkType === 'ContentType') {
    return content.sys.contentType.id;
  }
  
  return undefined;
}

// Helper function to resolve content type from includes
async function resolveContentType(content: any, includes: any, client: any): Promise<string | undefined> {
  // First try to get it directly from the content
  const contentTypeId = getContentTypeId(content);
  if (contentTypeId) {
    return contentTypeId;
  }

  // If not found, try to find it in the includes
  const entries = includes?.Entry;
  if (Array.isArray(entries)) {
    const contentTypeEntry = entries.find(
      (entry: any) => entry.sys.id === contentTypeId
    );
    if (contentTypeEntry) {
      return getContentTypeId(contentTypeEntry);
    }
  }

  // If still not found, try to fetch it directly
  if (contentTypeId) {
    try {
      const contentTypeResponse = await client.delivery.getContentType(contentTypeId);
      return contentTypeResponse.sys.id;
    } catch (error) {
      console.error('Error fetching content type:', {
        contentTypeId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return undefined;
}

// Helper function to convert management API asset to delivery API format
function convertManagementAssetToDelivery(asset: any): ContentfulAsset {
  const sys = {
    ...asset.sys,
    type: 'Asset' as const,
    revision: asset.sys.revision || 1,
    contentType: asset.sys.contentType
  };

  // Handle title field according to ContentfulAsset type
  const title = asset.fields.title;
  const processedTitle = typeof title === 'string' ? title : 
    (typeof title === 'object' ? Object.values(title)[0] : '');

  // Transform file field to match AssetFile type
  const file = asset.fields.file;
  const locale = Object.keys(file)[0];
  const fileData = file[locale];

  const transformedFile: AssetFile = {
    url: fileData.url || '',
    details: {
      size: fileData.details?.size || 0,
      image: {
        width: fileData.details?.image?.width || 0,
        height: fileData.details?.image?.height || 0
      }
    },
    fileName: fileData.fileName || '',
    contentType: fileData.contentType || ''
  };

  return {
    metadata: {
      tags: asset.metadata?.tags || [],
      concepts: asset.metadata?.concepts || []
    },
    sys,
    fields: {
      ...asset.fields,
      title: processedTitle,
      file: transformedFile
    }
  } as ContentfulAsset;
}

// Helper function to safely get asset URL
function getAssetUrl(asset: ContentfulAsset): string | undefined {
  if (!asset?.fields?.file) return undefined;
  const locale = Object.keys(asset.fields.file)[0];
  return (asset.fields.file as any)[locale]?.url;
}

function transformAssetFile(file: any): AssetFile {
  const locale = Object.keys(file)[0];
  const fileData = file[locale];
  
  return {
    url: fileData.url || '',
    contentType: fileData.contentType || 'image/jpeg',
    fileName: fileData.fileName || 'image.jpg',
    details: {
      size: fileData.details?.size || 0,
      image: {
        width: fileData.details?.image?.width || 0,
        height: fileData.details?.image?.height || 0
      }
    }
  };
}

// Helper function to resolve image asset
async function resolveImageAsset(imageField: any, includes: any, client: any): Promise<ContentfulAsset | null> {
  if (!imageField || typeof imageField !== 'object' || !('sys' in imageField)) {
    return null;
  }

  try {
    const assetId = imageField.sys.id;
    
    // First try to find the asset in includes
    const asset = includes?.Asset?.find((a: ContentfulAsset) => a.sys.id === assetId);
    if (asset && isAsset(asset)) {
      return asset;
    }

    // If not found in includes, try to fetch it
    try {
      // Try to fetch the asset directly first
      try {
        const directAsset = await client.delivery.getAsset(assetId);
        if (directAsset) {
          return convertManagementAssetToDelivery(directAsset);
        }
      } catch (directError) {
        // Continue to alternative methods
      }

      if (client.management) {
        try {
          const space = await client.management.getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!);
          const environment = await space.getEnvironment('master');
          const asset = await environment.getAsset(assetId);
          const publishedAsset = await asset.publish();
          return convertManagementAssetToDelivery(publishedAsset);
        } catch (managementError) {
          // Continue to next method
        }
      }

      // Try the Delivery API as a last resort
      const assetResponse = await client.delivery.getEntries({
        'sys.id': assetId,
        'sys.type': 'Asset',
        include: 0
      });

      if (assetResponse.items && assetResponse.items.length > 0) {
        const fetchedAsset = assetResponse.items[0];
        if (isAsset(fetchedAsset)) {
          return convertManagementAssetToDelivery(fetchedAsset);
        }
      }
    } catch (error) {
    }
  } catch (error) {
  }

  return null;
}

export function getContentfulClient() {
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

  if (!spaceId || !accessToken) {
    console.warn("Contentful credentials are missing. Check your .env file.");
    // Return a mock client that will fail gracefully
    return {
      delivery: {
        getEntries: async () => ({ items: [], total: 0, includes: {} }),
        getEntry: async () => null,
        getAsset: async () => null,
        getContentType: async () => null
      },
      management: null
    };
  }

  return {
    delivery: createClient({
    space: spaceId,
    accessToken: accessToken,
    environment: 'master',
    }),
    management: managementToken ? createManagementClient({
      accessToken: managementToken,
    }) : null
  };
}

export async function getEntries<T = any>(
  contentType: string,
  options: {
    limit?: number;
    skip?: number;
    order?: string;
    where?: Record<string, any>;
    include?: number;
    select?: string[];
  } = {}
): Promise<T[]> {
  const client = getContentfulClient();

  try {
    const query = {
      content_type: contentType,
      limit: options.limit || 100,
      skip: options.skip || 0,
      order: options.order,
      include: options.include || 4,
      select: options.select?.join(','),
      ...options.where
    };

    const response = await client.delivery.getEntries(query);

    // Process entries to resolve linked images
    const processedEntries = await Promise.all(
      response.items.map(async (item: any) => {
        const processedItem = { ...item };

        // Check if the item has an image field
        if (item.fields?.image) {
          // Resolve the image asset
          const resolvedAsset = await resolveImageAsset(item.fields.image, response.includes, client);
          
          if (resolvedAsset) {
            processedItem.fields.image = resolvedAsset as any;
          }
        }

        return processedItem;
      })
    );

    return processedEntries as T[];
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }
}

export async function getEntry(entryId: string) {
  try {
    const client = getContentfulClient();
    const entry = await client.delivery.getEntry(entryId, {
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
    
    // Check if a person entry has an image field by querying directly
    try {
      const personQuery = {
        content_type: 'person',
        limit: 1,
        include: 10 // Maximum include depth to ensure we get everything
      };
      
      const personResponse = await client.delivery.getEntries(personQuery);
      
      if (personResponse.items && personResponse.items.length > 0) {
        const person = personResponse.items[0];
        // Check if image field exists in the content type definition
        try {
          const contentTypeResponse = await client.delivery.getContentType('person');
          const imageField = contentTypeResponse.fields.find(field => field.id === 'image');
        } catch (typeError) {
          console.error('[getPageBySlug] Error fetching content type:', typeError);
        }
        
        // If includes exist, check if they contain the referenced image
        if (personResponse.includes?.Asset?.length) {
          // If person has image field with an ID, check if it's in the includes
          if (
            person.fields?.image &&
            typeof person.fields.image === 'object' &&
            'sys' in person.fields.image &&
            person.fields.image.sys &&
            typeof person.fields.image.sys === 'object' &&
            'id' in person.fields.image.sys
          ) {
            const imageId = person.fields.image.sys.id;
            const foundAsset = personResponse.includes.Asset.find(asset =>
              asset && typeof asset === 'object' && 'sys' in asset && asset.sys && typeof asset.sys === 'object' && 'id' in asset.sys && asset.sys.id === imageId
            );
          }
        }
      } else {
        console.log('[getPageBySlug] No person entries found in direct query');
      }
    } catch (error) {
      console.error('[getPageBySlug] Error checking person model:', error);
    }
    
    // Split the slug into parts and clean them
    const slugParts = slug.split('/').filter(Boolean);
    const lastPart = slugParts[slugParts.length - 1];
    
    // Try to find the page with the exact slug
    let response;
    try {
      // First try to find the page with the full slug
      const query = {
        content_type: 'page',
        'fields.slug': slug,
        include: 5, // Increased from 3 to 5 to include deeper nested assets like person images
        select: ['sys.id', 'fields', 'sys.contentType']
      };
      
      try {
        response = await client.delivery.getEntries(query);
        
        // Log information about included assets
        if (response.includes && response.includes.Asset) {
          console.log('[getPageBySlug] Included assets:', {
            total: response.includes.Asset.length,
            assetIds: response.includes.Asset.map(asset => asset.sys.id),
            firstAsset: response.includes.Asset[0] ? {
              id: response.includes.Asset[0].sys.id,
              hasFields: !!response.includes.Asset[0].fields,
              hasFile: !!response.includes.Asset[0].fields?.file,
              fileLocales: response.includes.Asset[0].fields?.file ? Object.keys(response.includes.Asset[0].fields.file) : []
            } : 'no assets'
          });
        } else {
          console.log('[getPageBySlug] No assets included in response');
        }
      } catch (apiError) {
        console.error('Contentful API error:', apiError);
        throw apiError;
      }

      // If no page found with full slug, try with just the last part
      if (!response.items || response.items.length === 0) {
        const lastPartQuery = {
          content_type: 'page',
          'fields.slug': lastPart,
          include: 5, // Increased from 3 to 5
          select: ['sys.id', 'fields', 'sys.contentType']
        };
        
        try {
          response = await client.delivery.getEntries(lastPartQuery);
        } catch (apiError) {
          console.error('Contentful API error:', apiError);
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }

    // If no page found, try to find a service
    if (!response.items || response.items.length === 0) {
      try {
        // First try to find the service with the full slug
        const serviceQuery = {
          content_type: 'service',
          'fields.slug': slug,
          include: 5, // Increased from 3 to 5
          select: ['sys.id', 'fields', 'sys.contentType']
        };
        
        try {
          response = await client.delivery.getEntries(serviceQuery);
        } catch (apiError) {
          console.error('Contentful API error:', apiError);
          throw apiError;
        }

        // If no service found with full slug, try with just the last part
        if (!response.items || response.items.length === 0) {
          const lastPartServiceQuery = {
            content_type: 'service',
            'fields.slug': lastPart,
            include: 5, // Increased from 3 to 5
            select: ['sys.id', 'fields', 'sys.contentType']
          };
          
          try {
            response = await client.delivery.getEntries(lastPartServiceQuery);
          } catch (apiError) {
            console.error('Contentful API error:', apiError);
            throw apiError;
          }
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        throw error;
      }
    }

    // If no content found at all, return null
    if (!response.items || response.items.length === 0) {
      return null;
    }

    // Get the content and verify its type
    const content = response.items[0];
    const contentType = await resolveContentType(content, response.includes, client);
    
    if (!contentType) {
      console.error('Could not determine content type');
      return null;
    }

    // Process the content to resolve image assets
    if (content.fields) {
      // Process body content if it exists
      if (content.fields.body && Array.isArray(content.fields.body)) {
        content.fields.body = await Promise.all(content.fields.body.map(async (item: any) => {
          if (!item || !item.sys) return item;

          // If this is a listing content with items
          if (item.fields?.items && Array.isArray(item.fields.items)) {
            item.fields.items = await Promise.all(item.fields.items.map(async (listItem: any) => {
              if (!listItem || !listItem.sys) return listItem;

              // Process image field if it exists
              if (listItem.fields?.image && typeof listItem.fields.image === 'object' && 'sys' in listItem.fields.image) {
                const resolvedAsset = await resolveImageAsset(listItem.fields.image, response.includes, client);
                if (resolvedAsset) {
                  listItem.fields.image = resolvedAsset;
                } else {
                  delete listItem.fields.image;
                }
              }
              return listItem;
            }));
          }
          return item;
        }));
      }

      // Process hero image if it exists
      if (content.fields.heroImage && typeof content.fields.heroImage === 'object' && 'sys' in content.fields.heroImage) {
        const resolvedAsset = await resolveImageAsset(content.fields.heroImage, response.includes, client);
        if (resolvedAsset) {
          content.fields.heroImage = resolvedAsset;
        } else {
          delete content.fields.heroImage;
        }
      }
    }

    return content as unknown as PageContentType | ServiceContentType;
  } catch (error) {
    console.error('Error in getPageBySlug:', error);
    return null;
  }
}

export async function getServices() {
  try {
    const client = getContentfulClient();
    const query = {
      content_type: 'service',
      include: 3,
      select: ['sys.id', 'fields', 'sys.contentType']
    };

    const response = await client.delivery.getEntries(query);
    const services = response as unknown as ContentfulResponse;

    // Process the services to resolve image assets
    const processedServices = await Promise.all(services.items.map(async service => {
      if (service.fields.image && typeof service.fields.image === 'object' && 'sys' in service.fields.image) {
        const resolvedAsset = await resolveImageAsset(service.fields.image, services.includes, client);
        if (resolvedAsset) {
          service.fields.image = resolvedAsset;
        } else {
          delete service.fields.image;
        }
      }
      return service;
    }));

    return processedServices;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}