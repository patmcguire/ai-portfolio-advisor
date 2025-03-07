import React, { useState, useRef } from 'react';
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
  Stack,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import { StockHolding, PortfolioState } from '../types/investment';

interface PortfolioExportProps {
  stocks: StockHolding[];
  initialCash: number;
  remainingCash: number;
  onRestore?: (data: PortfolioState) => void;
}

export const PortfolioExport: React.FC<PortfolioExportProps> = ({
  stocks,
  initialCash,
  remainingCash,
  onRestore,
}) => {
  const [open, setOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleBackup = () => {
    const portfolioData: PortfolioState = {
      initialCash,
      remainingCash,
      stocks,
      totalPortfolioValue: stocks.reduce((sum, stock) => sum + (stock.marketValue || 0), 0),
      totalUnrealizedGainLoss: stocks.reduce((sum, stock) => sum + (stock.unrealizedGainLoss || 0), 0) / stocks.length,
    };

    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onRestore) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Convert date strings back to Date objects
        const processedData = {
          ...data,
          stocks: data.stocks.map((stock: any) => ({
            ...stock,
            purchaseDate: new Date(stock.purchaseDate),
            dateSold: stock.dateSold ? new Date(stock.dateSold) : undefined,
          })),
        };

        onRestore(processedData);
      } catch (error) {
        console.error('Error restoring portfolio data:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Tooltip title="Export Portfolio">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleOpen}
          >
            Export as CSV
          </Button>
        </Tooltip>
        <Tooltip title="Backup Portfolio">
          <Button
            variant="outlined"
            startIcon={<BackupIcon />}
            onClick={handleBackup}
            color="primary"
          >
            Backup Portfolio
          </Button>
        </Tooltip>
        {onRestore && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleRestore}
            />
            <Tooltip title="Restore Portfolio">
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={() => fileInputRef.current?.click()}
                color="secondary"
              >
                Restore Portfolio
              </Button>
            </Tooltip>
          </>
        )}
      </Stack>

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