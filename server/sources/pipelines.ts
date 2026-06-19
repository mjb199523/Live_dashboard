export interface Pipeline {
  id: string;
  name: string;
  fromCountry: string;
  toCountry: string;
  capacityBcfYr: number;
  status: 'operational' | 'reduced' | 'disrupted' | 'offline' | 'maintenance';
  coordinates: [number, number][]; // [lng, lat]
}

// Static dataset of major global pipelines (real-world geography)
const REAL_PIPELINES: Pipeline[] = [
  {
    id: 'p1',
    name: 'Nord Stream 1 (Damaged)',
    fromCountry: 'Russia',
    toCountry: 'Germany',
    capacityBcfYr: 1942,
    status: 'offline',
    coordinates: [[28.7, 60.5], [20.0, 57.0], [13.6, 54.1]]
  },
  {
    id: 'p2',
    name: 'Power of Siberia',
    fromCountry: 'Russia',
    toCountry: 'China',
    capacityBcfYr: 1340,
    status: 'operational',
    coordinates: [[112.4, 60.2], [127.5, 50.2], [135.0, 45.0]]
  },
  {
    id: 'p3',
    name: 'Keystone Pipeline',
    fromCountry: 'Canada',
    toCountry: 'USA',
    capacityBcfYr: 215, // Approx mmbbl equivalent converted for visual scale
    status: 'operational',
    coordinates: [[-113.0, 53.0], [-97.0, 40.0], [-95.0, 29.0]]
  },
  {
    id: 'p4',
    name: 'Trans-Mediterranean',
    fromCountry: 'Algeria',
    toCountry: 'Italy',
    capacityBcfYr: 1060,
    status: 'operational',
    coordinates: [[3.0, 31.0], [10.0, 36.0], [12.0, 41.0]]
  },
  {
    id: 'p5',
    name: 'Druzhba Pipeline',
    fromCountry: 'Russia',
    toCountry: 'Europe',
    capacityBcfYr: 1000,
    status: 'reduced',
    coordinates: [[50.0, 53.0], [30.0, 52.0], [15.0, 50.0]]
  },
  {
    id: 'p6',
    name: 'EastMed (Proposed)',
    fromCountry: 'Israel',
    toCountry: 'Greece',
    capacityBcfYr: 350,
    status: 'offline',
    coordinates: [[34.0, 32.0], [33.0, 34.0], [24.0, 38.0]]
  },
  {
    id: 'p7',
    name: 'Colonial Pipeline',
    fromCountry: 'USA',
    toCountry: 'USA',
    capacityBcfYr: 800,
    status: 'operational',
    coordinates: [[-95.3, 29.7], [-84.3, 33.7], [-74.0, 40.7]]
  }
];

export async function fetchPipelines(): Promise<Pipeline[]> {
  // Return static real-world geographic data. No fake status randomization.
  return REAL_PIPELINES;
}
