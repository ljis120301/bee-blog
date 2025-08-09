import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export async function POST(request) {
  try {
    // AuthN: require bearer token and validate with PocketBase
    const authHeader = request.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!bearer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // Temporarily set token and verify
    pb.authStore.save(bearer, null);
    try {
      await pb.collection('users').authRefresh();
    } catch (e) {
      pb.authStore.clear();
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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

    // Basic MIME allowlist
    const allowed = ['image/', 'video/'];
    const type = (file?.type || '').toLowerCase();
    if (!allowed.some(p => type.startsWith(p))) {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 415 });
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

    const response = NextResponse.json({
      success: true,
      url: fileUrl,
      type: file.type,
      token: token,
      id: record.id
    });

    // Clear server auth store after request completes
    pb.authStore.clear();
    return response;

  } catch (error) {
    console.error('API: Upload error:', error);
    console.error('API: Error details:', error.data);
    console.error('API: Error stack:', error.stack);
    pb.authStore.clear();
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
    const inlineToken = url.searchParams.get('token');
    
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

    // Prefer inline token if provided from upload response
    let fileToken = inlineToken || null;
    if (!fileToken) {
      console.log('GET: Generating file token');
      try {
        fileToken = await pb.files.getToken();
      } catch (e) {
        console.warn('GET: File token failed, continuing without token (public file?)');
      }
    }
    console.log('GET: Using token:', !!fileToken);

    console.log('GET: Generating PocketBase file URL');
    const fileUrl = pb.files.getUrl(record, record.file, fileToken ? { token: fileToken } : {});
    console.log('GET: PocketBase URL generated:', fileUrl);

    console.log('GET: Attempting to fetch file from PocketBase');
    // Forward range header if provided for streaming/seek
    const range = request.headers.get('range');
    let response = await fetch(fileUrl, {
      headers: range ? { range } : undefined
    });
    console.log('GET: PocketBase response status:', response.status);
    
    if (!response.ok) {
      console.error('GET: PocketBase fetch failed:', {
        status: response.status,
        statusText: response.statusText
      });
      // Fallback: try without range if partial request was denied
      if (range) {
        const fallbackRes = await fetch(fileUrl);
        if (fallbackRes.ok) {
          response = fallbackRes;
        } else {
          throw new Error(`Failed to fetch file from PocketBase: ${response.statusText}`);
        }
      } else {
        throw new Error(`Failed to fetch file from PocketBase: ${response.statusText}`);
      }
    }

    const contentType = response.headers.get('content-type') || record.type || 'application/octet-stream';
    const isPartial = response.status === 206 || !!range;
    const headers = new Headers({
      'Content-Type': contentType,
      ...(response.headers.get('content-length') ? { 'Content-Length': response.headers.get('content-length') } : {}),
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000'
    });
    const status = isPartial ? 206 : 200;

    console.log('GET: Returning file stream with headers:', Object.fromEntries(headers.entries()), 'status:', status);
    return new NextResponse(response.body, { headers, status });

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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}