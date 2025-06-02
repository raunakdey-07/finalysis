# Finalysis

A React Native application for stock analysis providing detailed financial scores and insights.

## Features

- **Stock Search**: Google-like autocomplete search for stock tickers
- **Financial Analysis**: Comprehensive scoring using multiple financial models:
  - Altman Z-Score (bankruptcy prediction)
  - Piotroski F-Score (financial strength)
  - Beneish M-Score (earnings manipulation detection)
  - Ohlson O-Score (bankruptcy probability)
- **Real-time Data**: Powered by Yahoo Finance API
- **Responsive Design**: Works on web and mobile platforms

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Netlify Functions
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Data Source**: Yahoo Finance API

## Project Structure

```
├── App.js                     # Main app with navigation setup
├── screens/
│   ├── HomeScreen.js          # Stock search screen
│   └── ReportScreen.js        # Stock analysis report screen
├── components/
│   └── ScoreCard.js           # Reusable score display component
├── netlify/
│   └── functions/
│       ├── searchStocks.js    # Stock ticker search API
│       ├── analyze.js         # Main stock analysis API
│       ├── scores.js          # Financial scoring calculations
│       └── getStockDetails.js # Stock quote details API
├── utils/
│   └── api.js                 # API utilities
└── netlify.toml               # Netlify configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Netlify CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finalysis
```

2. Install dependencies:
```bash
npm install
```

3. Install Netlify CLI globally (if not already installed):
```bash
npm install -g netlify-cli
```

### Development

1. Start the Expo development server:
```bash
npm run web
```

2. In a separate terminal, start Netlify Dev server:
```bash
netlify dev
```

The app will be available at `http://localhost:19006` and the Netlify functions at `http://localhost:8888`.

### Building for Production

1. Build the web version:
```bash
npm run build:web
```

2. Deploy to Netlify:
```bash
netlify deploy --prod
```

## API Functions

### `/api/searchStocks`
Search for stock tickers with autocomplete functionality.

**Parameters:**
- `query`: Stock symbol or company name to search

**Response:**
```json
[
  {
    "id": "AAPL",
    "title": "Apple Inc. (AAPL)"
  }
]
```

### `/api/analyze`
Get comprehensive financial analysis for a stock.

**Parameters:**
- `ticker`: Stock ticker symbol (e.g., "AAPL")

**Response:**
```json
{
  "price": {
    "current": 150.25,
    "high52": 180.50,
    "low52": 120.00,
    "percent": 65.2
  },
  "scores": {
    "z": 2.85,
    "f": 7,
    "m": -1.2,
    "o": 0.15
  }
}
```

## Financial Scores Explained

- **Altman Z-Score**: Measures bankruptcy risk (>2.99 = safe, 1.8-2.99 = gray area, <1.8 = distress)
- **Piotroski F-Score**: Financial strength score 0-9 (higher is better)
- **Beneish M-Score**: Earnings manipulation detection (>-2.22 suggests manipulation)
- **Ohlson O-Score**: Bankruptcy probability (lower is better)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Yahoo Finance API for financial data
- React Native community for excellent tooling
- Netlify for serverless function hosting