#!/usr/bin/env python
"""
Create OHLCV Jupyter Notebooks
This script generates all notebook files with proper markdown and code cells
"""

import json
import os
from pathlib import Path

def create_notebook(cells, filename):
    """Create a Jupyter notebook from cells list"""
    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {
                    "name": "ipython",
                    "version": 3
                },
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.10.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    # Ensure directory exists
    Path(filename).parent.mkdir(parents=True, exist_ok=True)
    
    # Write notebook
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=2, ensure_ascii=False)
    print(f"Created: {filename}")

def get_data_overview_cells():
    """Cells for 01_data_overview.ipynb"""
    return [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Data Overview\n",
                "## OHLCV Price Data Analysis\n",
                "\n",
                "### Objectives:\n",
                "- Load and examine ETH/USD OHLCV data\n",
                "- Understand data structure and types\n",
                "- Check for missing values and data quality\n",
                "- Initial statistical summary\n",
                "- Data range and frequency analysis\n",
                "\n",
                "### Data Sources:\n",
                "- CSV file: `../../../data/Eth_OHLCV.csv`\n",
                "- JSON file: `../../../data/Eth_OHLCV.json`\n",
                "- SQLite DB: `../../../data/ETH.db`"
            ]
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "import pandas as pd\n",
                "import numpy as np\n",
                "import matplotlib.pyplot as plt\n",
                "import seaborn as sns\n",
                "from pathlib import Path\n",
                "import warnings\n",
                "warnings.filterwarnings('ignore')\n",
                "\n",
                "# Set plotting style\n",
                "plt.style.use('seaborn-v0_8-darkgrid')\n",
                "sns.set_palette(\"husl\")\n",
                "%matplotlib inline\n",
                "\n",
                "# Import utilities\n",
                "import sys\n",
                "sys.path.append('..')\n",
                "from utils.data_loader import DataLoader\n",
                "from utils.visualizations import TradingVisualizer"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Initialize data loader\n",
                "loader = DataLoader()\n",
                "\n",
                "# Load data from CSV\n",
                "df = loader.load_from_csv()\n",
                "\n",
                "if df.empty:\n",
                "    print(\"CSV not found, trying JSON...\")\n",
                "    df = loader.load_from_json()\n",
                "\n",
                "if df.empty:\n",
                "    print(\"JSON not found, trying database...\")\n",
                "    df = loader.load_from_db()\n",
                "\n",
                "print(f\"✅ Data loaded successfully!\")\n",
                "print(f\"📊 Shape: {df.shape}\")\n",
                "print(f\"📅 Date range: {df.index.min()} to {df.index.max()}\")\n",
                "print(f\"📈 Total periods: {len(df)}\")\n",
                "df.head(10)"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Data info\n",
                "print(\"=\" * 60)\n",
                "print(\"📋 DATA INFORMATION\")\n",
                "print(\"=\" * 60)\n",
                "df.info()\n",
                "\n",
                "print(\"\\n\" + \"=\" * 60)\n",
                "print(\"📊 DATA TYPES\")\n",
                "print(\"=\" * 60)\n",
                "print(df.dtypes)\n",
                "\n",
                "print(\"\\n\" + \"=\" * 60)\n",
                "print(\"🔍 NULL VALUES\")\n",
                "print(\"=\" * 60)\n",
                "print(df.isnull().sum())"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Statistical summary\n",
                "print(\"=\" * 60)\n",
                "print(\"📈 STATISTICAL SUMMARY\")\n",
                "print(\"=\" * 60)\n",
                "df.describe()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Check for duplicates\n",
                "duplicates = df.index.duplicated().sum()\n",
                "print(f\"🔄 Duplicate timestamps: {duplicates}\")\n",
                "\n",
                "if duplicates > 0:\n",
                "    print(\"\\n⚠️ Duplicate timestamps found:\")\n",
                "    print(df[df.index.duplicated(keep=False)].sort_index().head())\n",
                "    df = df[~df.index.duplicated(keep='first')]\n",
                "    print(f\"\\n✅ Removed duplicates. New shape: {df.shape}\")"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Data quality check\n",
                "print(\"=\" * 60)\n",
                "print(\"🔍 DATA QUALITY CHECK\")\n",
                "print(\"=\" * 60)\n",
                "\n",
                "# Check for zero or negative values\n",
                "for col in ['open', 'high', 'low', 'close', 'volume']:\n",
                "    if col in df.columns:\n",
                "        invalid = (df[col] <= 0).sum()\n",
                "        print(f\"{col}: {invalid} invalid values (<=0)\")\n",
                "\n",
                "# Check OHLC logic\n",
                "invalid_ohlc = ((df['high'] < df['low']) | \n",
                "               (df['high'] < df['open']) | \n",
                "               (df['high'] < df['close']) |\n",
                "               (df['low'] > df['open']) | \n",
                "               (df['low'] > df['close'])).sum()\n",
                "print(f\"\\n⚠️ Invalid OHLC relationships: {invalid_ohlc}\")\n",
                "\n",
                "if invalid_ohlc > 0:\n",
                "    print(\"\\nInvalid rows:\")\n",
                "    invalid_mask = ((df['high'] < df['low']) | \n",
                "                   (df['high'] < df['open']) | \n",
                "                   (df['high'] < df['close']) |\n",
                "                   (df['low'] > df['open']) | \n",
                "                   (df['low'] > df['close']))\n",
                "    print(df[invalid_mask].head())"
            ],
            "execution_count": None,
            "outputs": []
        }
    ]

