import sqlite3
import pandas as pd
import os

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


DATABASE = os.path.join(
    BASE_DIR,
    "database",
    "ethereum.db"
)


def load_ohlcv():

    connection = sqlite3.connect(
        DATABASE
    )


    query = """

    SELECT
        open_time,
        open,
        high,
        low,
        close,
        volume

    FROM market_ohlcv

    ORDER BY open_time

    """


    df = pd.read_sql_query(
        query,
        connection
    )


    connection.close()


    df["date"] = pd.to_datetime(
        df["open_time"],
        unit="ms"
    )


    df.set_index(
        "date",
        inplace=True
    )


    return df



if __name__ == "__main__":

    data = load_ohlcv()

    print(data.head())

    print()

    print(data.tail())