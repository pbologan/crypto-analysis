export interface HttpError {
  reason: string;
}

export interface CoinGeckoError {
  status: {
    error_code: number,
    error_message: string
  }
}

export function isHttpError(response: any): response is HttpError {
  return response.reason !== undefined;
}

export function isCoinGeckoError(response: any): response is CoinGeckoError {
  return response.status !== undefined;
}
