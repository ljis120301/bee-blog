/**
 * Files Init API - Local Storage Version
 * =======================================
 * Initializes an upload session (simplified for local storage)
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only authors and admins can upload
    if (user.role !== 'ADMIN' && user.role !== 'AUTHOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    // For local storage, we just generate a session ID
    // The actual upload will be handled by the main files API
    const sessionId = uuidv4();

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      fileId: data.fileId || uuidv4(),
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}