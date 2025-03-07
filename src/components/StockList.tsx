import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
  Zoom,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SellIcon from '@mui/icons-material/MonetizationOn';
import { StockHolding } from '../types/investment';
import { EditStockDialog } from './EditStockDialog';
import { SellStockDialog } from './SellStockDialog';

interface StockListProps {
  stocks: StockHolding[];
  onDelete: (id: string) => void;
  onEdit: (stock: StockHolding) => void;
  onSell: (stockId: string, sharesSold: number, salePricePerShare: number, dateSold: Date) => void;
  isLoadingPrices: boolean;
  onRefreshPrices: () => void;
  remainingCash: number;
}

const StockList: React.FC<StockListProps> = ({
  stocks,
  onDelete,
  onEdit,
  onSell,
  isLoadingPrices,
  onRefreshPrices,
  remainingCash,
}) => {
  const [editingStock, setEditingStock] = useState<StockHolding | null>(null);
  const [sellingStock, setSellingStock] = useState<StockHolding | null>(null);

  const handleEditClick = (stock: StockHolding) => {
    setEditingStock(stock);
  };

  const handleEditClose = () => {
    setEditingStock(null);
  };

  const handleEditSave = (updatedStock: StockHolding) => {
    onEdit(updatedStock);
    handleEditClose();
  };

  const handleSellClick = (stock: StockHolding) => {
    setSellingStock(stock);
  };

  const handleSellClose = () => {
    setSellingStock(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const getGainLossColor = (amount: number) => {
    return amount >= 0 ? 'success.main' : 'error.main';
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Portfolio Holdings</Typography>
        <Tooltip title="Refresh Prices">
          <IconButton
            onClick={onRefreshPrices}
            color="primary"
            disabled={isLoadingPrices}
            sx={{
              animation: isLoadingPrices ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticker</TableCell>
              <TableCell align="right">Shares</TableCell>
              <TableCell align="right">Cost Basis</TableCell>
              <TableCell align="right">Current Price</TableCell>
              <TableCell align="right">Market Value</TableCell>
              <TableCell align="right">Gain/Loss</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow
                key={stock.id}
                sx={{
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" color="primary">
                    {stock.ticker}
                  </Typography>
                </TableCell>
                <TableCell align="right">{stock.shares.toFixed(2)}</TableCell>
                <TableCell align="right">{formatCurrency(stock.costBasis)}</TableCell>
                <TableCell align="right">
                  {isLoadingPrices ? (
                    <CircularProgress size={20} />
                  ) : (
                    formatCurrency(stock.currentPrice || 0)
                  )}
                </TableCell>
                <TableCell align="right">{formatCurrency(stock.marketValue || 0)}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: getGainLossColor(stock.unrealizedGainLoss || 0) }}
                >
                  {formatPercentage(stock.unrealizedGainLoss || 0)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Zoom in>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(stock)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Zoom>
                    <Zoom in style={{ transitionDelay: '50ms' }}>
                      <Tooltip title="Sell">
                        <IconButton
                          size="small"
                          onClick={() => handleSellClick(stock)}
                          color="success"
                        >
                          <SellIcon />
                        </IconButton>
                      </Tooltip>
                    </Zoom>
                    <Zoom in style={{ transitionDelay: '100ms' }}>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(stock.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Zoom>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditStockDialog
        open={!!editingStock}
        stock={editingStock}
        remainingCash={remainingCash}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <SellStockDialog
        open={!!sellingStock}
        stock={sellingStock}
        onClose={handleSellClose}
        onSave={onSell}
      />
    </Box>
  );
};

export default StockList; 