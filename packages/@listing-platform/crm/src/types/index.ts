/**
 * Types for CRM SDK
 */

export interface Contact {
  id: string;
  tenantId: string;
  companyId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  address?: Address;
  avatarUrl?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  company?: Company;
}

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  annualRevenue?: number;
  description?: string;
  address?: Address;
  phone?: string;
  email?: string;
  logoUrl?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CompanySize = 
  | '1-10' 
  | '11-50' 
  | '51-200' 
  | '201-500' 
  | '501-1000' 
  | '1001+';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Deal {
  id: string;
  tenantId: string;
  name: string;
  stageId: string;
  contactId?: string;
  companyId?: string;
  value: number;
  currency: string;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  tags?: string[];
  assignedTo?: string;
  customFields?: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  company?: Company;
  stage?: DealStage;
}

export interface DealStage {
  id: string;
  tenantId: string;
  name: string;
  position: number;
  probability: number;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pipeline {
  stages: DealStage[];
  deals: Deal[];
}

export interface PipelineStage extends DealStage {
  deals: Deal[];
}

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: TaskPriority;
  status: TaskStatus;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  assignedTo?: string;
  createdBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  company?: Company;
  deal?: Deal;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  tenantId: string;
  type: ActivityType;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  description: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export type ActivityType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'note_added'
  | 'email_sent'
  | 'call_logged'
  | 'meeting_scheduled'
  | 'task_completed'
  | 'deal_won'
  | 'deal_lost'
  | 'stage_changed';

export type EntityType = 'contact' | 'company' | 'deal' | 'task';

// Filter types
export interface ContactFilters {
  search?: string;
  companyId?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at' | 'first_name' | 'last_name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  size?: CompanySize;
  sortBy?: 'created_at' | 'updated_at' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DealFilters {
  search?: string;
  stageId?: string;
  contactId?: string;
  companyId?: string;
  assignedTo?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'value' | 'expected_close_date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  assignedTo?: string;
  dueDate?: string;
  overdue?: boolean;
  sortBy?: 'created_at' | 'due_date' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ActivityFilters {
  type?: ActivityType | ActivityType[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Form data types
export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  message?: string;
  source: string;
  listingId?: string;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  companyId?: string;
  jobTitle?: string;
  department?: string;
  address?: Address;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, unknown>;
}

export interface CreateDealInput {
  name: string;
  stageId: string;
  contactId?: string;
  companyId?: string;
  value?: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  tags?: string[];
  assignedTo?: string;
  customFields?: Record<string, unknown>;
}

export interface CrmConfig {
  leadCapture: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoResponder: boolean;
  leadScoring: boolean;
  pipelineStages: string[];
}
