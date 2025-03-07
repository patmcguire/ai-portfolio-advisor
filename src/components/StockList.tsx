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
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Stock Holdings
        </Typography>
        <Tooltip title="Refresh Prices">
          <IconButton 
            onClick={onRefreshPrices} 
            disabled={isLoadingPrices}
            color="primary"
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
              <TableCell align="right">Purchase Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell component="th" scope="row">
                  {stock.ticker}
                </TableCell>
                <TableCell align="right">{stock.shares.toFixed(2)}</TableCell>
                <TableCell align="right">{formatCurrency(stock.costBasis)}</TableCell>
                <TableCell align="right">
                  {isLoadingPrices ? (
                    <CircularProgress size={20} />
                  ) : stock.currentPrice ? (
                    formatCurrency(stock.currentPrice)
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="right">
                  {isLoadingPrices ? (
                    <CircularProgress size={20} />
                  ) : stock.marketValue ? (
                    formatCurrency(stock.marketValue)
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{
                    color: getGainLossColor(stock.unrealizedGainLoss || 0),
                  }}
                >
                  {isLoadingPrices ? (
                    <CircularProgress size={20} />
                  ) : stock.unrealizedGainLoss !== undefined ? (
                    <>
                      {formatCurrency(stock.unrealizedGainLoss)}
                      <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                        ({formatPercentage((stock.unrealizedGainLoss / stock.costBasis) * 100)})
                      </Typography>
                    </>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="right">
                  {stock.purchaseDate.toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(stock)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleSellClick(stock)}
                    color="success"
                  >
                    <SellIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(stock.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
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