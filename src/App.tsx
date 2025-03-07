import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { v4 as uuidv4 } from 'uuid';
import { InitialCashForm } from './components/InitialCashForm';
import { StockPurchaseForm } from './components/StockPurchaseForm';
import StockList from './components/StockList';
import { PortfolioSummary } from './components/PortfolioSummary';
import { EditStockDialog } from './components/EditStockDialog';
import { PortfolioState, StockHolding } from './types/investment';
import { savePortfolioData, loadPortfolioData } from './utils/storage';
import { fetchStockPrices } from './services/stockPrices';
import theme from './theme';

const App: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    initialCash: 0,
    remainingCash: 0,
    stocks: [],
    totalPortfolioValue: 0,
    totalUnrealizedGainLoss: 0,
    totalRealizedGainLoss: 0,
  });
  const [editingStock, setEditingStock] = useState<StockHolding | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  useEffect(() => {
    const savedData = loadPortfolioData();
    if (savedData) {
      setPortfolio(savedData);
    }
  }, []);

  useEffect(() => {
    savePortfolioData(portfolio);
  }, [portfolio]);

  // Function to fetch stock prices and update portfolio
  const fetchPricesAndUpdatePortfolio = async () => {
    if (portfolio.stocks.length === 0) return;
    
    setIsLoadingPrices(true);
    try {
      const prices = await fetchStockPrices(portfolio.stocks.map(stock => stock.ticker));
      
      const updatedStocks = portfolio.stocks.map(stock => {
        const currentPrice = prices.get(stock.ticker) || stock.currentPrice || 0;
        const marketValue = currentPrice * stock.shares;
        const unrealizedGainLoss = ((currentPrice - stock.pricePerShare) / stock.pricePerShare) * 100;
        
        return {
          ...stock,
          currentPrice,
          marketValue,
          unrealizedGainLoss,
        };
      });

      const totalPortfolioValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
      const totalUnrealizedGainLoss = updatedStocks.reduce((sum, stock) => sum + stock.unrealizedGainLoss, 0) / updatedStocks.length;

      setPortfolio(prev => ({
        ...prev,
        stocks: updatedStocks,
        totalPortfolioValue,
        totalUnrealizedGainLoss,
      }));
    } catch (error) {
      console.error('Error updating stock prices:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Initial price fetch
  useEffect(() => {
    fetchPricesAndUpdatePortfolio();
  }, [portfolio.stocks.length]); // Only run when stocks are added or removed

  // Auto-refresh prices every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchPricesAndUpdatePortfolio, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInitialCashSubmit = (amount: number) => {
    setPortfolio(prev => ({
      ...prev,
      initialCash: amount,
      remainingCash: amount,
    }));
  };

  const handleStockPurchase = (stock: Omit<StockHolding, 'id' | 'costBasis' | 'currentPrice' | 'marketValue' | 'unrealizedGainLoss'>) => {
    const newStock: StockHolding = {
      ...stock,
      id: Date.now().toString(),
      costBasis: stock.shares * stock.pricePerShare,
      currentPrice: 0,
      marketValue: 0,
      unrealizedGainLoss: 0,
    };

    setPortfolio(prev => ({
      ...prev,
      stocks: [...prev.stocks, newStock],
      remainingCash: prev.remainingCash - newStock.costBasis,
    }));
  };

  const handleDeleteStock = (id: string) => {
    setPortfolio(prev => {
      const stockToDelete = prev.stocks.find(s => s.id === id);
      if (!stockToDelete) return prev;

      return {
        ...prev,
        stocks: prev.stocks.filter(s => s.id !== id),
        remainingCash: prev.remainingCash + stockToDelete.costBasis,
      };
    });
  };

  const handleEditStock = (updatedStock: StockHolding) => {
    setPortfolio(prev => {
      const stockIndex = prev.stocks.findIndex(s => s.id === updatedStock.id);
      if (stockIndex === -1) return prev;

      const oldStock = prev.stocks[stockIndex];
      const cashDifference = oldStock.costBasis - updatedStock.costBasis;

      const updatedStocks = [...prev.stocks];
      updatedStocks[stockIndex] = updatedStock;

      return {
        ...prev,
        stocks: updatedStocks,
        remainingCash: prev.remainingCash + cashDifference,
      };
    });
  };

  const handleSaveEdit = (updatedStock: StockHolding) => {
    setPortfolio((prev) => {
      const costDifference = updatedStock.costBasis - (editingStock?.costBasis || 0);
      return {
        ...prev,
        stocks: prev.stocks.map((stock) =>
          stock.id === updatedStock.id ? updatedStock : stock
        ),
        remainingCash: prev.remainingCash - costDifference,
      };
    });
    setEditingStock(null);
  };

  const handleSellStock = (stockId: string, sharesSold: number, salePricePerShare: number, dateSold: Date) => {
    setPortfolio(prev => {
      const stockIndex = prev.stocks.findIndex(s => s.id === stockId);
      if (stockIndex === -1) return prev;

      const stock = prev.stocks[stockIndex];
      const saleProceeds = sharesSold * salePricePerShare;
      const remainingShares = stock.shares - sharesSold;

      let updatedStocks = [...prev.stocks];
      
      if (remainingShares > 0) {
        // Update existing stock with remaining shares
        updatedStocks[stockIndex] = {
          ...stock,
          shares: remainingShares,
          costBasis: (stock.costBasis / stock.shares) * remainingShares,
        };
      } else {
        // Remove the stock if all shares are sold
        updatedStocks = updatedStocks.filter(s => s.id !== stockId);
      }

      return {
        ...prev,
        stocks: updatedStocks,
        remainingCash: prev.remainingCash + saleProceeds,
      };
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            AI Portfolio Advisor
          </Typography>

          {!portfolio.initialCash ? (
            <InitialCashForm onSubmit={handleInitialCashSubmit} initialCash={0} />
          ) : (
            <>
              <PortfolioSummary
                portfolio={portfolio}
              />
              <StockPurchaseForm onSubmit={handleStockPurchase} remainingCash={portfolio.remainingCash} />
              <StockList
                stocks={portfolio.stocks}
                onDelete={handleDeleteStock}
                onEdit={handleEditStock}
                onSell={handleSellStock}
                isLoadingPrices={isLoadingPrices}
                onRefreshPrices={fetchPricesAndUpdatePortfolio}
                remainingCash={portfolio.remainingCash}
              />
            </>
          )}

          <EditStockDialog
            open={!!editingStock}
            stock={editingStock}
            remainingCash={portfolio.remainingCash}
            onClose={() => setEditingStock(null)}
            onSave={handleSaveEdit}
          />
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
