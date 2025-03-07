import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface EditInitialCashDialogProps {
  open: boolean;
  currentValue: number;
  onClose: () => void;
  onSave: (newValue: number) => void;
}

export const EditInitialCashDialog: React.FC<EditInitialCashDialogProps> = ({
  open,
  currentValue,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState(currentValue.toString());

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount >= 0) {
      onSave(numericAmount);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Initial Investment</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Initial Investment"
          type="text"
          value={amount}
          onChange={handleAmountChange}
          sx={{ mt: 2 }}
          inputProps={{ 
            inputMode: 'decimal',
            pattern: '[0-9]*\\.?[0-9]*'
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={isNaN(parseFloat(amount)) || parseFloat(amount) < 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 