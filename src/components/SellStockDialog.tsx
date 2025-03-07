import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StockHolding } from '../types/investment';

interface SellStockDialogProps {
  open: boolean;
  stock: StockHolding | null;
  onClose: () => void;
  onSave: (stockId: string, sharesSold: number, salePricePerShare: number, dateSold: Date) => void;
}

export const SellStockDialog: React.FC<SellStockDialogProps> = ({
  open,
  stock,
  onClose,
  onSave,
}) => {
  const [shares, setShares] = useState('');
  const [pricePerShare, setPricePerShare] = useState('');
  const [saleDate, setSaleDate] = useState<Date>(new Date());

  useEffect(() => {
    if (stock) {
      setShares('');
      setPricePerShare(stock.currentPrice?.toString() || '');
      setSaleDate(new Date());
    }
  }, [stock]);

  const handleNumberChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleSave = () => {
    if (!stock) return;

    const numericShares = parseFloat(shares);
    const numericPrice = parseFloat(pricePerShare);

    if (
      !isNaN(numericShares) &&
      !isNaN(numericPrice) &&
      numericShares > 0 &&
      numericShares <= stock.shares &&
      numericPrice > 0
    ) {
      onSave(stock.id, numericShares, numericPrice, saleDate);
      onClose();
    }
  };

  const totalProceeds = parseFloat(shares) * parseFloat(pricePerShare) || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sell Stock</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ticker"
              value={stock?.ticker || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Available Shares"
              value={stock?.shares || 0}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shares to Sell"
              type="text"
              value={shares}
              onChange={handleNumberChange(setShares)}
              required
              error={parseFloat(shares) > (stock?.shares || 0)}
              helperText={parseFloat(shares) > (stock?.shares || 0) ? "Can't sell more shares than owned" : ''}
              inputProps={{ 
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*'
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sale Price per Share"
              type="text"
              value={pricePerShare}
              onChange={handleNumberChange(setPricePerShare)}
              required
              inputProps={{ 
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*'
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <DatePicker
              label="Sale Date"
              value={saleDate}
              onChange={(newValue) => newValue && setSaleDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Total Proceeds"
              value={`$${totalProceeds.toFixed(2)}`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={
            !shares ||
            !pricePerShare ||
            parseFloat(shares) <= 0 ||
            parseFloat(shares) > (stock?.shares || 0) ||
            parseFloat(pricePerShare) <= 0
          }
        >
          Sell Shares
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 