from datetime import datetime, time


def start_of_day(timestamp: int) -> int:
    date = datetime.fromtimestamp(timestamp)
    start = datetime.combine(date, time.min)
    return int(datetime.timestamp(start))
