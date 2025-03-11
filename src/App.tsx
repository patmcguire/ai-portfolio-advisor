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
import { EditInitialCashDialog } from './components/EditInitialCashDialog';
import { PortfolioExport } from './components/PortfolioExport';
import { PortfolioState, StockHolding } from './types/investment';
import { savePortfolioData, loadPortfolioData } from './utils/storage';
import { fetchStockPrices } from './services/alphavantage';
import theme from './theme';

const App: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    initialCash: 0,
    remainingCash: 0,
    stocks: [],
    totalPortfolioValue: 0,
    totalUnrealizedGainLoss: 0,
    totalRealizedGainLoss: 0,
    totalPortfolioPerformance: 0,
  });
  const [editingStock, setEditingStock] = useState<StockHolding | null>(null);
  const [isEditingInitialCash, setIsEditingInitialCash] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedData = loadPortfolioData();
    if (savedData) {
      setPortfolio(savedData);
    }
  }, []);

  useEffect(() => {
    savePortfolioData(portfolio);
  }, [portfolio]);

  // Fetch stock prices and update portfolio calculations
  useEffect(() => {
    const updatePrices = async () => {
      if (!portfolio.stocks.length) return;

      setIsLoadingPrices(true);
      try {
        const symbolsToUpdate = portfolio.stocks.map(stock => stock.ticker);
        const prices = await fetchStockPrices(symbolsToUpdate);
        
        // Update portfolio with new prices
        const updatedStocks = portfolio.stocks.map(stock => {
          const currentPrice = prices[stock.ticker] || stock.currentPrice;
          const marketValue = stock.shares * currentPrice;
          const unrealizedGainLoss = marketValue - stock.costBasis;
          
          return {
            ...stock,
            currentPrice,
            marketValue,
            unrealizedGainLoss
          };
        });

        const totalPortfolioValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
        const totalUnrealizedGainLoss = updatedStocks.reduce((sum, stock) => sum + stock.unrealizedGainLoss, 0);
        
        setPortfolio(prev => ({
          ...prev,
          stocks: updatedStocks,
          totalPortfolioValue,
          totalUnrealizedGainLoss
        }));
      } catch (error) {
        console.error('Error updating stock prices:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    // Initial price update only
    updatePrices();
  }, [portfolio.stocks.length]); // Only run when number of stocks changes

  const handleRefreshPrices = async () => {
    if (!portfolio.stocks.length) return;

    setIsLoadingPrices(true);
    try {
      const symbolsToUpdate = portfolio.stocks.map(stock => stock.ticker);
      const prices = await fetchStockPrices(symbolsToUpdate);
      
      // Update portfolio with new prices
      const updatedStocks = portfolio.stocks.map(stock => {
        const currentPrice = prices[stock.ticker] || stock.currentPrice;
        const marketValue = stock.shares * currentPrice;
        const unrealizedGainLoss = marketValue - stock.costBasis;
        
        return {
          ...stock,
          currentPrice,
          marketValue,
          unrealizedGainLoss
        };
      });

      const totalPortfolioValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
      const totalUnrealizedGainLoss = updatedStocks.reduce((sum, stock) => sum + stock.unrealizedGainLoss, 0);
      
      setPortfolio(prev => ({
        ...prev,
        stocks: updatedStocks,
        totalPortfolioValue,
        totalUnrealizedGainLoss
      }));
    } catch (error) {
      console.error('Error updating stock prices:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const handleInitialCashSubmit = (amount: number) => {
    setPortfolio(prev => ({
      ...prev,
      initialCash: amount,
      remainingCash: amount,
      totalPortfolioPerformance: 0,
    }));
  };

  const handleEditInitialCash = (newValue: number) => {
    setPortfolio(prev => {
      const totalValue = prev.totalPortfolioValue + prev.remainingCash;
      const totalPortfolioPerformance = ((totalValue - newValue) / newValue) * 100;
      return {
        ...prev,
        initialCash: newValue,
        totalPortfolioPerformance,
      };
    });
    setIsEditingInitialCash(false);
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

    setPortfolio(prev => {
      const newRemainingCash = Math.max(0, prev.remainingCash - newStock.costBasis);
      return {
        ...prev,
        stocks: [...prev.stocks, newStock],
        remainingCash: newRemainingCash,
      };
    });
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
      const newRemainingCash = Math.max(0, prev.remainingCash + cashDifference);

      const updatedStocks = [...prev.stocks];
      updatedStocks[stockIndex] = updatedStock;

      return {
        ...prev,
        stocks: updatedStocks,
        remainingCash: newRemainingCash,
      };
    });
  };

  const handleSaveEdit = (updatedStock: StockHolding) => {
    setPortfolio((prev) => {
      const costDifference = updatedStock.costBasis - (editingStock?.costBasis || 0);
      const newRemainingCash = Math.max(0, prev.remainingCash - costDifference);
      return {
        ...prev,
        stocks: prev.stocks.map((stock) =>
          stock.id === updatedStock.id ? updatedStock : stock
        ),
        remainingCash: newRemainingCash,
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
      const costBasisPerShare = stock.costBasis / stock.shares;
      const realizedGainLoss = (salePricePerShare - costBasisPerShare) * sharesSold;
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

      const newRemainingCash = prev.remainingCash + saleProceeds;

      return {
        ...prev,
        stocks: updatedStocks,
        remainingCash: newRemainingCash,
        totalRealizedGainLoss: prev.totalRealizedGainLoss + realizedGainLoss,
      };
    });
  };

  const handleRestorePortfolio = (restoredPortfolio: PortfolioState) => {
    setPortfolio(restoredPortfolio);
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
                onEditInitialCash={() => setIsEditingInitialCash(true)}
              />
              <StockPurchaseForm onSubmit={handleStockPurchase} remainingCash={portfolio.remainingCash} />
              <StockList
                stocks={portfolio.stocks}
                onDelete={handleDeleteStock}
                onEdit={handleEditStock}
                onSell={handleSellStock}
                isLoadingPrices={isLoadingPrices}
                onRefreshPrices={handleRefreshPrices}
                remainingCash={portfolio.remainingCash}
              />
              <PortfolioExport
                stocks={portfolio.stocks}
                initialCash={portfolio.initialCash}
                remainingCash={portfolio.remainingCash}
                onRestore={handleRestorePortfolio}
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

          <EditInitialCashDialog
            open={isEditingInitialCash}
            currentValue={portfolio.initialCash}
            onClose={() => setIsEditingInitialCash(false)}
            onSave={handleEditInitialCash}
          />
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
