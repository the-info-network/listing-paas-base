# @listing-platform/favorites

Favorites and saved listings SDK for listing platforms. Allows users to save, organize, and manage their favorite listings.

## Installation

```bash
pnpm add @listing-platform/favorites
```

## Features

- **Save Listings** - Add/remove listings to favorites
- **Collections** - Organize favorites into collections
- **Saved Searches** - Save search criteria for alerts
- **Heart Button** - Ready-to-use favorite toggle button
- **Favorites List** - Display saved listings

## Usage

### Components

```tsx
import { FavoriteButton, FavoritesList, SaveSearchForm } from '@listing-platform/favorites';

// Heart button for any listing
<FavoriteButton 
  listingId="123"
  onToggle={(isFavorited) => console.log('Favorited:', isFavorited)}
/>

// Display user's favorites
<FavoritesList 
  onListingClick={(listing) => router.push(`/listings/${listing.id}`)}
/>

// Save current search
<SaveSearchForm 
  searchParams={currentSearch}
  onSave={(alertId) => console.log('Saved:', alertId)}
/>
```

### Hooks

```tsx
import { 
  useFavorites, 
  useToggleFavorite, 
  useIsFavorited,
  useSavedSearches 
} from '@listing-platform/favorites/hooks';

// Get all favorites
const { favorites, isLoading, total } = useFavorites();

// Toggle favorite status
const { toggle, isToggling } = useToggleFavorite();
await toggle('listing-123');

// Check if listing is favorited
const { isFavorited, isLoading } = useIsFavorited('listing-123');

// Get saved searches
const { savedSearches, isLoading } = useSavedSearches();
```

## Types

```tsx
import type { 
  SavedListing, 
  SavedSearch, 
  Collection 
} from '@listing-platform/favorites/types';
```

## Configuration

Enable favorites in `features.config.ts`:

```ts
platform: {
  enableSavedListings: true, // Enable favorites
  enableAlerts: true, // Enable saved searches/alerts
}
```

## License

MIT
