import { createClient } from 'contentful';
import { createClient as createManagementClient } from 'contentful-management';
import { PageContentType, ServiceContentType } from '@/types/contentful';
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
  } as Asset;
}

// Helper function to safely get asset URL
function getAssetUrl(asset: ContentfulAsset): string | undefined {
  if (!asset?.fields?.file) return undefined;
  const locale = Object.keys(asset.fields.file)[0];
  return asset.fields.file[locale]?.url;
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
  if (!imageField || !imageField.sys) {
    console.log('Invalid image field:', {
      hasField: !!imageField,
      hasSys: !!imageField?.sys,
      fieldType: typeof imageField,
      fieldKeys: imageField ? Object.keys(imageField) : []
    });
    return null;
  }

  try {
    const assetId = imageField.sys.id;
    
    // Log detailed information about includes
    console.log('Resolving image asset:', {
      assetId,
      hasIncludes: !!includes,
      assetCount: includes?.Asset?.length || 0,
      includesKeys: includes ? Object.keys(includes) : [],
      assetIds: includes?.Asset?.map((a: any) => ({
        id: a.sys.id,
        type: a.sys.type,
        contentType: a.sys.contentType?.sys?.id,
        hasFields: !!a.fields,
        hasFile: !!a.fields?.file
      })) || []
    });

    // First try to find the asset in includes
    const asset = includes?.Asset?.find((a: ContentfulAsset) => a.sys.id === assetId);
    if (asset && isAsset(asset)) {
      console.log('Found asset in includes:', {
        id: assetId,
        hasFields: !!asset.fields,
        hasFile: !!asset.fields?.file,
        fileKeys: asset.fields?.file ? Object.keys(asset.fields.file) : [],
        url: getAssetUrl(asset),
        assetType: typeof asset,
        assetKeys: Object.keys(asset)
      });
      return asset;
    }

    // If not found in includes, try to fetch it
    console.log('Asset not found in includes, attempting to fetch:', {
      assetId,
      hasManagementClient: !!client.management,
      hasDeliveryClient: !!client.delivery,
      availableAssetIds: includes?.Asset?.map((a: any) => a.sys.id) || []
    });

    try {
      // Try to fetch the asset directly first
      try {
        const directAsset = await client.delivery.getAsset(assetId);
        if (directAsset) {
          console.log('Successfully fetched asset directly:', {
            id: assetId,
            hasFields: !!directAsset.fields,
            hasFile: !!directAsset.fields?.file,
            fileKeys: directAsset.fields?.file ? Object.keys(directAsset.fields.file) : [],
            url: directAsset.fields?.file?.url,
            assetType: typeof directAsset,
            assetKeys: Object.keys(directAsset)
          });
          return convertManagementAssetToDelivery(directAsset);
        }
      } catch (directError) {
        console.log('Direct asset fetch failed, trying alternative methods:', {
          assetId,
          error: directError instanceof Error ? directError.message : String(directError)
        });
      }

      if (client.management) {
        try {
          const space = await client.management.getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!);
          const environment = await space.getEnvironment('master');
          const asset = await environment.getAsset(assetId);
          const publishedAsset = await asset.publish();
          
          console.log('Successfully fetched asset via Management API:', {
            id: assetId,
            hasFields: !!publishedAsset.fields,
            hasFile: !!publishedAsset.fields?.file,
            fileKeys: publishedAsset.fields?.file ? Object.keys(publishedAsset.fields.file) : [],
            url: publishedAsset.fields?.file?.url,
            assetType: typeof publishedAsset,
            assetKeys: Object.keys(publishedAsset)
          });
          
          return convertManagementAssetToDelivery(publishedAsset);
        } catch (managementError) {
          console.error('Management API fetch failed:', {
            assetId,
            error: managementError instanceof Error ? managementError.message : String(managementError)
          });
        }
      }

      // Try the Delivery API as a last resort
      const assetResponse = await client.delivery.getEntries({
        'sys.id': assetId,
        'sys.type': 'Asset',
        include: 0
      });

      console.log('Delivery API response:', {
        hasItems: !!assetResponse.items,
        itemsLength: assetResponse.items?.length,
        firstItem: assetResponse.items?.[0] ? {
          hasSys: !!assetResponse.items[0].sys,
          hasFields: !!assetResponse.items[0].fields,
          hasFile: !!assetResponse.items[0].fields?.file,
          fileKeys: assetResponse.items[0].fields?.file ? Object.keys(assetResponse.items[0].fields.file) : [],
          itemType: typeof assetResponse.items[0],
          itemKeys: Object.keys(assetResponse.items[0])
        } : null,
        responseType: typeof assetResponse,
        responseKeys: Object.keys(assetResponse)
      });

      if (assetResponse.items && assetResponse.items.length > 0) {
        const fetchedAsset = assetResponse.items[0];
        if (isAsset(fetchedAsset)) {
          console.log('Successfully fetched asset via Delivery API:', {
            id: assetId,
            hasFields: !!fetchedAsset.fields,
            hasFile: !!fetchedAsset.fields?.file,
            fileKeys: fetchedAsset.fields?.file ? Object.keys(fetchedAsset.fields.file) : [],
            url: getAssetUrl(fetchedAsset),
            assetType: typeof fetchedAsset,
            assetKeys: Object.keys(fetchedAsset)
          });
          return convertManagementAssetToDelivery(fetchedAsset);
        } else {
          console.log('Fetched item is not a valid asset:', {
            id: assetId,
            type: fetchedAsset.sys?.type,
            hasFields: !!fetchedAsset.fields,
            hasFile: !!fetchedAsset.fields?.file
          });
        }
      } else {
        console.log('No items found in Delivery API response for asset:', {
          assetId,
          responseType: typeof assetResponse,
          responseKeys: Object.keys(assetResponse),
          availableAssetIds: includes?.Asset?.map((a: any) => a.sys.id) || []
        });
      }
    } catch (error) {
      console.error('Error fetching asset:', {
        assetId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        availableAssetIds: includes?.Asset?.map((a: any) => a.sys.id) || []
      });
    }
  } catch (error) {
    console.error('Error resolving image asset:', {
      error: error instanceof Error ? error.message : String(error),
      imageField,
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  return null;
}

export function getContentfulClient() {
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

  if (!spaceId || !accessToken) {
    throw new Error("Contentful credentials are missing. Check your .env file.");
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
  
  console.log('Fetching entries:', {
    contentType,
    options,
    hasDeliveryClient: !!client.delivery,
    hasManagementClient: !!client.management
  });

  try {
    const query = {
      content_type: contentType,
      limit: options.limit || 100,
      skip: options.skip || 0,
      order: options.order,
      include: options.include || 2,
      select: options.select?.join(','),
      ...options.where
    };

    console.log('Query:', {
      contentType,
      query,
      hasDeliveryClient: !!client.delivery,
      hasManagementClient: !!client.management
    });

    const response = await client.delivery.getEntries(query);
    console.log('Response:', {
      hasItems: !!response.items,
      itemsLength: response.items?.length,
      firstItem: response.items?.[0] ? {
        id: response.items[0].sys.id,
        contentType: response.items[0].sys.contentType?.sys?.id,
        hasFields: !!response.items[0].fields,
        fieldKeys: response.items[0].fields ? Object.keys(response.items[0].fields) : [],
        hasImage: !!response.items[0].fields?.image,
        imageType: response.items[0].fields?.image ? typeof response.items[0].fields.image : null
      } : null
    });

    // Process entries to resolve linked images
    const processedEntries = await Promise.all(
      response.items.map(async (item: any) => {
        const processedItem = { ...item };
        
        // Log the item being processed
        console.log('Processing item:', {
          id: item.sys.id,
          contentType: item.sys.contentType?.sys?.id,
          hasFields: !!item.fields,
          fieldKeys: item.fields ? Object.keys(item.fields) : [],
          hasImage: !!item.fields?.image,
          imageType: item.fields?.image ? typeof item.fields.image : null
        });

        // Check if the item has an image field
        if (item.fields?.image) {
          console.log('Found image field:', {
            id: item.sys.id,
            imageField: item.fields.image,
            hasSys: !!item.fields.image.sys,
            sysId: item.fields.image.sys?.id,
            sysType: item.fields.image.sys?.type
          });

          // Resolve the image asset
          const resolvedAsset = await resolveImageAsset(item.fields.image, response.includes, client);
          
          if (resolvedAsset) {
            console.log('Successfully resolved image:', {
              id: item.sys.id,
              hasFields: !!resolvedAsset.fields,
              hasFile: !!resolvedAsset.fields?.file,
              fileKeys: resolvedAsset.fields?.file ? Object.keys(resolvedAsset.fields?.file) : [],
              url: resolvedAsset.fields?.file?.url
            });
            processedItem.fields.image = resolvedAsset as any;
          } else {
            console.log('Failed to resolve image:', {
              id: item.sys.id,
              imageField: item.fields.image
            });
          }
        }

        return processedItem;
      })
    );

    return processedEntries as T[];
  } catch (error) {
    console.error('Error fetching entries:', {
      contentType,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
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
    
    // Split the slug into parts and clean them
    const slugParts = slug.split('/').filter(Boolean);
    const lastPart = slugParts[slugParts.length - 1];
    
    console.log('Fetching page with slug:', {
      fullSlug: slug,
      lastPart,
      allParts: slugParts
    });
    
    // Try to find the page with the exact slug
    let response;
    try {
      // First try to find the page with the full slug
      const query = {
        content_type: 'page',
        'fields.slug': slug,
        include: 3, // Include up to 3 levels of linked entries
        select: ['sys.id', 'fields', 'sys.contentType'] // Added sys.contentType to selection
      };

      console.log('Fetching page with query:', query);
      
      try {
        response = await client.delivery.getEntries(query);
        console.log('Initial response:', {
          hasItems: !!response.items,
          itemsLength: response.items?.length,
          firstItem: response.items?.[0] ? {
            hasSys: !!response.items[0].sys,
            hasContentType: !!response.items[0].sys?.contentType,
            contentTypeId: response.items[0].sys?.contentType?.sys?.id,
            hasFields: !!response.items[0].fields,
            fields: response.items[0].fields ? Object.keys(response.items[0].fields) : []
          } : null
        });
      } catch (apiError) {
        console.error('Contentful API error:', {
          error: apiError instanceof Error ? apiError.message : String(apiError),
          query
        });
        throw apiError;
      }

      // If no page found with full slug, try with just the last part
      if (!response.items || response.items.length === 0) {
        console.log('No page found with full slug, trying last part');
        const lastPartQuery = {
          content_type: 'page',
          'fields.slug': lastPart,
          include: 3,
          select: ['sys.id', 'fields', 'sys.contentType']
        };

        console.log('Fetching page with query:', lastPartQuery);
        
        try {
          response = await client.delivery.getEntries(lastPartQuery);
          console.log('Last part response:', {
            hasItems: !!response.items,
            itemsLength: response.items?.length,
            firstItem: response.items?.[0] ? {
              hasSys: !!response.items[0].sys,
              hasContentType: !!response.items[0].sys?.contentType,
              contentTypeId: response.items[0].sys?.contentType?.sys?.id,
              hasFields: !!response.items[0].fields,
              fields: response.items[0].fields ? Object.keys(response.items[0].fields) : []
            } : null
          });
        } catch (apiError) {
          console.error('Contentful API error:', {
            error: apiError instanceof Error ? apiError.message : String(apiError),
            query: lastPartQuery
          });
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error fetching page:', {
        error: error instanceof Error ? error.message : String(error),
        slug,
        lastPart
      });
      throw error;
    }

    // If no page found, try to find a service
    if (!response.items || response.items.length === 0) {
      console.log('No page found, trying service');
      try {
        // First try to find the service with the full slug
        const serviceQuery = {
          content_type: 'service',
          'fields.slug': slug,
          include: 3,
          select: ['sys.id', 'fields', 'sys.contentType']
        };

        console.log('Fetching service with query:', serviceQuery);
        
        try {
          response = await client.delivery.getEntries(serviceQuery);
          console.log('Service response:', {
            hasItems: !!response.items,
            itemsLength: response.items?.length,
            firstItem: response.items?.[0] ? {
              hasSys: !!response.items[0].sys,
              hasContentType: !!response.items[0].sys?.contentType,
              contentTypeId: response.items[0].sys?.contentType?.sys?.id,
              hasFields: !!response.items[0].fields,
              fields: response.items[0].fields ? Object.keys(response.items[0].fields) : []
            } : null
          });
        } catch (apiError) {
          console.error('Contentful API error:', {
            error: apiError instanceof Error ? apiError.message : String(apiError),
            query: serviceQuery
          });
          throw apiError;
        }

        // If no service found with full slug, try with just the last part
        if (!response.items || response.items.length === 0) {
          console.log('No service found with full slug, trying last part');
          const lastPartServiceQuery = {
            content_type: 'service',
            'fields.slug': lastPart,
            include: 3,
            select: ['sys.id', 'fields', 'sys.contentType']
          };

          console.log('Fetching service with query:', lastPartServiceQuery);
          
          try {
            response = await client.delivery.getEntries(lastPartServiceQuery);
            console.log('Last part service response:', {
              hasItems: !!response.items,
              itemsLength: response.items?.length,
              firstItem: response.items?.[0] ? {
                hasSys: !!response.items[0].sys,
                hasContentType: !!response.items[0].sys?.contentType,
                contentTypeId: response.items[0].sys?.contentType?.sys?.id,
                hasFields: !!response.items[0].fields,
                fields: response.items[0].fields ? Object.keys(response.items[0].fields) : []
              } : null
            });
          } catch (apiError) {
            console.error('Contentful API error:', {
              error: apiError instanceof Error ? apiError.message : String(apiError),
              query: lastPartServiceQuery
            });
            throw apiError;
          }
        }
      } catch (error) {
        console.error('Error fetching service:', {
          error: error instanceof Error ? error.message : String(error),
          slug,
          lastPart
        });
        throw error;
      }
    }

    // If no content found at all, return null
    if (!response.items || response.items.length === 0) {
      console.log('No content found for slug:', slug);
      return null;
    }

    // Get the content and verify its type
    const content = response.items[0];
    const contentType = await resolveContentType(content, response.includes, client);
    
    if (!contentType) {
      console.error('Could not determine content type:', {
        contentSys: content.sys,
        includes: response.includes
      });
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
                  console.log('Could not resolve image for item:', {
                    itemId: listItem.sys.id,
                    imageField: listItem.fields.image
                  });
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
          console.log('Could not resolve hero image:', {
            contentId: content.sys.id,
            imageField: content.fields.heroImage
          });
          delete content.fields.heroImage;
        }
      }
    }

    console.log('Found content:', {
      contentType,
      id: content.sys.id,
      fields: Object.keys(content.fields),
      hasHeroImage: !!content.fields.heroImage,
      hasBody: !!content.fields.body,
      bodyLength: Array.isArray(content.fields.body) ? content.fields.body.length : 0
    });

    return content as unknown as PageContentType | ServiceContentType;
  } catch (error) {
    console.error('Error in getPageBySlug:', {
      error: error instanceof Error ? error.message : String(error),
      slug
    });
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

    console.log('Fetching services with query:', query);
    const response = await client.delivery.getEntries(query);
    const services = response as unknown as ContentfulResponse;
    
    console.log('Services response:', {
      total: services.items.length,
      includes: {
        Asset: services.includes?.Asset?.length || 0,
        Entry: services.includes?.Entry?.length || 0
      }
    });

    // Process the services to resolve image assets
    const processedServices = await Promise.all(services.items.map(async service => {
      if (service.fields.image && typeof service.fields.image === 'object' && 'sys' in service.fields.image) {
        const resolvedAsset = await resolveImageAsset(service.fields.image, services.includes, client);
        if (resolvedAsset) {
          service.fields.image = resolvedAsset;
        } else {
          console.log('Could not resolve image for service:', {
            serviceId: service.sys.id,
            imageField: service.fields.image
          });
          delete service.fields.image;
        }
      }
      return service;
    }));

    return processedServices;
  } catch (error) {
    console.error('Error fetching services:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}