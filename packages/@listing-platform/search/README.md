# @listing-platform/search

Advanced search SDK for listing platforms with filters, facets, and autocomplete.

## Installation

```bash
pnpm add @listing-platform/search
```

## Features

- **Full-text Search** - Fast search across listings
- **Faceted Filters** - Dynamic filter options
- **Autocomplete** - Search suggestions
- **URL Sync** - Keep filters in URL
- **Search Alerts** - Save searches for notifications

## Usage

### Components

```tsx
import { SearchBar, FilterPanel, SearchResults, FacetFilter } from '@listing-platform/search';

// Search bar with autocomplete
<SearchBar 
  placeholder="Search listings..."
  onSearch={(query) => setQuery(query)}
/>

// Filter panel
<FilterPanel 
  facets={facets}
  selectedFilters={filters}
  onFilterChange={setFilters}
/>

// Search results
<SearchResults 
  results={results}
  isLoading={isLoading}
  onListingClick={(listing) => router.push(`/listings/${listing.slug}`)}
/>
```

### Hooks

```tsx
import { useSearch, useFacets, useSearchSuggestions } from '@listing-platform/search/hooks';

// Execute search
const { results, total, isLoading } = useSearch({
  query: 'coffee shop',
  filters: { category: 'restaurants', priceRange: 'medium' },
});

// Get available facets
const { facets, isLoading } = useFacets();

// Autocomplete suggestions
const { suggestions, isLoading } = useSearchSuggestions(query);
```

## Types

```tsx
import type { SearchFilters, SearchResult, Facet } from '@listing-platform/search/types';
```

## License

MIT
