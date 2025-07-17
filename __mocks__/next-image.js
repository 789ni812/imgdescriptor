const React = require('react');

// Mock Next.js Image component for Jest tests
// This allows tests to work with Image components without needing actual image optimization
const MockImage = ({ src, alt, width, height, className, style, ...props }) => {
  return React.createElement('img', {
    src,
    alt,
    width,
    height,
    className,
    style,
    role: 'img', // Explicitly set role for testing
    ...props,
    // Add data attributes for testing
    'data-testid': props['data-testid'] || 'next-image',
    'data-src': src,
  });
};

module.exports = MockImage;
module.exports.default = MockImage; 