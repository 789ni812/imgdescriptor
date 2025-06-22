// Polyfills for Jest environment
const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream } = require('node:stream/web');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder; // 'as any' is not needed here 
global.ReadableStream = ReadableStream; 