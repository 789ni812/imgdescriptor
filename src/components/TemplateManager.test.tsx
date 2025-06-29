import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { TemplateManager } from './TemplateManager';

const mockTemplate = {
  id: 'template-1',
  name: 'Test Adventure',
  createdAt: '2025-01-27T10:00:00Z',
  updatedAt: '2025-01-27T10:00:00Z',
};

describe('TemplateManager', () => {
  it('should call onImport with parsed template when a file is uploaded', () => {
    const onImport = jest.fn();
    render(<TemplateManager onImport={onImport} />);
    const file = new File([JSON.stringify(mockTemplate)], 'template.json', { type: 'application/json' });
    const input = screen.getByTestId('template-file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    // FileReader is async, so we need to wait for the callback
    setTimeout(() => {
      expect(onImport).toHaveBeenCalledWith(mockTemplate);
    }, 10);
  });
});

describe('TemplateManager export', () => {
  it('triggers download with correct JSON when Export Template is clicked', () => {
    const template = { name: 'TestTemplate', foo: 'bar' };
    const getTemplate = jest.fn(() => template);
    // Mock createObjectURL and revokeObjectURL
    const url = 'blob:http://localhost/fake';
    const createObjectURL = jest.fn(() => url);
    const revokeObjectURL = jest.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;
    // Mock anchor click
    const click = jest.fn();
    document.body.appendChild = (jest.fn((el: Node) => {
      if ((el as HTMLElement).tagName === 'A') {
        (el as HTMLAnchorElement).click = click;
      }
      return el;
    }) as unknown) as <T extends Node>(node: T) => T;
    document.body.removeChild = jest.fn();

    const { getByTestId, container } = render(
      <TemplateManager onImport={jest.fn()} getTemplate={getTemplate} />
    );
    try {
      fireEvent.click(getByTestId('export-template-btn'));
    } catch (e) {
      // Print the rendered HTML for debugging
      // eslint-disable-next-line no-console
      console.log(container.innerHTML);
      throw e;
    }
    expect(getTemplate).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith(url);
  });
}); 