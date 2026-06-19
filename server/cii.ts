/** Country Instability Index — composite scoring engine */

import { fetchConflicts } from './sources/conflicts.js';
import { cache } from './cache.js';
import type { CIIScore } from './sources/types.js';

const CACHE_KEY = 'cii_scores';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Country data with baseline risk factors
const COUNTRIES: Record<string, { name: string; baseConflict: number; baseProtest: number; baseEconomic: number; baseMilitary: number; baseInfra: number }> = {
  UKR: { name: 'Ukraine', baseConflict: 95, baseProtest: 30, baseEconomic: 70, baseMilitary: 90, baseInfra: 75 },
  SYR: { name: 'Syria', baseConflict: 85, baseProtest: 25, baseEconomic: 80, baseMilitary: 75, baseInfra: 70 },
  YEM: { name: 'Yemen', baseConflict: 80, baseProtest: 20, baseEconomic: 85, baseMilitary: 65, baseInfra: 80 },
  SDN: { name: 'Sudan', baseConflict: 75, baseProtest: 40, baseEconomic: 70, baseMilitary: 60, baseInfra: 65 },
  MMR: { name: 'Myanmar', baseConflict: 70, baseProtest: 45, baseEconomic: 60, baseMilitary: 55, baseInfra: 50 },
  COD: { name: 'DR Congo', baseConflict: 70, baseProtest: 30, baseEconomic: 65, baseMilitary: 50, baseInfra: 60 },
  SOM: { name: 'Somalia', baseConflict: 75, baseProtest: 15, baseEconomic: 80, baseMilitary: 45, baseInfra: 75 },
  AFG: { name: 'Afghanistan', baseConflict: 65, baseProtest: 20, baseEconomic: 75, baseMilitary: 40, baseInfra: 65 },
  LBY: { name: 'Libya', baseConflict: 55, baseProtest: 30, baseEconomic: 50, baseMilitary: 45, baseInfra: 55 },
  IRQ: { name: 'Iraq', baseConflict: 50, baseProtest: 35, baseEconomic: 40, baseMilitary: 40, baseInfra: 45 },
  LBN: { name: 'Lebanon', baseConflict: 45, baseProtest: 55, baseEconomic: 75, baseMilitary: 35, baseInfra: 50 },
  VEN: { name: 'Venezuela', baseConflict: 25, baseProtest: 50, baseEconomic: 80, baseMilitary: 20, baseInfra: 55 },
  HTI: { name: 'Haiti', baseConflict: 55, baseProtest: 35, baseEconomic: 75, baseMilitary: 15, baseInfra: 65 },
  MOZ: { name: 'Mozambique', baseConflict: 45, baseProtest: 15, baseEconomic: 45, baseMilitary: 25, baseInfra: 40 },
  ETH: { name: 'Ethiopia', baseConflict: 50, baseProtest: 35, baseEconomic: 40, baseMilitary: 40, baseInfra: 35 },
  NGA: { name: 'Nigeria', baseConflict: 40, baseProtest: 30, baseEconomic: 45, baseMilitary: 30, baseInfra: 40 },
  PAK: { name: 'Pakistan', baseConflict: 35, baseProtest: 40, baseEconomic: 50, baseMilitary: 35, baseInfra: 30 },
  BGD: { name: 'Bangladesh', baseConflict: 15, baseProtest: 45, baseEconomic: 35, baseMilitary: 10, baseInfra: 25 },
  GEO: { name: 'Georgia', baseConflict: 15, baseProtest: 50, baseEconomic: 25, baseMilitary: 20, baseInfra: 15 },
  IND: { name: 'India', baseConflict: 20, baseProtest: 25, baseEconomic: 15, baseMilitary: 25, baseInfra: 10 },
  CHN: { name: 'China', baseConflict: 10, baseProtest: 10, baseEconomic: 20, baseMilitary: 30, baseInfra: 5 },
  RUS: { name: 'Russia', baseConflict: 30, baseProtest: 15, baseEconomic: 35, baseMilitary: 50, baseInfra: 20 },
  IRN: { name: 'Iran', baseConflict: 20, baseProtest: 35, baseEconomic: 45, baseMilitary: 35, baseInfra: 15 },
  ISR: { name: 'Israel', baseConflict: 50, baseProtest: 30, baseEconomic: 10, baseMilitary: 55, baseInfra: 15 },
  PSE: { name: 'Palestine', baseConflict: 80, baseProtest: 50, baseEconomic: 70, baseMilitary: 60, baseInfra: 75 },
  TUR: { name: 'Turkey', baseConflict: 20, baseProtest: 20, baseEconomic: 30, baseMilitary: 25, baseInfra: 10 },
  USA: { name: 'United States', baseConflict: 5, baseProtest: 15, baseEconomic: 10, baseMilitary: 10, baseInfra: 5 },
  GBR: { name: 'United Kingdom', baseConflict: 3, baseProtest: 10, baseEconomic: 10, baseMilitary: 5, baseInfra: 3 },
  DEU: { name: 'Germany', baseConflict: 2, baseProtest: 8, baseEconomic: 8, baseMilitary: 5, baseInfra: 2 },
  FRA: { name: 'France', baseConflict: 3, baseProtest: 20, baseEconomic: 10, baseMilitary: 5, baseInfra: 3 },
  BRA: { name: 'Brazil', baseConflict: 15, baseProtest: 20, baseEconomic: 25, baseMilitary: 5, baseInfra: 15 },
  ARG: { name: 'Argentina', baseConflict: 5, baseProtest: 30, baseEconomic: 40, baseMilitary: 3, baseInfra: 10 },
  CUB: { name: 'Cuba', baseConflict: 5, baseProtest: 25, baseEconomic: 60, baseMilitary: 5, baseInfra: 40 },
  LKA: { name: 'Sri Lanka', baseConflict: 10, baseProtest: 30, baseEconomic: 55, baseMilitary: 10, baseInfra: 25 },
  MLI: { name: 'Mali', baseConflict: 55, baseProtest: 15, baseEconomic: 50, baseMilitary: 35, baseInfra: 45 },
  BFA: { name: 'Burkina Faso', baseConflict: 60, baseProtest: 15, baseEconomic: 45, baseMilitary: 35, baseInfra: 40 },
  NER: { name: 'Niger', baseConflict: 45, baseProtest: 10, baseEconomic: 50, baseMilitary: 30, baseInfra: 40 },
  CAF: { name: 'Central African Republic', baseConflict: 55, baseProtest: 10, baseEconomic: 60, baseMilitary: 25, baseInfra: 55 },
  TCD: { name: 'Chad', baseConflict: 40, baseProtest: 10, baseEconomic: 55, baseMilitary: 25, baseInfra: 45 },
  JPN: { name: 'Japan', baseConflict: 2, baseProtest: 3, baseEconomic: 5, baseMilitary: 8, baseInfra: 2 },
  AUS: { name: 'Australia', baseConflict: 1, baseProtest: 5, baseEconomic: 5, baseMilitary: 3, baseInfra: 3 },
  KOR: { name: 'South Korea', baseConflict: 8, baseProtest: 10, baseEconomic: 8, baseMilitary: 15, baseInfra: 3 },
  PRK: { name: 'North Korea', baseConflict: 15, baseProtest: 5, baseEconomic: 70, baseMilitary: 65, baseInfra: 30 },
  IDN: { name: 'Indonesia', baseConflict: 10, baseProtest: 15, baseEconomic: 15, baseMilitary: 8, baseInfra: 10 },
  MEX: { name: 'Mexico', baseConflict: 30, baseProtest: 15, baseEconomic: 20, baseMilitary: 10, baseInfra: 20 },
  COL: { name: 'Colombia', baseConflict: 30, baseProtest: 20, baseEconomic: 20, baseMilitary: 15, baseInfra: 15 },
  SAU: { name: 'Saudi Arabia', baseConflict: 10, baseProtest: 5, baseEconomic: 10, baseMilitary: 20, baseInfra: 5 },
  EGY: { name: 'Egypt', baseConflict: 15, baseProtest: 15, baseEconomic: 30, baseMilitary: 15, baseInfra: 15 },
  ZAF: { name: 'South Africa', baseConflict: 15, baseProtest: 25, baseEconomic: 25, baseMilitary: 5, baseInfra: 20 },
  POL: { name: 'Poland', baseConflict: 3, baseProtest: 10, baseEconomic: 8, baseMilitary: 10, baseInfra: 3 },
  UZB: { name: 'Uzbekistan', baseConflict: 5, baseProtest: 5, baseEconomic: 20, baseMilitary: 5, baseInfra: 10 },
  KAZ: { name: 'Kazakhstan', baseConflict: 5, baseProtest: 15, baseEconomic: 15, baseMilitary: 5, baseInfra: 8 },
  TKM: { name: 'Turkmenistan', baseConflict: 3, baseProtest: 5, baseEconomic: 25, baseMilitary: 3, baseInfra: 10 },
  CAN: { name: 'Canada', baseConflict: 1, baseProtest: 5, baseEconomic: 5, baseMilitary: 2, baseInfra: 2 },
  NOR: { name: 'Norway', baseConflict: 1, baseProtest: 3, baseEconomic: 3, baseMilitary: 3, baseInfra: 1 },
  SWE: { name: 'Sweden', baseConflict: 2, baseProtest: 3, baseEconomic: 4, baseMilitary: 5, baseInfra: 2 },
  FIN: { name: 'Finland', baseConflict: 1, baseProtest: 2, baseEconomic: 3, baseMilitary: 5, baseInfra: 1 },
  UGA: { name: 'Uganda', baseConflict: 20, baseProtest: 15, baseEconomic: 30, baseMilitary: 10, baseInfra: 20 },
  KEN: { name: 'Kenya', baseConflict: 15, baseProtest: 20, baseEconomic: 20, baseMilitary: 8, baseInfra: 12 },
  TZA: { name: 'Tanzania', baseConflict: 5, baseProtest: 5, baseEconomic: 15, baseMilitary: 3, baseInfra: 8 },
};

