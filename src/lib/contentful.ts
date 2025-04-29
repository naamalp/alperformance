import { createClient } from 'contentful';

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
    return entries.items;
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