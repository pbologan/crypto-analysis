import requests
from fastapi import FastAPI
from fastapi.responses import FileResponse
import uvicorn
from urls import COINS_LIST_URL, ALL_FEAR_AND_GREED_INDEX_URL, get_market_data_url
from fastapi.middleware.cors import CORSMiddleware
from coins import coins_names
from utils import start_of_day
from datetime import datetime
from scipy.stats import pearsonr
import csv
import os


app = FastAPI()


origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/prices/{coin_id}")
async def get_prices(coin_id: str, start: int, end: int):
    prices_response = requests.get(get_market_data_url(coin_id, start, end))
    return prices_response.json()


@app.get("/coins")
async def get_coins():
    coins_response = requests.get(COINS_LIST_URL)
    if coins_response.status_code > 400:
        return coins_response.json()
    coins = list(filter(lambda coin: coin["name"].lower() in coins_names, coins_response.json()))
    return coins


@app.get("/fear_greed")
async def get_fear_and_greed():
    fag_response = requests.get(ALL_FEAR_AND_GREED_INDEX_URL)
    if fag_response.status_code > 400:
        return fag_response.json()
    return list(reversed(fag_response.json()))


@app.get("/chart_data/{coin_id}")
async def get_chart_data(coin_id: str, start: int, end: int):
    prices_response = requests.get(get_market_data_url(coin_id, start, end))
    if prices_response.status_code > 400:
        return prices_response.json()
    prices = prices_response.json()["prices"]
    timestamps = list(map(lambda item: start_of_day(item[0] // 1000), prices))
    prices = list(
        map(
            lambda item: {
                "timestamp": start_of_day(item[0] // 1000),
                "price": item[1]
            },
            prices
        )
    )

    fag_response = requests.get(ALL_FEAR_AND_GREED_INDEX_URL)
    if fag_response.status_code > 400:
        return fag_response.json()

    fag_data_list = list(
        map(
            lambda item: {
                "value": int(item.get("value")),
                "timestamp": start_of_day(int(item.get("timestamp"))),
                "value_classification": item.get("value_classification")
            },
            list(reversed(fag_response.json().get("data")))
        )
    )

    fags = {}
    for fag_item in list(filter(lambda item: item.get("timestamp") in timestamps, fag_data_list)):
        fags[str(fag_item.get("timestamp"))] = {
            "value": fag_item.get("value"),
            "value_classification": fag_item.get("value_classification")
        }

    result = []
    for price in prices:
        price_time = price.get("timestamp")
        price_value = price.get("price")
        fag = fags.get(str(price_time))
        if fag is not None:
            result.append({
                "time": price_time * 1000,
                "price": price_value,
                "fear_greed": fag
            })

    statistic, pvalue = pearsonr(
        list(map(lambda item: item.get("price"), result)),
        list(map(lambda item: item.get("fear_greed").get("value"), result))
    )
    return {
        "p_value": pvalue,
        "pearson": statistic,
        "data": result
    }


@app.get("/get_csv/{coin_id}")
def get_csv(coin_id: str, start: int, end: int):
    prices_response = requests.get(get_market_data_url(coin_id, start, end))
    if prices_response.status_code > 400:
        return prices_response.json()
    prices = prices_response.json()["prices"]
    timestamps = list(map(lambda item: start_of_day(item[0] // 1000), prices))
    prices = list(
        map(
            lambda item: {
                "timestamp": start_of_day(item[0] // 1000),
                "price": item[1]
            },
            prices
        )
    )

    fag_response = requests.get(ALL_FEAR_AND_GREED_INDEX_URL)
    if fag_response.status_code > 400:
        return fag_response.json()

    fag_data_list = list(
        map(
            lambda item: {
                "value": int(item.get("value")),
                "timestamp": start_of_day(int(item.get("timestamp"))),
                "value_classification": item.get("value_classification")
            },
            list(reversed(fag_response.json().get("data")))
        )
    )

    fags = {}
    for fag_item in list(filter(lambda item: item.get("timestamp") in timestamps, fag_data_list)):
        fags[str(fag_item.get("timestamp"))] = {
            "value": fag_item.get("value"),
            "value_classification": fag_item.get("value_classification")
        }

    data = [["Date", "Price", "Fear and Greed Index"]]
    for price in prices:
        price_time = price.get("timestamp")
        price_value = price.get("price")
        fag = fags.get(str(price_time))
        if fag is not None:
            data.append([
                datetime.fromtimestamp(price_time).strftime("%d.%m.%Y"),
                str(price_value).replace(".", ","),
                fag.get("value")
            ])

    file_path = "data.csv"

    if os.path.exists(file_path):
        os.remove(file_path)

    with open(file_path, "w", newline="") as file:
        writer = csv.writer(file, dialect='excel')
        writer.writerows(data)

    return FileResponse(file_path)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