// Weights per the spec
const WEIGHTS = {
  conflict: 0.40,
  protest: 0.20,
  economic: 0.15,
  military: 0.15,
  infrastructure: 0.10,
};

function computeScore(c: typeof COUNTRIES[string]): number {
  const raw =
    c.baseConflict * WEIGHTS.conflict +
    c.baseProtest * WEIGHTS.protest +
    c.baseEconomic * WEIGHTS.economic +
    c.baseMilitary * WEIGHTS.military +
    c.baseInfra * WEIGHTS.infrastructure;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export async function computeCII(): Promise<CIIScore[]> {
  const cached = cache.get<CIIScore[]>(CACHE_KEY);
  if (cached) return cached;

  const conflicts = await fetchConflicts();

  const scores: CIIScore[] = Object.entries(COUNTRIES).map(([code, country]) => {
    const score = computeScore(country);
    const relevantEvents = conflicts
      .filter((e) => {
        // Simple proximity check — match events to countries by name substring
        const titleLower = e.title.toLowerCase();
        const nameLower = country.name.toLowerCase();
        return titleLower.includes(nameLower) || e.description.toLowerCase().includes(nameLower);
      })
      .slice(0, 5)
      .map((e) => ({ title: e.title, type: e.type, timestamp: e.timestamp }));

    return {
      countryCode: code,
      countryName: country.name,
      score,
      breakdown: {
        conflict: country.baseConflict,
        protest: country.baseProtest,
        economic: country.baseEconomic,
        military: country.baseMilitary,
        infrastructure: country.baseInfra,
      },
      recentEvents: relevantEvents,
    };
  });

  cache.set(CACHE_KEY, scores, CACHE_TTL);
  return scores;
}
