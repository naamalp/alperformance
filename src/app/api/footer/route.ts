import { NextResponse } from 'next/server';
import { getContentfulClient } from '@/lib/contentful';

export async function GET() {
  try {
    const client = getContentfulClient();
    const response = await client.delivery.getEntry('7FMIdPlW6GP9JdFGBZcKlM', {
      include: 2 // Include 2 levels of linked entries
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching footer content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer content' },
      { status: 500 }
    );
  }
} 