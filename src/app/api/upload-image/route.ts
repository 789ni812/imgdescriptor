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
  let uploadCategory: 'fighter' | 'arena' | undefined = undefined;
  let uploadedFile: { buffer: Buffer; filename: string } | null = null;
  const fileSavePromises: Promise<void>[] = [];

  busboy.on('field', (fieldname: string, val: string) => {
    console.log('[API] busboy field event:', { fieldname, val }); // <-- Debug log
    if (fieldname === 'category' && (val === 'fighter' || val === 'arena')) {
      uploadCategory = val;
      console.log('[API] uploadCategory set to:', uploadCategory); // <-- Debug log
    }
  });

  const finished = new Promise<void>((resolve, reject) => {
    busboy.on('file', async (fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; encoding: string; mimeType: string }) => {
      const actualFilename = typeof info === 'string' ? info : info.filename;
      console.log('[API] busboy file event:', { fieldname, filename: actualFilename });
      if (!actualFilename) {
        fileError = new Error('No file uploaded');
        file.resume();
        return;
      }
      
      // Collect the file data as a buffer
      const chunks: Buffer[] = [];
      file.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        uploadedFile = { buffer, filename: actualFilename };
        console.log('[API] File buffer collected, size:', buffer.length);
      });
      file.on('error', (err) => {
        console.error('[API] File stream error:', err);
        fileError = err;
      });
    });
    busboy.on('finish', async () => {
      console.log('[API] busboy finish event');
      console.log('[API] uploadCategory value at finish:', uploadCategory); // <-- Debug log
      
      // Process the file after all fields have been processed
      if (uploadedFile) {
        // Write the buffer directly to a file using fs
        const fs = await import('fs');
        const path = await import('path');
        
        // Determine the target directory and public prefix based on category
        let targetDir: string;
        let publicPrefix: string;
        if (uploadCategory === 'fighter') {
          targetDir = path.join(process.cwd(), 'public', 'vs', 'fighters');
          publicPrefix = '/vs/fighters/';
        } else if (uploadCategory === 'arena') {
          targetDir = path.join(process.cwd(), 'public', 'vs', 'arena');
          publicPrefix = '/vs/arena/';
        } else {
          targetDir = path.join(process.cwd(), 'public', 'imgRepository');
          publicPrefix = '/imgRepository/';
        }
        
        // Create directory if it doesn't exist
        fs.mkdirSync(targetDir, { recursive: true });
        
        // Generate unique filename
        const ext = path.extname(uploadedFile.filename);
        const base = path.basename(uploadedFile.filename, ext);
        const uniqueName = `${base}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
        const savePath = path.join(targetDir, uniqueName);
        const publicUrl = `${publicPrefix}${uniqueName}`;
        
        // Write the buffer to file
        fs.writeFileSync(savePath, uploadedFile.buffer);
        fileUrl = publicUrl;
        console.log('[API] File saved:', fileUrl);
      }
      
      await Promise.all(fileSavePromises);
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