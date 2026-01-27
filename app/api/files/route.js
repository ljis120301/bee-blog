/**
 * Files API - Local Storage Version
 * ==================================
 * Handles file uploads and serving from local filesystem
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

export async function POST(request) {
  try {
    // Check authentication via session cookie
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only authors and admins can upload
    if (user.role !== 'ADMIN' && user.role !== 'AUTHOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    console.log('API: Starting file upload process');

    const formData = await request.formData();
    const file = formData.get('file');

    console.log('API: Received file:', file?.name);
    console.log('API: File size:', file?.size);

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

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 413 }
      );
    }

    // Sanitize filename - remove path components and dangerous characters
    const sanitizedName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_');

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename with sanitized extension
    const ext = path.extname(sanitizedName) || '';
    const uniqueId = uuidv4();
    const filename = `${uniqueId}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log('API: File saved to:', filepath);

    // Generate public URL
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      type: file.type,
      id: uniqueId,
      filename: filename
    });

  } catch (error) {
    console.error('API: Upload error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Upload failed'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');
    const filename = url.searchParams.get('filename');

    if (!fileId && !filename) {
      return new NextResponse('File ID or filename is required', { status: 400 });
    }

    // Try to find file
    const searchPattern = filename || fileId;
    const filepath = path.join(UPLOAD_DIR, searchPattern);

    try {
      await stat(filepath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileData = await readFile(filepath);

    // Determine content type from extension
    const ext = path.extname(searchPattern).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileData.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      }
    });

  } catch (error) {
    console.error('GET: Error:', error);
    return NextResponse.json({
      error: 'Error serving file',
      details: error.message
    }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  // Get origin from request for CORS
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'https://bee.whoisjason.me',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}