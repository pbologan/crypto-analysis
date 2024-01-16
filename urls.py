import os
from dotenv import load_dotenv

load_dotenv()

COIN_GECKO_API_KEY = os.getenv('COIN_GECKO_DEMO_API_KEY')

COIN_GECKO_BASE_URL = "https://api.coingecko.com/api/v3"
COINS_LIST_URL = f"{COIN_GECKO_BASE_URL}/coins/list?&x_cg_demo_api_key={COIN_GECKO_API_KEY}"
ALL_FEAR_AND_GREED_INDEX_URL = "https://api.alternative.me/fng/?limit=0"


def get_market_data_url(coin_id: str, from_time: int, to_time: int) -> str:
    return f"{COIN_GECKO_BASE_URL}/coins/{coin_id}/market_chart/range?vs_currency=usd&from={from_time}&to={to_time}&precision=2&&x_cg_demo_api_key={COIN_GECKO_API_KEY}"
