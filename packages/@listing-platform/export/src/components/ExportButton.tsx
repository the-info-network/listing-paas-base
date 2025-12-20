'use client';

import React from 'react';
import { cn } from '../utils/cn';
import { useExport } from '../hooks/useExport';
import type { ExportFormat } from '../types';

export interface ExportButtonProps {
  data: unknown[];
  format: ExportFormat;
  filename?: string;
  label?: string;
  className?: string;
}

export function ExportButton({ data, format, filename, label, className }: ExportButtonProps) {
  const { exportData, isExporting } = useExport();

  const formatLabels: Record<ExportFormat, string> = { pdf: 'PDF', csv: 'CSV', xlsx: 'Excel', json: 'JSON' };
  const formatIcons: Record<ExportFormat, string> = { pdf: '📄', csv: '📊', xlsx: '📈', json: '{ }' };

  const handleClick = () => { exportData(data, { format, filename }); };

  return (
    <button onClick={handleClick} disabled={isExporting || data.length === 0} className={cn('inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50', isExporting && 'opacity-50', className)}>
      <span>{formatIcons[format]}</span>
      <span>{isExporting ? 'Exporting...' : label || `Export ${formatLabels[format]}`}</span>
    </button>
  );
}
