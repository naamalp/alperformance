import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Add your email service integration here
    // Example: Send email using a service like SendGrid, AWS SES, etc.
    console.log('Contact form submission:', body);

    // For now, we'll just return a success response
    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
} 