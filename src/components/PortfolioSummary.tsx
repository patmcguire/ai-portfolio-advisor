import React from 'react';
import {
  Paper,
  Grid,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PortfolioState } from '../types/investment';

interface PortfolioSummaryProps {
  portfolio: PortfolioState;
  onEditInitialCash?: () => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio, onEditInitialCash }) => {
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

  const getValueColor = (value: number) => {
    return value >= 0 ? 'success.main' : 'error.main';
  };

  interface SummaryCardProps {
    title: string;
    value: number;
    isPercentage?: boolean;
    showTrend?: boolean;
    onClick?: () => void;
  }

  const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isPercentage = false, showTrend = false, onClick }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
        {title}
        {onClick && (
          <Tooltip title={`Edit ${title}`}>
            <IconButton size="small" sx={{ ml: 1 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Typography>
      <Typography variant="h5" color={isPercentage ? getValueColor(value) : 'inherit'}>
        {isPercentage ? formatPercentage(value) : formatCurrency(value)}
      </Typography>
      {showTrend && (
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            opacity: 0.1,
            transform: 'rotate(-15deg)',
          }}
        >
          <Fade in>
            {value >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 100, color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 100, color: 'error.main' }} />
            )}
          </Fade>
        </Box>
      )}
    </Paper>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Initial Investment"
            value={portfolio.initialCash}
            onClick={onEditInitialCash}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Total Portfolio Value"
            value={portfolio.totalPortfolioValue + portfolio.remainingCash}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Total Performance"
            value={portfolio.totalPortfolioPerformance}
            isPercentage
            showTrend
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Remaining Cash"
            value={portfolio.remainingCash}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Unrealized Gain/Loss"
            value={portfolio.totalUnrealizedGainLoss}
            isPercentage
            showTrend
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Realized Gain/Loss"
            value={portfolio.totalRealizedGainLoss}
            showTrend
          />
        </Grid>
      </Grid>
    </Box>
  );
}; 