import path from 'path';
import fs from 'fs';

/**
 * Saves an uploaded image stream to public/imgRepository/ with a unique filename.
 * @param fileStream Readable stream of the uploaded file
 * @param originalFilename The original filename (to preserve extension)
 * @returns The public URL (e.g., /imgRepository/filename.jpg)
 */
export async function saveUploadedImage(fileStream: NodeJS.ReadableStream, originalFilename: string): Promise<string> {
  const imgRepoPath = path.join(process.cwd(), 'public', 'imgRepository');
  await fs.promises.mkdir(imgRepoPath, { recursive: true });
  const ext = path.extname(originalFilename);
  const base = path.basename(originalFilename, ext);
  const uniqueName = `${base}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
  const savePath = path.join(imgRepoPath, uniqueName);
  const publicUrl = `/imgRepository/${uniqueName}`;
  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(savePath);
    fileStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  return publicUrl;
} 