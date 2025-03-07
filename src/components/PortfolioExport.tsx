import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { StockHolding } from '../types/investment';

interface PortfolioExportProps {
  stocks: StockHolding[];
  initialCash: number;
  remainingCash: number;
}

export const PortfolioExport: React.FC<PortfolioExportProps> = ({
  stocks,
  initialCash,
  remainingCash,
}) => {
  const [open, setOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCopySuccess(false);
  };

  const generateCSV = () => {
    const headers = [
      'Ticker',
      'Shares',
      'Cost Per Share',
      'Total Cost',
      'Current Price',
      'Market Value',
      'Unrealized Gain/Loss %',
      'Purchase Date',
    ].join(',');

    const stockRows = stocks.map(stock => [
      stock.ticker,
      stock.shares.toFixed(2),
      stock.pricePerShare.toFixed(2),
      stock.costBasis.toFixed(2),
      (stock.currentPrice || 0).toFixed(2),
      (stock.marketValue || 0).toFixed(2),
      ((stock.unrealizedGainLoss || 0)).toFixed(2) + '%',
      stock.purchaseDate.toLocaleDateString(),
    ].join(','));

    const summaryRows = [
      '',
      'Portfolio Summary',
      '',
      `Initial Cash,${initialCash.toFixed(2)}`,
      `Remaining Cash,${remainingCash.toFixed(2)}`,
      `Total Invested,${(initialCash - remainingCash).toFixed(2)}`,
    ];

    return [headers, ...stockRows, '', ...summaryRows].join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCSV());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Tooltip title="Export Portfolio">
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleOpen}
          sx={{ mt: 2 }}
        >
          Export Portfolio
        </Button>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Portfolio Export (CSV)</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative' }}>
            <TextField
              multiline
              fullWidth
              rows={12}
              value={generateCSV()}
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace' },
              }}
            />
            <Tooltip title={copySuccess ? "Copied!" : "Copy to Clipboard"}>
              <IconButton
                onClick={handleCopy}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
                color={copySuccess ? "success" : "default"}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleDownload} variant="contained" startIcon={<DownloadIcon />}>
            Download CSV
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 