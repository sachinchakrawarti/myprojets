import ta


def add_bollinger(df):

    bb = ta.volatility.BollingerBands(
        close=df["close"],
        window=20,
        window_dev=2
    )


    df["bb_high"] = bb.bollinger_hband()

    df["bb_low"] = bb.bollinger_lband()

    df["bb_mid"] = bb.bollinger_mavg()


    return df