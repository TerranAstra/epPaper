/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Data store for map interactions - BlackBox for other apps
 * Stores search queries and map coordinates for external consumption
 */

export interface MapInteractionRecord {
  timestamp: string;
  enteredText?: string;
  locationQuery?: string;
  searchQuery?: string;
  originQuery?: string;
  destinationQuery?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  mapUrl?: string;
}

class MapDataStore {
  private readonly storageKey = 'mcpmaps_blackbox_data';
  private readonly maxRecords = 1000;

  /**
   * Add a new interaction record
   */
  addRecord(record: Omit<MapInteractionRecord, 'timestamp'>): void {
    const fullRecord: MapInteractionRecord = {
      ...record,
      timestamp: new Date().toISOString(),
    };

    const allRecords = this.getAllRecords();
    allRecords.push(fullRecord);

    // Keep only the most recent records
    if (allRecords.length > this.maxRecords) {
      allRecords.shift();
    }

    localStorage.setItem(this.storageKey, JSON.stringify(allRecords));
  }

  /**
   * Get all stored records
   */
  getAllRecords(): MapInteractionRecord[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      return JSON.parse(stored) as MapInteractionRecord[];
    } catch (e) {
      console.error('Error reading stored data:', e);
      return [];
    }
  }

  /**
   * Export all data as JSON string for other apps
   */
  exportAsJson(): string {
    return JSON.stringify(this.getAllRecords(), null, 2);
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const mapDataStore = new MapDataStore();

