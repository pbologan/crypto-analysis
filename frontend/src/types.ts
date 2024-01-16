import * as dayjs from 'dayjs';

export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export interface PriceData {
  time: number;
  price: number;
}

export interface PriceChartData {
  time: string;
  value: number
  timestamp: number;
}

export interface PriceResponse {
  prices: [time: number, price: number][];
}

export interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: number;
  time_until_update: number
}

export interface FearGreedChartData {
  time: string;
  value: number;
  classification: string;
  timestamp: number;
}

export interface FearGreedResponse {
  name: string;
  data: FearGreedData[]
  metadata: {
    error: string | null;
  }
}

export interface ChartDataResponse {
  p_value: number;
  pearson: number
  data: {
    time: number
    price: number;
    fear_greed: {
      value: number;
      value_classification: string;
    };
  }[]
}

export interface ChartDataRequest {
  coinId: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}

export interface ChartData {
  pValue: number;
  pearson: number;
  prices: PriceChartData[];
  fearGreed: FearGreedChartData[];
}

export interface DateRange {
  start: number;
  end: number;
}

export function convertToPricesData(response: PriceResponse): PriceData[] {
  return response.prices.map(price => {
    return {
      time: price[0],
      price: price[1]
    }
  });
}

export function convertToPricesChartData(pricesData: PriceData): PriceChartData {
  return {
    time: dayjs(pricesData.time).format('DD-MM-YY'),
    value: pricesData.price,
    timestamp: pricesData.time
  };
}

export function convertToFearGreedChartData(fearGreed: FearGreedData): FearGreedChartData {
  return {
    time: dayjs(fearGreed.timestamp * 1000).format('DD-MM-YY'),
    value: fearGreed.value,
    classification: fearGreed.value_classification,
    timestamp: fearGreed.timestamp
  };
}

export function convertToChartData(response: ChartDataResponse): ChartData {
  const { p_value, pearson, data } = response;
  const prices: PriceChartData[] = data.map(r => {
    return {
      time: dayjs(r.time).format('DD-MM-YY'),
      value: r.price,
      timestamp: r.time
    }
  });
  const fearGreed: FearGreedChartData[] = data.map(r => {
    return {
      time: dayjs(r.time).format('DD-MM-YY'),
      value: r.fear_greed.value,
      classification: r.fear_greed.value_classification,
      timestamp: r.time
    }
  });
  return { pValue: p_value, pearson, prices, fearGreed };
}
