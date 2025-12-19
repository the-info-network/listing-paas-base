'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { useExport } from '../hooks/useExport';
import type { ExportFormat } from '../types';

export interface ExportMenuProps {
  data: unknown[];
  formats?: ExportFormat[];
  filename?: string;
  className?: string;
}

export function ExportMenu({ data, formats = ['pdf', 'csv', 'xlsx'], filename, className }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportData, isExporting } = useExport();

  const formatLabels: Record<ExportFormat, string> = { pdf: 'PDF Document', csv: 'CSV Spreadsheet', xlsx: 'Excel Workbook', json: 'JSON Data' };
  const formatIcons: Record<ExportFormat, string> = { pdf: '📄', csv: '📊', xlsx: '📈', json: '{ }' };

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);
    exportData(data, { format, filename });
  };

  return (
    <div className={cn('relative', className)}>
      <button onClick={() => setIsOpen(!isOpen)} disabled={isExporting || data.length === 0} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
        <span>⬇️</span>
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        <span>▼</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md border bg-white shadow-lg z-10">
          {formats.map(format => (
            <button key={format} onClick={() => handleExport(format)} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
              <span>{formatIcons[format]}</span>
              <span>{formatLabels[format]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
