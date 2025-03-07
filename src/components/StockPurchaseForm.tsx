import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StockHolding } from '../types/investment';

interface StockPurchaseFormProps {
  onSubmit: (purchase: Omit<StockHolding, 'id' | 'costBasis' | 'currentPrice' | 'marketValue' | 'unrealizedGainLoss'>) => void;
  remainingCash: number;
}

export const StockPurchaseForm: React.FC<StockPurchaseFormProps> = ({
  onSubmit,
  remainingCash,
}) => {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [pricePerShare, setPricePerShare] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericShares = parseFloat(shares);
    const numericPrice = parseFloat(pricePerShare);
    const costBasis = numericShares * numericPrice;

    if (
      !isNaN(numericShares) &&
      !isNaN(numericPrice) &&
      costBasis <= remainingCash &&
      ticker.trim() !== ''
    ) {
      onSubmit({
        ticker: ticker.trim().toUpperCase(),
        shares: numericShares,
        pricePerShare: numericPrice,
        purchaseDate,
      });
      setTicker('');
      setShares('');
      setPricePerShare('');
      setPurchaseDate(new Date());
    }
  };

  const handleNumberChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const totalCost = parseFloat(shares) * parseFloat(pricePerShare) || 0;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Stock Purchase
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Shares"
              type="text"
              value={shares}
              onChange={handleNumberChange(setShares)}
              required
              inputProps={{ 
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*'
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Price per Share"
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
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Purchase Date"
                value={purchaseDate}
                onChange={(newValue) => newValue && setPurchaseDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography>
            Total Cost: ${totalCost.toFixed(2)}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              !ticker.trim() ||
              isNaN(parseFloat(shares)) ||
              isNaN(parseFloat(pricePerShare)) ||
              totalCost > remainingCash
            }
          >
            Add Purchase
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 