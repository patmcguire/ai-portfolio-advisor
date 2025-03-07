import { PortfolioState } from '../types/investment';

const STORAGE_KEY = 'portfolio_data';

export const savePortfolioData = (portfolio: PortfolioState): void => {
  try {
    // Convert dates to ISO strings before saving
    const serializedPortfolio = {
      ...portfolio,
      stocks: portfolio.stocks.map(stock => ({
        ...stock,
        purchaseDate: stock.purchaseDate.toISOString(),
        dateSold: stock.dateSold?.toISOString(),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedPortfolio));
  } catch (error) {
    console.error('Error saving portfolio data:', error);
  }
};

export const loadPortfolioData = (): PortfolioState | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;

    const parsedData = JSON.parse(savedData);

    // Convert ISO date strings back to Date objects
    return {
      ...parsedData,
      stocks: parsedData.stocks.map((stock: any) => ({
        ...stock,
        purchaseDate: new Date(stock.purchaseDate),
        dateSold: stock.dateSold ? new Date(stock.dateSold) : undefined,
      })),
    };
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    return null;
  }
}; 