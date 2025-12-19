/**
 * Types for Export SDK
 */
export type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  template?: string;
  includeImages?: boolean;
  columns?: string[];
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: ExportFormat;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  description?: string;
  preview?: string;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}
