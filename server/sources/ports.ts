export interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: 'port' | 'chokepoint' | 'canal';
  throughputMtpa: number;
}

// Static dataset of major global maritime chokepoints and ports
const REAL_PORTS: Port[] = [
  {
    id: 'pt1',
    name: 'Strait of Hormuz',
    country: 'Oman/Iran',
    lat: 26.56,
    lng: 56.25,
    type: 'chokepoint',
    throughputMtpa: 1050 // ~21 million bpd
  },
  {
    id: 'pt2',
    name: 'Strait of Malacca',
    country: 'Malaysia/Indonesia',
    lat: 1.43,
    lng: 103.25,
    type: 'chokepoint',
    throughputMtpa: 800 // ~16 million bpd
  },
  {
    id: 'pt3',
    name: 'Suez Canal',
    country: 'Egypt',
    lat: 30.6,
    lng: 32.34,
    type: 'canal',
    throughputMtpa: 300 // ~6 million bpd
  },
  {
    id: 'pt4',
    name: 'Bab el-Mandeb',
    country: 'Yemen/Djibouti',
    lat: 12.58,
    lng: 43.33,
    type: 'chokepoint',
    throughputMtpa: 310 // ~6.2 million bpd
  },
  {
    id: 'pt5',
    name: 'Panama Canal',
    country: 'Panama',
    lat: 9.1,
    lng: -79.68,
    type: 'canal',
    throughputMtpa: 50 // less oil, high goods
  },
  {
    id: 'pt6',
    name: 'Port of Rotterdam',
    country: 'Netherlands',
    lat: 51.95,
    lng: 4.05,
    type: 'port',
    throughputMtpa: 430
  },
  {
    id: 'pt7',
    name: 'Port of Shanghai',
    country: 'China',
    lat: 31.22,
    lng: 121.48,
    type: 'port',
    throughputMtpa: 510
  },
  {
    id: 'pt8',
    name: 'Port of Houston',
    country: 'USA',
    lat: 29.7,
    lng: -95.2,
    type: 'port',
    throughputMtpa: 275
  }
];

export async function fetchPorts(): Promise<Port[]> {
  return REAL_PORTS;
}
