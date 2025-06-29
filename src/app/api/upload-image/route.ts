import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedImage } from '@/lib/server/saveUploadedImage';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('[API] /api/upload-image: POST called');
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    console.log('[API] Uploads not allowed in production');
    return NextResponse.json({ error: 'Uploads are not allowed in production.' }, { status: 403 });
  }

  // Parse multipart form data
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) {
    console.log('[API] Invalid content-type:', contentType);
    return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
  }

  // Use busboy to parse multipart form data
  const Busboy = (await import('busboy')).default;
  const busboy = Busboy({ headers: Object.fromEntries(req.headers.entries()) });

  let fileUrl = '';
  let fileError: Error | null = null;

  const finished = new Promise<void>((resolve, reject) => {
    busboy.on('file', async (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; encoding: string; mimeType: string }) => {
      const actualFilename = typeof info === 'string' ? info : info.filename;
      console.log('[API] busboy file event:', { fieldname, filename: actualFilename });
      if (!actualFilename) {
        fileError = new Error('No file uploaded');
        file.resume();
        return;
      }
      try {
        fileUrl = await saveUploadedImage(file, actualFilename);
        console.log('[API] File saved:', fileUrl);
      } catch (err) {
        fileError = err instanceof Error ? err : new Error('Upload failed');
        console.error('[API] Error saving file:', fileError);
      }
    });
    busboy.on('finish', () => {
      console.log('[API] busboy finish event');
      resolve();
    });
    busboy.on('error', (err) => {
      console.error('[API] busboy error event:', err);
      reject(err);
    });
  });

  // Pipe the request body to busboy
  const reader = req.body?.getReader();
  if (!reader) {
    console.log('[API] No request body');
    return NextResponse.json({ error: 'No request body' }, { status: 400 });
  }
  let done = false;
  while (!done) {
    const { value, done: d } = await reader.read();
    if (value) {
      busboy.write(value);
      console.log('[API] busboy.write chunk', value.length);
    }
    done = d;
  }
  busboy.end();
  console.log('[API] busboy.end called');

  try {
    await finished;
    if (fileError) throw fileError;
    if (!fileUrl) throw new Error('No file uploaded');
    console.log('[API] Upload complete, returning URL:', fileUrl);
    return NextResponse.json({ url: fileUrl });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Upload failed';
    console.error('[API] Upload failed:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
} 