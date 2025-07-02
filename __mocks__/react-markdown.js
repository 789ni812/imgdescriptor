const React = require('react');

function parseMarkdown(children) {
  if (typeof children !== 'string') return children;
  // Simple replacements for test purposes only
  let html = children;
  // Headings
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Unordered lists
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
  if (/<li>/.test(html)) html = `<ul>${html}</ul>`;
  return React.createElement('div', { dangerouslySetInnerHTML: { __html: html } });
}

module.exports = ({ children }) => parseMarkdown(children); 