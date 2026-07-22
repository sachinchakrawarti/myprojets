import ta


def add_rsi(df):

    df["rsi"] = ta.momentum.RSIIndicator(
        close=df["close"],
        window=14
    ).rsi()

    return df