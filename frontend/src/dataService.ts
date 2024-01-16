import restApi from './api/rest-api.ts';
import { HttpError, isHttpError } from './api/http-types.ts';
import {
  ChartData, ChartDataRequest,
  Coin, convertToChartData,
  convertToFearGreedChartData,
  convertToPricesChartData, DateRange,
  FearGreedChartData,
  PriceChartData
} from './types.ts';


class DataService {
  public async getPriceChartData(coinId: string): Promise<PriceChartData[] | HttpError> {
    const prices = await restApi.getPrices(coinId);
    if (isHttpError(prices)) {
      return { reason: prices.reason };
    }
    return prices.map(p => convertToPricesChartData(p));
  }

  public async getFearGreedChartData(dateRange: DateRange): Promise<FearGreedChartData[] | HttpError> {
    const data = await restApi.getFearGreedIndexes(dateRange);
    if (isHttpError(data)) {
      return { reason: data.reason };
    }
    return data.map(d => convertToFearGreedChartData(d));
  }

  public async getCoins(): Promise<Coin[] | HttpError> {
    const data = await restApi.getCoins();
    if (isHttpError(data)) {
      return { reason: data.reason };
    }
    return data;
  }

  public async getChartData(request: ChartDataRequest): Promise<ChartData | HttpError> {
    const { coinId, start, end } = request;

    const data = await restApi.getChartData(coinId, {
      start: start.unix(),
      end: end.unix()
    });

    if (isHttpError(data)) {
      return { reason: data.reason };
    }

    return convertToChartData(data);
  }

  public async getCSV(request: ChartDataRequest) {
    const { coinId, start, end } = request;

    const data = await restApi.getCSV(coinId, {
      start: start.unix(),
      end: end.unix()
    });

    if (isHttpError(data)) {
      return { reason: data.reason };
    }

    const url = window.URL.createObjectURL(
      new Blob([data]),
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `data.csv`,
    );

    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
}

export default new DataService()
