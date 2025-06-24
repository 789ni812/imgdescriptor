import React from 'react';
import { render, screen } from '@testing-library/react';

// Custom mock for react-markdown to simulate HTML output for common markdown
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => {
    // Very basic simulation for test purposes only
    let content = children as string;
    // Bold (**text** or __text__)
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/__(.*?)__/g, '<strong>$1</strong>');
    // Italic (*text* or _text_)
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/_(.*?)_/g, '<em>$1</em>');
    // Headings (#, ##)
    content = content.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    content = content.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    // Lists
    content = content.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    content = content.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    // Code blocks
    content = content.replace(/```([\s\S]*?)```/g, '<code>$1</code>');
    // Inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Links
    content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Blockquotes
    content = content.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
    // Return as dangerouslySetInnerHTML for test purposes
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  },
}));

import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('should render plain text without markdown', () => {
    const content = 'This is plain text';
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText('This is plain text')).toBeInTheDocument();
  });

  it('should render bold text correctly', () => {
    const content = 'This is **bold** text';
    render(<MarkdownRenderer content={content} />);
    
    const boldElement = screen.getByText('bold');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('should render italic text correctly', () => {
    const content = 'This is *italic* text';
    render(<MarkdownRenderer content={content} />);
    
    const italicElement = screen.getByText('italic');
    expect(italicElement).toBeInTheDocument();
    expect(italicElement.tagName).toBe('EM');
  });

  it('should render headings correctly', () => {
    const content = '# Main Heading\n## Sub Heading';
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText('Main Heading')).toBeInTheDocument();
    expect(screen.getByText('Sub Heading')).toBeInTheDocument();
    
    const mainHeading = screen.getByText('Main Heading');
    const subHeading = screen.getByText('Sub Heading');
    
    expect(mainHeading.tagName).toBe('H1');
    expect(subHeading.tagName).toBe('H2');
  });

  it('should render lists correctly', () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('should render numbered lists correctly', () => {
    const content = '1. First item\n2. Second item\n3. Third item';
    render(<MarkdownRenderer content={content} />);
    
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(screen.getByText('Third item')).toBeInTheDocument();
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('should render code blocks correctly', () => {
    const content = '```\nconst example = "code";\n```';
    render(<MarkdownRenderer content={content} />);
    
    const codeElement = screen.getByText('const example = "code";');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.tagName).toBe('CODE');
  });

  it('should render inline code correctly', () => {
    const content = 'Use the `console.log()` function';
    render(<MarkdownRenderer content={content} />);
    
    const codeElement = screen.getByText('console.log()');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.tagName).toBe('CODE');
  });

  it('should render links correctly', () => {
    const content = '[Click here](https://example.com)';
    render(<MarkdownRenderer content={content} />);
    
    const linkElement = screen.getByRole('link', { name: 'Click here' });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://example.com');
  });

  it('should render blockquotes correctly', () => {
    const content = '> This is a quote\n> With multiple lines';
    render(<MarkdownRenderer content={content} />);
    
    const quoteElement = screen.getByText('This is a quote');
    expect(quoteElement).toBeInTheDocument();
    expect(quoteElement.closest('blockquote')).toBeInTheDocument();
  });

  it('should handle empty content gracefully', () => {
    render(<MarkdownRenderer content="" />);
    
    const container = screen.getByTestId('markdown-renderer');
    expect(container).toBeInTheDocument();
    // The container will have the ReactMarkdown component inside, so it's not empty
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should apply custom className when provided', () => {
    const content = 'Test content';
    const customClass = 'custom-markdown-class';
    
    render(<MarkdownRenderer content={content} className={customClass} />);
    
    const container = screen.getByTestId('markdown-renderer');
    expect(container).toHaveClass(customClass);
  });

  it('should render complex markdown combinations', () => {
    const content = `
# Story Title

This is a **bold** and *italic* story with some \`code\`.

## Characters
- **Hero**: Brave warrior
- **Villain**: Evil sorcerer

> "This is a memorable quote from the story."

The story continues with [more details](https://example.com).
    `;
    
    render(<MarkdownRenderer content={content} />);
    
    // Check headings
    expect(screen.getByText('Story Title')).toBeInTheDocument();
    expect(screen.getByText('Characters')).toBeInTheDocument();
    
    // Check bold and italic
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
    
    // Check code
    expect(screen.getByText('code')).toBeInTheDocument();
    
    // Check list items
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('Villain')).toBeInTheDocument();
    
    // Check quote
    const quote = screen.getByText((content, element) => {
      return element?.tagName === 'BLOCKQUOTE' && content.includes('memorable quote from the story');
    });
    expect(quote).toBeInTheDocument();
    
    // Check link
    expect(screen.getByRole('link', { name: 'more details' })).toBeInTheDocument();
  });
}); 