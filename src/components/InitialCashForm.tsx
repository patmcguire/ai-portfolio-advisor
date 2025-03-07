import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';

interface InitialCashFormProps {
  onSubmit: (amount: number) => void;
  initialCash: number;
}

export const InitialCashForm: React.FC<InitialCashFormProps> = ({
  onSubmit,
  initialCash,
}) => {
  const [amount, setAmount] = useState(initialCash.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount >= 0) {
      onSubmit(numericAmount);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Initial Cash Balance
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Amount"
          type="text"
          value={amount}
          onChange={handleAmountChange}
          inputProps={{ 
            inputMode: 'decimal',
            pattern: '[0-9]*\\.?[0-9]*'
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isNaN(parseFloat(amount)) || parseFloat(amount) < 0}
        >
          Set Initial Cash
        </Button>
      </Box>
    </Paper>
  );
}; 