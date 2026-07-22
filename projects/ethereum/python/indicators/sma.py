import ta


def add_sma(df):

    df["sma_20"] = ta.trend.SMAIndicator(
        close=df["close"],
        window=20
    ).sma_indicator()


    df["sma_50"] = ta.trend.SMAIndicator(
        close=df["close"],
        window=50
    ).sma_indicator()


    df["sma_200"] = ta.trend.SMAIndicator(
        close=df["close"],
        window=200
    ).sma_indicator()


    return df