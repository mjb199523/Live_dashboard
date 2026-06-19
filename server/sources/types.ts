/** Shared data types for backend sources and API responses */

export interface NormalizedEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  metadata: Record<string, unknown>;
}

export interface DataSourceStatus {
  status: 'EMPTY' | 'STALE' | 'LIVE';
  lastUpdated: string | null;
  ageMinutes: number;
  isDemo: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    source: string;
    lastUpdated: string;
    isDemo: boolean;
    count: number;
  };
}

export interface CIIScore {
  countryCode: string;
  countryName: string;
  score: number;
  breakdown: {
    conflict: number;
    protest: number;
    economic: number;
    military: number;
    infrastructure: number;
  };
  recentEvents: Array<{
    title: string;
    type: string;
    timestamp: string;
  }>;
}

export interface PipelineEntry {
  id: string;
  name: string;
  fromCountry: string;
  toCountry: string;
  capacityBcfYr: number;
  status: 'operational' | 'reduced' | 'disrupted' | 'offline';
  coordinates: [number, number][];
}

export interface StorageFacility {
  id: string;
  name: string;
  country: string;
  type: 'petroleum' | 'natural_gas' | 'lng';
  capacityMbbls: number;
  status: 'operational' | 'maintenance' | 'offline';
  lat: number;
  lng: number;
}

export interface PortEntry {
  id: string;
  name: string;
  country: string;
  type: 'port' | 'chokepoint' | 'canal';
  throughputMtpa: number;
  lat: number;
  lng: number;
}

export interface FlightEntry {
  icao24: string;
  callsign: string;
  originCountry: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  heading: number;
  onGround: boolean;
}

export interface MarketSignal {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'flat';
  weight: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
  category?: string;
}

export interface FuelShortageEntry {
  id: string;
  country: string;
  region: string;
  fuelType: string;
  severity: 'low' | 'moderate' | 'severe' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
}
