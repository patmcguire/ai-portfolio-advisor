# AI Portfolio Advisor

A React TypeScript application for tracking and managing your investment portfolio. Built with Material-UI and real-time stock data from Alpha Vantage.

## Features

- Track initial investment amount
- Add and manage stock holdings
- Real-time stock price updates
- Portfolio value tracking
- Gain/Loss calculations
- Dark theme UI
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Alpha Vantage API key (free)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-portfolio-advisor.git
cd ai-portfolio-advisor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Alpha Vantage API key:
```
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5174](http://localhost:5174) in your browser.

## Getting an Alpha Vantage API Key

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Copy your API key to the `.env` file

## Technologies Used

- React
- TypeScript
- Material-UI
- Vite
- Alpha Vantage API
- Local Storage for data persistence

## License

MIT