def get_statistical_analysis_cells():
    """Cells for 02_statistical_analysis.ipynb"""
    return [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Statistical Analysis\n",
                "## OHLCV Price Statistics\n",
                "\n",
                "### Objectives:\n",
                "- Distribution analysis of prices and returns\n",
                "- Skewness and kurtosis examination\n",
                "- Outlier detection using IQR and Z-score methods\n",
                "- Rolling statistics analysis\n",
                "- Volatility and return distribution patterns"
            ]
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "import pandas as pd\n",
                "import numpy as np\n",
                "import matplotlib.pyplot as plt\n",
                "import seaborn as sns\n",
                "from scipy import stats\n",
                "from pathlib import Path\n",
                "import warnings\n",
                "warnings.filterwarnings('ignore')\n",
                "\n",
                "# Set style\n",
                "plt.style.use('seaborn-v0_8-darkgrid')\n",
                "sns.set_palette(\"husl\")\n",
                "%matplotlib inline\n",
                "\n",
                "# Import utilities\n",
                "import sys\n",
                "sys.path.append('..')\n",
                "from utils.data_loader import DataLoader\n",
                "from utils.visualizations import TradingVisualizer"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Load data\n",
                "loader = DataLoader()\n",
                "df = loader.load_from_csv()\n",
                "\n",
                "if df.empty:\n",
                "    df = loader.load_from_db()\n",
                "\n",
                "print(f\"✅ Data loaded: {len(df)} rows\")\n",
                "\n",
                "# Calculate returns\n",
                "df['returns'] = df['close'].pct_change() * 100\n",
                "df['log_returns'] = np.log(df['close'] / df['close'].shift(1)) * 100\n",
                "df['range'] = df['high'] - df['low']\n",
                "df['range_pct'] = (df['high'] - df['low']) / df['close'] * 100\n",
                "\n",
                "# Price changes\n",
                "df['price_change'] = df['close'] - df['open']\n",
                "df['price_change_pct'] = (df['close'] - df['open']) / df['open'] * 100\n",
                "\n",
                "df.head()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Distribution analysis\n",
                "fig, axes = plt.subplots(2, 2, figsize=(15, 10))\n",
                "\n",
                "# Price distribution\n",
                "df['close'].hist(bins=50, ax=axes[0, 0], edgecolor='black')\n",
                "axes[0, 0].set_title('ETH Price Distribution', fontsize=14, fontweight='bold')\n",
                "axes[0, 0].set_xlabel('Price ($)')\n",
                "axes[0, 0].set_ylabel('Frequency')\n",
                "\n",
                "# Returns distribution\n",
                "df['returns'].dropna().hist(bins=50, ax=axes[0, 1], edgecolor='black', color='orange')\n",
                "axes[0, 1].set_title('Returns Distribution', fontsize=14, fontweight='bold')\n",
                "axes[0, 1].set_xlabel('Returns (%)')\n",
                "axes[0, 1].set_ylabel('Frequency')\n",
                "\n",
                "# QQ plot for returns\n",
                "stats.probplot(df['returns'].dropna(), dist=\"norm\", plot=axes[1, 0])\n",
                "axes[1, 0].set_title('Q-Q Plot for Returns', fontsize=14, fontweight='bold')\n",
                "\n",
                "# Box plot for returns\n",
                "df['returns'].dropna().boxplot(ax=axes[1, 1])\n",
                "axes[1, 1].set_title('Returns Box Plot', fontsize=14, fontweight='bold')\n",
                "axes[1, 1].set_ylabel('Returns (%)')\n",
                "\n",
                "plt.tight_layout()\n",
                "plt.show()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Statistical metrics\n",
                "print(\"=\" * 60)\n",
                "print(\"📊 PRICE STATISTICS\")\n",
                "print(\"=\" * 60)\n",
                "price_stats = df[['open', 'high', 'low', 'close', 'volume']].describe()\n",
                "print(price_stats)\n",
                "\n",
                "print(\"\\n\" + \"=\" * 60)\n",
                "print(\"📊 RETURNS STATISTICS\")\n",
                "print(\"=\" * 60)\n",
                "returns_stats = df[['returns', 'log_returns']].describe()\n",
                "print(returns_stats)\n",
                "\n",
                "print(\"\\n\" + \"=\" * 60)\n",
                "print(\"📊 SKEWNESS & KURTOSIS\")\n",
                "print(\"=\" * 60)\n",
                "for col in ['close', 'returns', 'log_returns']:\n",
                "    if col in df.columns:\n",
                "        data = df[col].dropna()\n",
                "        skew = data.skew()\n",
                "        kurt = data.kurtosis()\n",
                "        print(f\"{col:15s} | Skewness: {skew:8.4f} | Kurtosis: {kurt:8.4f}\")"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Outlier detection\n",
                "print(\"=\" * 60)\n",
                "print(\"🔍 OUTLIER DETECTION\")\n",
                "print(\"=\" * 60)\n",
                "\n",
                "# IQR method\n",
                "def detect_outliers_iqr(data, multiplier=1.5):\n",
                "    Q1 = data.quantile(0.25)\n",
                "    Q3 = data.quantile(0.75)\n",
                "    IQR = Q3 - Q1\n",
                "    lower_bound = Q1 - multiplier * IQR\n",
                "    upper_bound = Q3 + multiplier * IQR\n",
                "    outliers = (data < lower_bound) | (data > upper_bound)\n",
                "    return outliers, lower_bound, upper_bound\n",
                "\n",
                "# Detect outliers in returns\n",
                "for multiplier in [1.5, 2.0, 3.0]:\n",
                "    outliers, lb, ub = detect_outliers_iqr(df['returns'].dropna(), multiplier)\n",
                "    count = outliers.sum()\n",
                "    pct = count / len(df['returns'].dropna()) * 100\n",
                "    print(f\"IQR (multiplier={multiplier}): {count} outliers ({pct:.2f}%)\")\n",
                "    print(f\"  Bounds: [{lb:.2f}, {ub:.2f}]\\n\")\n",
                "\n",
                "# Z-score method\n",
                "returns = df['returns'].dropna()\n",
                "z_scores = np.abs(stats.zscore(returns))\n",
                "\n",
                "for threshold in [2, 2.5, 3]:\n",
                "    outliers = z_scores > threshold\n",
                "    count = outliers.sum()\n",
                "    pct = count / len(returns) * 100\n",
                "    print(f\"Z-Score (threshold={threshold}): {count} outliers ({pct:.2f}%)\")"
            ],
            "execution_count": None,
            "outputs": []
        }
    ]

