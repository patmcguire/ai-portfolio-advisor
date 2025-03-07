import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import { PortfolioState } from '../types/investment';

interface PortfolioSummaryProps {
  portfolio: PortfolioState;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  const getGainLossColor = (amount: number) => {
    return amount >= 0 ? 'success.main' : 'error.main';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Portfolio Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Total Portfolio Value
            </Typography>
            <Typography variant="h5">
              {formatCurrency(portfolio.totalPortfolioValue)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Total Unrealized Gain/Loss
            </Typography>
            <Typography variant="h5" color={getGainLossColor(portfolio.totalUnrealizedGainLoss)}>
              {formatCurrency(portfolio.totalUnrealizedGainLoss)}
              {portfolio.totalPortfolioValue > 0 && (
                <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                  ({formatPercentage((portfolio.totalUnrealizedGainLoss / portfolio.totalPortfolioValue) * 100)})
                </Typography>
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Remaining Cash
            </Typography>
            <Typography variant="h5">
              {formatCurrency(portfolio.remainingCash)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}; 