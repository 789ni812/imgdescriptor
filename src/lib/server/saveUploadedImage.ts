import path from 'path';
import fs from 'fs';

/**
 * Saves an uploaded image stream to public/vs/fighters/, public/vs/arena/, or public/imgRepository/ with a unique filename.
 * @param fileStream Readable stream of the uploaded file
 * @param originalFilename The original filename (to preserve extension)
 * @param category 'fighter' | 'arena' | undefined
 * @returns The public URL (e.g., /vs/fighters/filename.jpg)
 */
export async function saveUploadedImage(
  fileStream: NodeJS.ReadableStream,
  originalFilename: string,
  category?: 'fighter' | 'arena'
): Promise<string> {
  let targetDir: string;
  let publicPrefix: string;
  if (category === 'fighter') {
    targetDir = path.join(process.cwd(), 'public', 'vs', 'fighters');
    publicPrefix = '/vs/fighters/';
  } else if (category === 'arena') {
    targetDir = path.join(process.cwd(), 'public', 'vs', 'arena');
    publicPrefix = '/vs/arena/';
  } else {
    targetDir = path.join(process.cwd(), 'public', 'imgRepository');
    publicPrefix = '/imgRepository/';
  }
  await fs.promises.mkdir(targetDir, { recursive: true });
  const ext = path.extname(originalFilename);
  const base = path.basename(originalFilename, ext);
  const uniqueName = `${base}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
  const savePath = path.join(targetDir, uniqueName);
  const publicUrl = `${publicPrefix}${uniqueName}`;
  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(savePath);
    fileStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  return publicUrl;
} 