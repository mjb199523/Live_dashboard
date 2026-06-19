export interface StorageFacility {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: 'petroleum' | 'natural_gas' | 'lng';
  capacityMbbls: number;
  status: 'operational' | 'reduced' | 'offline' | 'maintenance';
}

// Static dataset of major global energy storage facilities
const REAL_STORAGE: StorageFacility[] = [
  {
    id: 's1',
    name: 'Cushing Strategic Reserve',
    country: 'USA',
    lat: 35.98,
    lng: -96.76,
    type: 'petroleum',
    capacityMbbls: 90,
    status: 'operational'
  },
  {
    id: 's2',
    name: 'Fujairah Oil Terminal',
    country: 'UAE',
    lat: 25.12,
    lng: 56.33,
    type: 'petroleum',
    capacityMbbls: 70,
    status: 'operational'
  },
  {
    id: 's3',
    name: 'Rotterdam Maasvlakte',
    country: 'Netherlands',
    lat: 51.95,
    lng: 4.05,
    type: 'petroleum',
    capacityMbbls: 110,
    status: 'operational'
  },
  {
    id: 's4',
    name: 'Qingdao Strategic Reserve',
    country: 'China',
    lat: 36.06,
    lng: 120.38,
    type: 'petroleum',
    capacityMbbls: 150,
    status: 'operational'
  },
  {
    id: 's5',
    name: 'Rough Gas Storage',
    country: 'UK',
    lat: 53.8,
    lng: 0.5,
    type: 'natural_gas',
    capacityMbbls: 25, // Equivalent
    status: 'reduced'
  },
  {
    id: 's6',
    name: 'Tomakomai SPR',
    country: 'Japan',
    lat: 42.63,
    lng: 141.6,
    type: 'petroleum',
    capacityMbbls: 35,
    status: 'operational'
  },
  {
    id: 's7',
    name: 'Jurong Island Hub',
    country: 'Singapore',
    lat: 1.26,
    lng: 103.68,
    type: 'petroleum',
    capacityMbbls: 130,
    status: 'operational'
  }
];

export async function fetchStorage(): Promise<StorageFacility[]> {
  return REAL_STORAGE;
}
