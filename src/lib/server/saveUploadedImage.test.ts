import fs from 'fs';
import path from 'path';
import { saveUploadedImage } from './saveUploadedImage';

describe('saveUploadedImage with fighter metadata', () => {
  const fightersDir = path.join(process.cwd(), 'public', 'vs', 'fighters');
  const testImageName = 'test-fighter.jpg';
  const testJsonName = 'test-fighter.json';
  const testImagePath = path.join(fightersDir, testImageName);
  const testJsonPath = path.join(fightersDir, testJsonName);

  afterEach(() => {
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    if (fs.existsSync(testJsonPath)) fs.unlinkSync(testJsonPath);
  });

  it('creates a JSON metadata file for each uploaded fighter image', async () => {
    // Simulate a file upload
    const fileBuffer = Buffer.from('fake image data');
    const fileStream = require('stream').Readable.from(fileBuffer);
    const url = await saveUploadedImage(fileStream, testImageName, 'fighter', {
      name: 'Test Fighter',
      stats: {
        health: 100,
        strength: 10,
        agility: 8,
        luck: 5,
        defense: 3,
        size: 'medium',
        build: 'athletic',
        age: 'adult',
      },
    });
    expect(url).toMatch(/\/vs\/fighters\//);
    // Find the unique JSON file that matches the image
    const uniquePart = url.split('/').pop().replace('.jpg', '');
    const files = fs.readdirSync(fightersDir);
    console.log('Files in fightersDir:', files);
    const jsonFiles = files.filter(f => f.startsWith('test-fighter-') && f.endsWith('.json'));
    console.log('Image URL:', url);
    console.log('Expected JSON file:', uniquePart + '.json');
    console.log('Found JSON files:', jsonFiles);
    expect(jsonFiles.length).toBe(1);
    const jsonPath = path.join(fightersDir, jsonFiles[0]);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    expect(json).toMatchObject({
      name: 'Test Fighter',
      stats: expect.objectContaining({ health: 100, strength: 10 }),
      matchHistory: expect.any(Array),
    });
  });
}); 