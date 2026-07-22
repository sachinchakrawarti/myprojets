import sys
import os


PYTHON_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.append(PYTHON_DIR)



from indicators.sma import add_sma
from indicators.ema import add_ema
from indicators.rsi import add_rsi
from indicators.macd import add_macd
from indicators.bollinger import add_bollinger



def apply_indicators(df):

    print("Adding SMA...")
    df = add_sma(df)


    print("Adding EMA...")
    df = add_ema(df)


    print("Adding RSI...")
    df = add_rsi(df)


    print("Adding MACD...")
    df = add_macd(df)


    print("Adding Bollinger Bands...")
    df = add_bollinger(df)


    return df