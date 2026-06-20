import yahooFinance from 'yahoo-finance2';

export interface CommodityPrice {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

const SYMBOLS = [
  { symbol: 'CL=F', name: 'WTI Crude Oil', category: 'Energy' },
  { symbol: 'BZ=F', name: 'Brent Crude Oil', category: 'Energy' },
  { symbol: 'NG=F', name: 'Natural Gas', category: 'Energy' },
  { symbol: 'HO=F', name: 'Heating Oil', category: 'Energy' },
  { symbol: 'RB=F', name: 'RBOB Gasoline', category: 'Energy' },
  { symbol: 'HG=F', name: 'Copper', category: 'Metals' },
  { symbol: 'ZW=F', name: 'Wheat', category: 'Agriculture' },
  { symbol: 'ZC=F', name: 'Corn', category: 'Agriculture' },
];

export async function fetchCommodities(): Promise<CommodityPrice[]> {
  try {
    const commodities: CommodityPrice[] = [];

    for (const item of SYMBOLS) {
      try {
        const quote = (await yahooFinance.quote(item.symbol)) as any;
        const price = quote.regularMarketPrice || 0;
        const changePercent = quote.regularMarketChangePercent || 0;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (changePercent > 0.05) trend = 'up';
        if (changePercent < -0.05) trend = 'down';

        commodities.push({
          id: item.symbol,
          name: item.name,
          category: item.category,
          price: parseFloat(price.toFixed(2)),
          currency: quote.currency || 'USD',
          changePercent: parseFloat(changePercent.toFixed(2)),
          trend,
        });

      } catch (err) {
        console.warn(`[COMMODITIES] Failed to fetch ${item.symbol}`);
      }
    }

    return commodities;
  } catch (error) {
    console.error('[COMMODITIES] Global fetch error:', error);
    throw error;
  }
}
