import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export async function POST(request) {
  try {
    console.log('API: Starting file upload process');
    
    const formData = await request.formData();
    const file = formData.get('file');
    const token = formData.get('token');

    console.log('API: Received file:', file?.name);
    console.log('API: File size:', file?.size);
    console.log('API: Token present:', !!token);

    if (!file) {
      console.error('API: No file provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    console.log('API: Creating PocketBase form data');
    const pbFormData = new FormData();
    pbFormData.append('file', file);

    console.log('API: Attempting to create record in PocketBase');
    const record = await pb.collection('files').create(pbFormData, {
      $autoCancel: false,
      $cancelKey: `upload_${Date.now()}`
    });
    console.log('API: Record created:', record.id);

    console.log('API: Generating file URL');
    const fileUrl = pb.files.getUrl(record, record.file, { 
      token: token 
    });
    console.log('API: File URL generated:', fileUrl);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      type: file.type,
      token: token,
      id: record.id
    });

  } catch (error) {
    console.error('API: Upload error:', error);
    console.error('API: Error details:', error.data);
    console.error('API: Error stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: error.message || 'Upload failed',
      details: error.data || {}
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    console.log('GET: Starting video stream request');
    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');
    
    console.log('GET: File ID:', fileId);
    
    if (!fileId) {
      console.error('GET: No file ID provided');
      return new NextResponse('File ID is required', { status: 400 });
    }

    console.log('GET: Fetching file record from PocketBase');
    const record = await pb.collection('files').getOne(fileId);
    console.log('GET: Record found:', {
      id: record.id,
      filename: record.file,
      type: record.type
    });

    console.log('GET: Generating file token');
    const fileToken = await pb.files.getToken();
    console.log('GET: Token generated:', fileToken);

    console.log('GET: Generating PocketBase file URL');
    const fileUrl = pb.files.getUrl(record, record.file, { token: fileToken });
    console.log('GET: PocketBase URL generated:', fileUrl);

    console.log('GET: Attempting to fetch file from PocketBase');
    const response = await fetch(fileUrl);
    console.log('GET: PocketBase response status:', response.status);
    
    if (!response.ok) {
      console.error('GET: PocketBase fetch failed:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Failed to fetch file from PocketBase: ${response.statusText}`);
    }

    const headers = new Headers({
      'Content-Type': record.type || 'video/mp4',
      'Content-Length': response.headers.get('content-length'),
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000'
    });

    console.log('GET: Returning file stream with headers:', Object.fromEntries(headers.entries()));
    return new NextResponse(response.body, { headers });

  } catch (error) {
    console.error('GET: Error details:', {
      message: error.message,
      data: error.data,
      stack: error.stack
    });
    return NextResponse.json({
      error: 'Error serving video',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 