def get_correlation_analysis_cells():
    """Cells for 03_correlation_analysis.ipynb"""
    return [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Correlation Analysis\n",
                "## Price Relationships and Dependencies\n",
                "\n",
                "### Objectives:\n",
                "- Analyze correlations between OHLCV variables\n",
                "- Identify leading indicators\n",
                "- Understand price-volume relationships\n",
                "- Lag analysis and autocorrelation\n",
                "- Feature correlation for model development"
            ]
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "import pandas as pd\n",
                "import numpy as np\n",
                "import matplotlib.pyplot as plt\n",
                "import seaborn as sns\n",
                "from pathlib import Path\n",
                "import warnings\n",
                "warnings.filterwarnings('ignore')\n",
                "\n",
                "# Set style\n",
                "plt.style.use('seaborn-v0_8-darkgrid')\n",
                "sns.set_palette(\"husl\")\n",
                "%matplotlib inline\n",
                "\n",
                "# Import utilities\n",
                "import sys\n",
                "sys.path.append('..')\n",
                "from utils.data_loader import DataLoader\n",
                "from utils.visualizations import TradingVisualizer"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Load data\n",
                "loader = DataLoader()\n",
                "df = loader.load_from_csv()\n",
                "\n",
                "if df.empty:\n",
                "    df = loader.load_from_db()\n",
                "\n",
                "print(f\"✅ Data loaded: {len(df)} rows\")\n",
                "\n",
                "# Calculate additional metrics\n",
                "df['returns'] = df['close'].pct_change() * 100\n",
                "df['range'] = df['high'] - df['low']\n",
                "df['range_pct'] = (df['high'] - df['low']) / df['close'] * 100\n",
                "df['mid'] = (df['high'] + df['low']) / 2\n",
                "df['vwap'] = (df['high'] + df['low'] + df['close']) / 3\n",
                "\n",
                "df.head()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Correlation matrix\n",
                "corr_cols = ['open', 'high', 'low', 'close', 'volume', 'returns', 'range', 'range_pct', 'mid', 'vwap']\n",
                "corr_matrix = df[corr_cols].corr()\n",
                "\n",
                "fig, ax = plt.subplots(figsize=(12, 10))\n",
                "\n",
                "# Heatmap with annotations\n",
                "mask = np.triu(np.ones_like(corr_matrix, dtype=bool))\n",
                "sns.heatmap(corr_matrix, \n",
                "            mask=mask,\n",
                "            annot=True, \n",
                "            fmt='.2f',\n",
                "            cmap='coolwarm',\n",
                "            center=0,\n",
                "            square=True,\n",
                "            linewidths=0.5,\n",
                "            cbar_kws={\"shrink\": 0.8},\n",
                "            ax=ax)\n",
                "ax.set_title('Correlation Matrix - OHLCV Variables', fontsize=16, fontweight='bold')\n",
                "plt.tight_layout()\n",
                "plt.show()\n",
                "\n",
                "# Print correlation summary\n",
                "print(\"\\n\" + \"=\" * 60)\n",
                "print(\"📊 CORRELATION SUMMARY\")\n",
                "print(\"=\" * 60)\n",
                "print(\"\\nStrong positive correlations (>0.9):\")\n",
                "for i in range(len(corr_matrix.columns)):\n",
                "    for j in range(i+1, len(corr_matrix.columns)):\n",
                "        val = corr_matrix.iloc[i, j]\n",
                "        if val > 0.9:\n",
                "            print(f\"  {corr_matrix.columns[i]:12s} vs {corr_matrix.columns[j]:12s}: {val:.3f}\")"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Volume vs Price relationships\n",
                "fig, axes = plt.subplots(1, 3, figsize=(18, 5))\n",
                "\n",
                "# Volume vs Price\n",
                "axes[0].scatter(df['volume'], df['close'], alpha=0.5, s=1)\n",
                "axes[0].set_xlabel('Volume', fontweight='bold')\n",
                "axes[0].set_ylabel('Price ($)', fontweight='bold')\n",
                "axes[0].set_title('Volume vs Price', fontsize=12, fontweight='bold')\n",
                "\n",
                "# Volume vs Returns\n",
                "axes[1].scatter(df['volume'], df['returns'], alpha=0.5, s=1, color='orange')\n",
                "axes[1].set_xlabel('Volume', fontweight='bold')\n",
                "axes[1].set_ylabel('Returns (%)', fontweight='bold')\n",
                "axes[1].set_title('Volume vs Returns', fontsize=12, fontweight='bold')\n",
                "\n",
                "# Range vs Volume\n",
                "axes[2].scatter(df['volume'], df['range_pct'], alpha=0.5, s=1, color='green')\n",
                "axes[2].set_xlabel('Volume', fontweight='bold')\n",
                "axes[2].set_ylabel('Range (%)', fontweight='bold')\n",
                "axes[2].set_title('Volume vs Range (%)', fontsize=12, fontweight='bold')\n",
                "\n",
                "plt.tight_layout()\n",
                "plt.show()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Autocorrelation analysis\n",
                "from statsmodels.graphics.tsaplots import plot_acf, plot_pacf\n",
                "\n",
                "fig, axes = plt.subplots(2, 2, figsize=(16, 10))\n",
                "\n",
                "# ACF for returns\n",
                "plot_acf(df['returns'].dropna(), lags=40, ax=axes[0, 0])\n",
                "axes[0, 0].set_title('Autocorrelation - Returns', fontsize=12, fontweight='bold')\n",
                "\n",
                "# PACF for returns\n",
                "plot_pacf(df['returns'].dropna(), lags=40, ax=axes[0, 1])\n",
                "axes[0, 1].set_title('Partial Autocorrelation - Returns', fontsize=12, fontweight='bold')\n",
                "\n",
                "# ACF for log returns\n",
                "plot_acf(df['log_returns'].dropna(), lags=40, ax=axes[1, 0])\n",
                "axes[1, 0].set_title('Autocorrelation - Log Returns', fontsize=12, fontweight='bold')\n",
                "\n",
                "# PACF for log returns\n",
                "plot_pacf(df['log_returns'].dropna(), lags=40, ax=axes[1, 1])\n",
                "axes[1, 1].set_title('Partial Autocorrelation - Log Returns', fontsize=12, fontweight='bold')\n",
                "\n",
                "plt.tight_layout()\n",
                "plt.show()"
            ],
            "execution_count": None,
            "outputs": []
        }
    ]

def main():
    """Main function to create all notebooks"""
    
    # Base path
    base_path = Path(__file__).parent / "notebooks" / "01_eda_exploratory_data_analysis"
    base_path.mkdir(parents=True, exist_ok=True)
    
    # Create notebooks
    notebooks = [
        ("01_data_overview.ipynb", get_data_overview_cells()),
        ("02_statistical_analysis.ipynb", get_statistical_analysis_cells()),
        ("03_correlation_analysis.ipynb", get_correlation_analysis_cells())
    ]
    
    for filename, cells in notebooks:
        filepath = base_path / filename
        create_notebook(cells, str(filepath))
    
    print("\n" + "=" * 60)
    print("✅ All EDA notebooks created successfully!")
    print(f"📁 Location: {base_path}")
    print("=" * 60)
    print("\nCreated notebooks:")
    for filename, _ in notebooks:
        print(f"  📓 {filename}")

if __name__ == "__main__":
    main()