# @listing-platform/analytics

Analytics and insights SDK for listing owners. Provides views, leads, and conversion metrics.

## Installation

```bash
pnpm add @listing-platform/analytics
```

## Features

- **View Metrics** - Track listing views and impressions
- **Lead Tracking** - Monitor inquiries and conversions
- **Performance Insights** - Compare listing performance
- **Charts & Graphs** - Visualize trends over time

## Usage

### Components

```tsx
import { StatsOverview, ViewsChart, LeadFunnel, TopListings } from '@listing-platform/analytics';

// Stats overview cards
<StatsOverview listingId={listingId} timeRange="30d" />

// Views over time chart
<ViewsChart listingId={listingId} timeRange="30d" />

// Lead conversion funnel
<LeadFunnel listingId={listingId} />

// Top performing listings
<TopListings limit={5} />
```

### Hooks

```tsx
import { useListingStats, useViewMetrics, useLeadMetrics } from '@listing-platform/analytics/hooks';

// Get listing statistics
const { stats, isLoading } = useListingStats(listingId, { timeRange: '30d' });

// Get view metrics
const { views, impressions, isLoading } = useViewMetrics(listingId, { timeRange: '7d' });

// Get lead metrics
const { leads, conversions, conversionRate } = useLeadMetrics(listingId);
```

## Types

```tsx
import type { ListingStats, ViewMetrics, LeadMetrics, TimeRange } from '@listing-platform/analytics/types';
```

## License

MIT
