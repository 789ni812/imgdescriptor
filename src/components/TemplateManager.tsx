import React, { useRef } from 'react';
import { Button } from './ui/Button';
import { GameTemplate } from '@/lib/types/template';

export function TemplateManager({ onImport, getTemplate }: { onImport: (template: unknown) => void, getTemplate?: () => unknown }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImport(json as unknown);
      } catch {
        alert('Invalid template file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportClick = () => {
    if (!getTemplate) {
      alert('Export not implemented yet.');
      return;
    }
    const template = getTemplate();
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const templateName = (template as GameTemplate).name || 'template';
    a.download = `${templateName}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="flex gap-4 items-center">
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        data-testid="template-file-input"
      />
      <Button onClick={handleImportClick} variant="outline" size="sm" data-testid="import-template-btn">
        Import Template
      </Button>
      <Button onClick={handleExportClick} variant="outline" size="sm" data-testid="export-template-btn">
        Export Template
      </Button>
    </div>
  );
} 