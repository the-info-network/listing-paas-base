/**
 * Types for Analytics SDK
 */

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export interface ListingStats {
  listingId: string;
  views: number;
  uniqueViews: number;
  impressions: number;
  clicks: number;
  ctr: number;
  leads: number;
  conversions: number;
  conversionRate: number;
  averageTimeOnPage: number;
  bounceRate: number;
  favorites: number;
  shares: number;
  timeRange: TimeRange;
}

export interface ViewMetrics {
  date: string;
  views: number;
  uniqueViews: number;
  impressions: number;
}

export interface LeadMetrics {
  date: string;
  leads: number;
  conversions: number;
  conversionRate: number;
}

export interface TopListing {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  views: number;
  leads: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

export interface OverviewStats {
  totalViews: number;
  totalLeads: number;
  totalConversions: number;
  averageConversionRate: number;
  viewsTrend: number;
  leadsTrend: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface DeviceBreakdown {
  device: 'desktop' | 'mobile' | 'tablet';
  visits: number;
  percentage: number;
}

export interface AnalyticsFilters {
  listingId?: string;
  timeRange?: TimeRange;
  startDate?: string;
  endDate?: string;
}
