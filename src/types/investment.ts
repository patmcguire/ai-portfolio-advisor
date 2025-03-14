export interface StockPurchase {
  id: string;
  ticker: string;
  shares: number;
  pricePerShare: number;
  purchaseDate: Date;
  totalCost: number;
}

export interface StockHolding {
  id: string;
  ticker: string;
  shares: number;
  pricePerShare: number;
  costBasis: number;
  purchaseDate: Date;
  currentPrice?: number;
  marketValue?: number;
  unrealizedGainLoss?: number;
  isSold?: boolean;
  sharesSold?: number;
  salePricePerShare?: number;
  dateSold?: Date;
}

export interface PortfolioState {
  initialCash: number;
  remainingCash: number;
  stocks: StockHolding[];
  totalPortfolioValue: number;
  totalUnrealizedGainLoss: number;
  totalRealizedGainLoss: number;
  totalPortfolioPerformance: number;  // Percentage gain/loss against initial investment
} 