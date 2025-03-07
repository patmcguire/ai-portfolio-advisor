import { PortfolioState } from '../types/investment';

const STORAGE_KEY = 'portfolio_data';

export const savePortfolioData = (data: PortfolioState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadPortfolioData = (): PortfolioState | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  const parsedData = JSON.parse(data);
  return {
    ...parsedData,
    stocks: parsedData.stocks.map((stock: any) => ({
      ...stock,
      purchaseDate: new Date(stock.purchaseDate)
    }))
  };
}; 