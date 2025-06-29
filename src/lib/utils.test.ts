import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { saveUploadedImage } from './server/saveUploadedImage';

describe('saveUploadedImage', () => {
  const imgRepoPath = path.join(process.cwd(), 'public', 'imgRepository');
  const testBuffer = Buffer.from('fake image data');
  const testFilename = 'test-image.jpg';

  afterAll(() => {
    // Clean up any test images
    if (fs.existsSync(imgRepoPath)) {
      const files = fs.readdirSync(imgRepoPath);
      files.forEach(f => {
        if (f.startsWith('test-image')) fs.unlinkSync(path.join(imgRepoPath, f));
      });
    }
  });

  it('saves the image and returns the correct URL', async () => {
    const stream = Readable.from(testBuffer);
    const url = await saveUploadedImage(stream, testFilename);
    expect(url).toMatch(/^\/imgRepository\/test-image-\d+-[a-z0-9]{6}\.jpg$/);
    const filename = url.replace('/imgRepository/', '');
    const savedPath = path.join(imgRepoPath, filename);
    expect(fs.existsSync(savedPath)).toBe(true);
    // Optionally, check file contents
    const savedData = fs.readFileSync(savedPath);
    expect(savedData.equals(testBuffer)).toBe(true);
  });
}); 