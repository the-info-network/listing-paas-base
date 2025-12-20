# @listing-platform/maps

Maps and location SDK for listing platforms. Supports multiple map providers (Mapbox, Google Maps, OpenStreetMap) with a unified API.

## Installation

```bash
pnpm add @listing-platform/maps

# Install your preferred map provider
pnpm add mapbox-gl  # For Mapbox
# or
pnpm add @react-google-maps/api  # For Google Maps
# or
pnpm add leaflet react-leaflet  # For OpenStreetMap
```

## Features

- **Multi-Provider Support** - Mapbox, Google Maps, OpenStreetMap
- **Interactive Maps** - Pan, zoom, markers, and clusters
- **Geocoding** - Address to coordinates conversion
- **Service Areas** - Polygon overlays for business service areas
- **Nearby Search** - Find listings within a radius
- **Headless Components** - Full customization with render props

## Usage

### Components

```tsx
import { Map, Marker, ServiceArea, ListingCluster } from '@listing-platform/maps';

// Basic map with markers
<Map 
  center={{ lat: 37.7749, lng: -122.4194 }}
  zoom={12}
  provider="mapbox"
>
  <Marker 
    position={{ lat: 37.7749, lng: -122.4194 }} 
    title="San Francisco"
  />
  <ServiceArea polygon={serviceAreaCoords} />
</Map>

// Map with clustered listing markers
<Map center={center} zoom={10} provider="mapbox">
  <ListingCluster listings={listings} />
</Map>
```

### Hooks

```tsx
import { useMap, useGeocode, useNearbyListings, useServiceArea } from '@listing-platform/maps/hooks';

// Initialize map
const { map, isLoading, error } = useMap({
  center: { lat: 37.7749, lng: -122.4194 },
  provider: 'mapbox',
});

// Geocode an address
const { geocode, isLoading } = useGeocode();
const result = await geocode('123 Main St, San Francisco, CA');
// result: { lat: 37.7749, lng: -122.4194, formatted: '123 Main St...' }

// Find nearby listings
const { listings, isLoading } = useNearbyListings(
  { lat: 37.7749, lng: -122.4194 },
  { radiusKm: 10 }
);

// Get service area for a listing
const { serviceArea, isLoading } = useServiceArea(listingId);
```

### Headless Components

```tsx
import { MapHeadless } from '@listing-platform/maps/headless';

<MapHeadless
  center={{ lat: 37.7749, lng: -122.4194 }}
  provider="mapbox"
  renderMap={(props) => <YourMapComponent {...props} />}
  renderMarker={(props) => <YourMarker {...props} />}
  renderLoading={() => <YourLoader />}
/>
```

## Types

```tsx
import type { 
  MapConfig, 
  Marker, 
  ServiceArea, 
  Neighborhood,
  GeocodingResult,
  Coordinates 
} from '@listing-platform/maps/types';
```

## Configuration

Configure map settings in `features.config.ts`:

```ts
maps: {
  enabled: true,
  provider: 'mapbox', // 'mapbox', 'google', 'openstreetmap'
  config: {
    apiKey: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    defaultZoom: 12,
    defaultCenter: { lat: 37.7749, lng: -122.4194 },
    clustering: true,
    clusterRadius: 50,
    maxZoom: 18,
    showUserLocation: true,
    enableDirections: true,
    style: 'mapbox://styles/mapbox/streets-v12',
  },
}
```

## Database Schema

This SDK works with the maps schema defined in `database/schema/features/maps.sql`, which includes:
- `listing_service_areas` - Service area definitions
- `listing_nearby_places` - Points of interest
- `neighborhoods` - Neighborhood data

## License

MIT
