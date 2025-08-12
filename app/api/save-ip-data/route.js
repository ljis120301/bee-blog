import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'ip-data.json');

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request) {
  try {
    const data = await request.json();

    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });

    let existingData = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (_) {
      // start fresh
    }

    const newEntry = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    existingData.push(newEntry);

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving IP data:', error);
    return NextResponse.json({ error: 'Failed to save IP data' }, { status: 500 });
  }
}


