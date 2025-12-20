'use client';

import { useState, useCallback } from 'react';
import type { ExportFormat, ExportOptions } from '../types';

interface UseExportResult {
  exportData: (data: unknown[], options: ExportOptions) => Promise<string>;
  exportPDF: (data: unknown[], options?: Partial<ExportOptions>) => Promise<string>;
  exportCSV: (data: unknown[], options?: Partial<ExportOptions>) => Promise<string>;
  exportExcel: (data: unknown[], options?: Partial<ExportOptions>) => Promise<string>;
  isExporting: boolean;
  error: Error | null;
}

export function useExport(): UseExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportData = useCallback(async (data: unknown[], options: ExportOptions): Promise<string> => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch('/api/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, ...options }) });
      if (!response.ok) throw new Error('Export failed');
      const result = await response.json();
      
      // Trigger download
      if (result.downloadUrl) {
        const a = document.createElement('a');
        a.href = result.downloadUrl;
        a.download = options.filename || `export.${options.format}`;
        a.click();
      }
      
      return result.downloadUrl;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      setError(e);
      throw e;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportPDF = useCallback((data: unknown[], options?: Partial<ExportOptions>) => 
    exportData(data, { format: 'pdf', ...options } as ExportOptions), [exportData]);

  const exportCSV = useCallback((data: unknown[], options?: Partial<ExportOptions>) => 
    exportData(data, { format: 'csv', ...options } as ExportOptions), [exportData]);

  const exportExcel = useCallback((data: unknown[], options?: Partial<ExportOptions>) => 
    exportData(data, { format: 'xlsx', ...options } as ExportOptions), [exportData]);

  return { exportData, exportPDF, exportCSV, exportExcel, isExporting, error };
}
