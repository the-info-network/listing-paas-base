/**
 * Types for Forms SDK
 */
export type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'time' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 'image' | 'rating' | 'range';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: unknown;
  options?: FieldOption[];
  validation?: ValidationRule[];
  conditions?: FieldCondition[];
  metadata?: Record<string, unknown>;
}

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: unknown;
  message: string;
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty';
  value?: unknown;
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  submitLabel?: string;
  successMessage?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string;
}
