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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StockHolding } from '../types/investment';

interface EditStockDialogProps {
  open: boolean;
  stock: StockHolding | null;
  remainingCash: number;
  onClose: () => void;
  onSave: (updatedStock: StockHolding) => void;
}

export const EditStockDialog: React.FC<EditStockDialogProps> = ({
  open,
  stock,
  remainingCash,
  onClose,
  onSave,
}) => {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [pricePerShare, setPricePerShare] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());

  useEffect(() => {
    if (stock) {
      setTicker(stock.ticker);
      setShares(stock.shares.toString());
      setPricePerShare(stock.pricePerShare.toString());
      setPurchaseDate(stock.purchaseDate);
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
    const costBasis = numericShares * numericPrice;

    // Calculate the difference in cost to check against remaining cash
    const costDifference = costBasis - stock.costBasis;

    if (
      !isNaN(numericShares) &&
      !isNaN(numericPrice) &&
      costDifference <= remainingCash &&
      ticker.trim() !== ''
    ) {
      onSave({
        ...stock,
        ticker: ticker.trim().toUpperCase(),
        shares: numericShares,
        pricePerShare: numericPrice,
        costBasis,
        purchaseDate,
      });
      onClose();
    }
  };

  const totalCost = parseFloat(shares) * parseFloat(pricePerShare) || 0;
  const costDifference = stock ? totalCost - stock.costBasis : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Stock Purchase</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Purchase Date"
                value={purchaseDate}
                onChange={(newValue) => newValue && setPurchaseDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Total Cost"
              value={`$${totalCost.toFixed(2)}`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          {costDifference !== 0 && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cost Difference"
                value={`$${costDifference.toFixed(2)}`}
                InputProps={{ readOnly: true }}
                color={costDifference > 0 ? 'error' : 'success'}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={
            !ticker.trim() ||
            isNaN(parseFloat(shares)) ||
            isNaN(parseFloat(pricePerShare)) ||
            costDifference > remainingCash
          }
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 