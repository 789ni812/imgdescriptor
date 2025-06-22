import React from 'react';
import { render, screen } from '@testing-library/react';
import { DevDebugWrapper } from './DevDebugWrapper';

describe('DevDebugWrapper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders its children', () => {
    render(
      <DevDebugWrapper filename="test.tsx">
        <div>Test Child</div>
      </DevDebugWrapper>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('displays the filename with correct styling', () => {
    render(
      <DevDebugWrapper filename="test.tsx">
        <div>Test Child</div>
      </DevDebugWrapper>
    );

    const filenameElement = screen.getByText('test.tsx');
    expect(filenameElement).toBeInTheDocument();
    expect(filenameElement).toHaveClass(
      'absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500'
    );
  });

  it('renders a styled border wrapper', () => {
    const { container } = render(
      <DevDebugWrapper filename="test.tsx">
        <div>Test Child</div>
      </DevDebugWrapper>
    );

    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveClass('relative border border-gray-200 p-2');
  });
}); 