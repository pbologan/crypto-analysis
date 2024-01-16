import axios from 'axios';
import { HttpError, isCoinGeckoError } from './http-types.ts';
import {
  ChartDataResponse,
  Coin,
  convertToPricesData,
  DateRange,
  FearGreedData,
  FearGreedResponse,
  PriceData,
  PriceResponse
} from '../types.ts';
import { BASE_URL, CHART_DATA_URL, COINS_URL, CSV_URL, FEAR_GREED_URL, PRICES_URL } from './urls';

class RestApi {
  private client = axios.create({ baseURL: BASE_URL });

  public async getCoins(): Promise<Coin[] | HttpError> {
    const response = await this.client.get<Coin[]>(COINS_URL);
    if (response.status >= 400) {
      return { reason: response.statusText };
    }
    if (isCoinGeckoError(response.data)) {
      return { reason: response.data.status.error_message };
    }
    return response.data
  }

  public async getFearGreedIndexes(dateRange: DateRange): Promise<FearGreedData[] | HttpError> {
    const response = await this.client.get<FearGreedResponse>(FEAR_GREED_URL);
    if (response.status >= 400) {
      return { reason: response.statusText };
    }
    return response.data.data
      .filter(d => d.timestamp * 1000 >= dateRange.start && d.timestamp * 1000 <= dateRange.end);
  }

  public async getPrices(coinId: string): Promise<PriceData[] | HttpError> {
    const response = await this.client.get<PriceResponse>(`${PRICES_URL}/${coinId}`);
    if (response.status >= 400) {
      return { reason: response.statusText };
    }
    if (isCoinGeckoError(response.data)) {
      return { reason: response.data.status.error_message };
    }
    return convertToPricesData(response.data)
  }

  public async getChartData(coinId: string, dateRange: DateRange): Promise<ChartDataResponse | HttpError> {
    const response = await this.client.get<ChartDataResponse>(`${CHART_DATA_URL}/${coinId}`, {
      params: { ...dateRange }
    });
    if (response.status >= 400) {
      return { reason: response.statusText };
    }
    if (isCoinGeckoError(response.data)) {
      return { reason: response.data.status.error_message };
    }
    return response.data;
  }

  public async getCSV(coinId: string, dateRange: DateRange): Promise<Blob | HttpError> {
    const response = await this.client.get<Blob>(`${CSV_URL}/${coinId}`, {
      params: { ...dateRange }
    });
    if (response.status >= 400) {
      return { reason: response.statusText };
    }
    if (isCoinGeckoError(response.data)) {
      return { reason: response.data.status.error_message };
    }

    return response.data;
  }
}

export default new RestApi()
