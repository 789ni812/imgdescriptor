import path from 'path';
import fs from 'fs';

/**
 * Saves an uploaded image stream to public/vs/fighters/, public/vs/arena/, or public/imgRepository/ with a unique filename.
 * @param fileStream Readable stream of the uploaded file
 * @param originalFilename The original filename (to preserve extension)
 * @param category 'fighter' | 'arena' | undefined
 * @param metadata Optional metadata for fighters (name, stats)
 * @returns The public URL (e.g., /vs/fighters/filename.jpg)
 */
export async function saveUploadedImage(
  fileStream: NodeJS.ReadableStream,
  originalFilename: string,
  category?: 'fighter' | 'arena',
  metadata?: { name: string; stats: Record<string, unknown> }
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
  let base = path.basename(originalFilename, ext);
  // Sanitize the base filename to remove unsafe characters
  base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${base}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`;
  const savePath = path.join(targetDir, uniqueName);
  const publicUrl = `${publicPrefix}${uniqueName}`;
  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(savePath);
    fileStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  // If fighter metadata is provided, create/update the JSON file
  if (category === 'fighter' && metadata) {
    const jsonName = uniqueName.replace(ext, '.json');
    const jsonPath = path.join(targetDir, jsonName);
    const fighterData = {
      name: metadata.name,
      image: uniqueName,
      stats: metadata.stats,
      matchHistory: [],
    };
    await fs.promises.writeFile(jsonPath, JSON.stringify(fighterData, null, 2), 'utf-8');
  }
  return publicUrl;
} 