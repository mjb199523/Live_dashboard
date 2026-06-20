import yahooFinance from 'yahoo-finance2';

export interface MarketSignal {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  weight: number; // For composite score
}

export interface MarketData {
  signals: MarketSignal[];
  composite: number;
}

const SYMBOLS = [
  { symbol: '^GSPC', name: 'S&P 500', weight: 25 },
  { symbol: '^VIX', name: 'VIX Volatility', weight: 20 },
  { symbol: '^TNX', name: '10-Yr Treasury Yield', weight: 15 },
  { symbol: 'DX-Y.NYB', name: 'US Dollar Index', weight: 15 },
  { symbol: 'CL=F', name: 'Crude Oil (WTI)', weight: 15 },
  { symbol: 'GC=F', name: 'Gold', weight: 10 },
];

export async function fetchMarketComposite(): Promise<MarketData> {
  try {
    const signals: MarketSignal[] = [];
    let weightedScoreSum = 0;

    for (const item of SYMBOLS) {
      try {
        const quote = (await yahooFinance.quote(item.symbol)) as any;
        const price = quote.regularMarketPrice || 0;
        const changePercent = quote.regularMarketChangePercent || 0;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (changePercent > 0.1) trend = 'up';
        if (changePercent < -0.1) trend = 'down';

        signals.push({
          name: item.name,
          value: parseFloat(price.toFixed(2)),
          trend,
          weight: item.weight,
        });

        // Calculate a normalized score for the composite (0-100)
        // This is a naive calculation for demonstration:
        // Assume -3% change is 0 score, +3% change is 100 score. 0% change is 50.
        // For VIX, inverse logic (high VIX = low score/high stress)
        let normalized = 50 + (changePercent * 16.66); // 3 * 16.66 = 50
        if (item.symbol === '^VIX') {
          // VIX > 30 is bad (0 score), VIX < 15 is good (100 score)
          normalized = 100 - ((Math.max(10, Math.min(30, price)) - 10) * 5);
        }
        normalized = Math.max(0, Math.min(100, normalized));

        weightedScoreSum += normalized * (item.weight / 100);

      } catch (err) {
        console.warn(`[MARKETS] Failed to fetch ${item.symbol}`);
      }
    }

    return {
      signals,
      composite: Math.round(weightedScoreSum),
    };
  } catch (error) {
    console.error('[MARKETS] Global fetch error:', error);
    throw error;
  }
}
