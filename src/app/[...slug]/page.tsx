import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/contentful';
import { renderContent } from '@/lib/renderContent';
import { PageContentType, ServiceContentType } from '@/types/contentful';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

function isPageContent(content: PageContentType | ServiceContentType): content is PageContentType {
  return 'pageTitle' in content.fields;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug.join('/');
    console.log('Generating metadata for slug:', slug);
    
    const content = await getPageBySlug(slug);

    if (!content) {
      console.log('No content found for metadata generation');
      return {
        title: 'Page Not Found',
      };
    }

    if (isPageContent(content)) {
      return {
        title: content.fields.pageTitle,
        description: content.fields.pageDescription,
      };
    } else {
      return {
        title: content.fields.name,
        description: content.fields.shortDescription,
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
    };
  }
}

export default async function Page({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug.join('/');
    console.log('Rendering page for slug:', slug);
    
    const content = await getPageBySlug(slug);

    if (!content) {
      console.log('No content found, returning 404');
      notFound();
    }

    const title = isPageContent(content) ? content.fields.pageTitle : content.fields.name;
    console.log('Rendering content:', title);

    return (
      <main>
        {renderContent(content)}
      </main>
    );
  } catch (error) {
    console.error('Error rendering page:', error);
    throw error; // This will trigger the error boundary
  }
} 