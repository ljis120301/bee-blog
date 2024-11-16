import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Create upload session in PocketBase
    const session = await pb.collection('upload_sessions').create({
      fileId: data.fileId,
      filename: data.filename,
      fileSize: data.fileSize,
      fileType: data.fileType,
      totalChunks: data.totalChunks,
      uploadedChunks: 0,
      status: 'pending'
    });

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 