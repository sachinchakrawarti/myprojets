import ta


def add_macd(df):

    macd = ta.trend.MACD(
        close=df["close"]
    )


    df["macd"] = macd.macd()

    df["macd_signal"] = macd.macd_signal()

    df["macd_diff"] = macd.macd_diff()


    return df