# Map BlackBox Data

This document describes the data format stored by the maps application for use by other apps.

## Storage Location

Data is stored in browser `localStorage` under the key `mcpmaps_blackbox_data`.

## Data Format

Each record in the BlackBox follows this structure:

```typescript
interface MapInteractionRecord {
  timestamp: string;           // ISO 8601 timestamp
  enteredText?: string;         // Text typed into the input field
  locationQuery?: string;       // Location query sent to map
  searchQuery?: string;         // Search query sent to map
  originQuery?: string;        // Origin for directions
  destinationQuery?: string;   // Destination for directions
  coordinates?: {              // Lat/Lon coordinates (when available)
    latitude: number;
    longitude: number;
  };
  mapUrl?: string;             // Full Google Maps embed URL
}
```

## What Gets Recorded

1. **Entered Text**: All text typed into the input field is recorded
2. **Map Queries**: Every location search, place query, or directions request
3. **Coordinates**: When a location query can be geocoded, Lat/Lon coordinates are extracted and stored
4. **Map URLs**: The full embed URL used to display the map

## Accessing the Data

### From Browser Console

```javascript
// Get all records
const data = JSON.parse(localStorage.getItem('mcpmaps_blackbox_data') || '[]');

// Get records with coordinates
const withCoords = data.filter(r => r.coordinates);

// Get all entered text
const allText = data.map(r => r.enteredText).filter(Boolean);
```

### Export Function

Click the "Export BlackBox Data" button in the UI to download a JSON file containing all stored records.

### From Other Apps

Other apps can read the exported JSON file, or if running in the same browser context, access `localStorage.getItem('mcpmaps_blackbox_data')`.

## Limitations

- **Map Clicks**: Direct clicks on the embedded Google Maps iframe cannot be captured due to cross-origin restrictions. However, all location queries are geocoded to extract coordinates.
- **Coordinate Extraction**: Coordinates are only extracted when a location query can be successfully geocoded via the Google Maps Geocoding API.
- **Storage Limit**: The BlackBox stores up to 1000 most recent records.

## Example Record

```json
{
  "timestamp": "2025-01-27T12:34:56.789Z",
  "enteredText": "San Francisco",
  "locationQuery": "San Francisco",
  "coordinates": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "mapUrl": "https://www.google.com/maps/embed/v1/place?key=...&q=San+Francisco"
}
```

