import React from 'react';
import { render } from '@testing-library/react';
import { DevDebugWrapper } from './DevDebugWrapper';

describe('DevDebugWrapper', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('when in development environment', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv, NODE_ENV: 'development' };
    });

    it('renders children and filename', () => {
      const { getByText } = render(
        <DevDebugWrapper filename="TestComponent.tsx">
          <div>Child Content</div>
        </DevDebugWrapper>,
      );
      expect(getByText('Child Content')).toBeInTheDocument();
      expect(getByText('TestComponent.tsx')).toBeInTheDocument();
    });

    it('applies a bottom margin class for spacing', () => {
      const { container } = render(
        <DevDebugWrapper filename="TestComponent.tsx">
          <div />
        </DevDebugWrapper>,
      );
      expect(container.firstChild).toHaveClass('mb-8');
    });
  });

  describe('when not in development environment', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv, NODE_ENV: 'production' };
    });

    it('does not render the wrapper and only renders children', () => {
      const { queryByText, container } = render(
        <DevDebugWrapper filename="TestComponent.tsx">
          <div>Child Content</div>
        </DevDebugWrapper>,
      );
      expect(queryByText('TestComponent.tsx')).not.toBeInTheDocument();
      expect(container.firstChild).toHaveTextContent('Child Content');
      expect(container.querySelector('div.relative')).toBeNull();
    });
  });
}); 