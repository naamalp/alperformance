import { PageContentType } from '@/types/contentful';

/**
 * Generates a full page slug including parent pages
 * @param page The page content from Contentful
 * @returns The full slug path (e.g. 'parent-page/child-page')
 */
export function generatePageSlug(page: PageContentType): string {
  const { slug, pageParent } = page.fields;
  
  if (pageParent) {
    const parentSlug = pageParent.fields.slug;
    return `${parentSlug}/${slug}`;
  }
  
  return slug;
}

/**
 * Generates a full page slug from a page reference
 * @param pageRef The page reference from Contentful
 * @returns The full slug path (e.g. 'parent-page/child-page')
 */
export function generateSlugFromReference(pageRef: any): string {
  if (!pageRef?.fields) {
    return '';
  }

  const { slug, pageParent } = pageRef.fields;
  
  if (pageParent?.fields?.slug) {
    return `${pageParent.fields.slug}/${slug}`;
  }
  
  return slug;
} 