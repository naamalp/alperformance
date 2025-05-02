import { EntrySkeletonType } from 'contentful';

interface CTAFields {
  label: string | {
    content: Array<{
      content: Array<{
        value: string;
      }>;
    }>;
  };
  link: {
    sys: {
      id: string;
      type: string;
      linkType: string;
    };
    fields: {
      internalName: string;
      pageTitle: string;
      pageDescription: string;
      pageType: string;
      slug: string;
    };
  };
  type: 'Primary' | 'Secondary' | 'Link';
}

interface CTAContentType {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
  fields: CTAFields;
}

interface HeroBannerFields {
  title: string;
  subTitle: string;
  image: {
    fields: {
      title: string;
      description: string;
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
  icon?: {
    fields: {
      title: string;
      description: string;
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
  ctaGroup: CTAContentType[];
  type: 'Full Page' | 'Header';
}

interface HeroBannerContentType {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
  fields: HeroBannerFields;
}

interface ListingDynamicFields {
  internalName: string;
  title?: string;
  subTitle?: string;
  listingContent: 'Services' | 'Articles';
  category?: string;
  style: 'Bento' | 'Grid';
  filters?: boolean;
  limit?: number;
  pagination?: boolean;
}

interface ListingDynamicContentType {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
  fields: ListingDynamicFields;
}

interface PageFields {
  pageTitle: string;
  pageDescription: string;
  pageType: string;
  slug: string;
  body: Array<HeroBannerContentType | ListingDynamicContentType>;
}

interface PageContentType {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
  fields: PageFields;
}

interface ServiceFields {
  name: string;
  shortDescription: string;
  slug: string;
  featuredImage?: {
    fields: {
      altText: string;
      internalName: string;
      image: {
        fields: {
          title: string;
          description: string;
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
  parent?: {
    sys: {
      id: string;
    };
    fields: {
      slug: string;
    };
  };
  body?: Array<HeroBannerContentType | ListingDynamicContentType>;
}

interface ServiceContentType {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
  fields: ServiceFields;
}

export interface NavigationContentType extends EntrySkeletonType {
  contentTypeId: 'navigation';
  sys: {
    id: string;
  };
  fields: {
    internalName: string;
    logo: {
      sys: {
        id: string;
      };
      fields: {
        title: string;
        file: {
          url: string;
          details: {
            image: {
              width: number;
              height: number;
            };
          };
        };
      };
    };
    items: Array<{
      sys: {
        id: string;
      };
      fields: {
        internalName: string;
        label: string;
        link: {
          sys: {
            id: string;
            contentType: {
              sys: {
                id: string;
              };
            };
          };
          fields: {
            slug: string;
            pageTitle?: string;
            pageDescription?: string;
            name?: string;
            parent?: {
              sys: {
                id: string;
              };
              fields: {
                slug: string;
                pageTitle?: string;
                pageDescription?: string;
              };
            };
          };
        };
        items?: Array<{
          sys: {
            id: string;
          };
          fields: {
            internalName: string;
            label: string;
            link: {
              sys: {
                id: string;
                contentType: {
                  sys: {
                    id: string;
                  };
                };
              };
              fields: {
                slug: string;
                name?: string;
                parent?: {
                  sys: {
                    id: string;
                  };
                  fields: {
                    slug: string;
                    pageTitle?: string;
                    pageDescription?: string;
                  };
                };
              };
            };
          };
        }>;
      };
    }>;
  };
}

export interface FeatureContentType extends EntrySkeletonType {
  contentTypeId: 'listingContent';
  sys: {
    id: string;
  };
  fields: {
    internalName: string;
    title: string;
    items: Array<{
      sys: {
        id: string;
      };
      fields: {
        internalName: string;
        firstName: string;
        lastName: string;
        role: string;
        internal: boolean;
        linkedIn?: string;
        twitter?: string;
        email?: string;
        bio: {
          nodeType: string;
          data: Record<string, any>;
          content: Array<{
            nodeType: string;
            data: Record<string, any>;
            content: Array<{
              nodeType: string;
              value: string;
              marks: Array<any>;
              data: Record<string, any>;
            }>;
          }>;
        };
        image: {
          fields: {
            internalName: string;
            altText: string;
            image: {
              fields: {
                title: string;
                description: string;
                file: {
                  url: string;
                  contentType: string;
                  details: {
                    size: number;
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
      };
    }>;
    background: 'Light' | 'Dark';
  };
}

export type { 
  CTAFields, 
  CTAContentType, 
  HeroBannerFields, 
  HeroBannerContentType, 
  PageFields, 
  PageContentType, 
  ServiceFields, 
  ServiceContentType,
  ListingDynamicFields,
  ListingDynamicContentType
}; 