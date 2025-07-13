import fs from 'fs';
import path from 'path';
import { saveUploadedImage } from './saveUploadedImage';
import { glob } from 'glob';

describe('saveUploadedImage with fighter metadata', () => {
  const fightersDir = path.join(process.cwd(), 'public', 'vs', 'fighters');
  const timestamp = Date.now();
  const testImageName = `test-fighter-${timestamp}.jpg`;
  const testJsonName = `test-fighter-${timestamp}.json`;
  const testImagePath = path.join(fightersDir, testImageName);
  const testJsonPath = path.join(fightersDir, testJsonName);

  beforeEach(() => {
    // Remove all test-fighter-*.json files before each test
    const files = glob.sync(path.join(fightersDir, 'test-fighter-*.json')) || [];
    for (const file of files) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  });

  afterEach(() => {
    // Remove all test-fighter-*.json files after each test
    const files = glob.sync(path.join(fightersDir, 'test-fighter-*.json')) || [];
    for (const file of files) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
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
    const jsonFiles = files.filter(f => f === uniquePart + '.json');
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