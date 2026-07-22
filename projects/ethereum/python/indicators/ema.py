import ta


def add_ema(df):

    df["ema_20"] = ta.trend.EMAIndicator(
        close=df["close"],
        window=20
    ).ema_indicator()


    df["ema_50"] = ta.trend.EMAIndicator(
        close=df["close"],
        window=50
    ).ema_indicator()


    return df