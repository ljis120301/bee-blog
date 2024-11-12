import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export async function POST(request) {
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // Set a timeout of 5 minutes for very large files
    const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

    // Forward the request to PocketBase with streaming enabled
    const record = await pb.collection('files').create(formData, {
      signal,
      // Enable streaming for large files
      $autoCancel: false,
      requestKey: null
    });

    clearTimeout(timeout);

    // Get the file URL immediately after upload completes
    const fileUrl = pb.getFileUrl(record, record.file);

    // Return a streaming response
    return new NextResponse(
      JSON.stringify({ 
        url: fileUrl,
        success: true 
      }), {
      headers: {
        'Content-Type': 'application/json',
        // Disable buffering to enable streaming
        'X-Accel-Buffering': 'no',
        // Prevent caching of the response
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message }, 
      { 
        status: error.name === 'AbortError' ? 408 : 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  }
}

// Increase the maximum request size limit for large files
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}; 