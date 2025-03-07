const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

interface AlphaVantageQuote {
  '01. symbol': string;
  '05. price': string;
}

// Cache for storing stock prices
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 10 * 1000; // 10 seconds in milliseconds

export const fetchStockPrice = async (symbol: string): Promise<number> => {
  try {
    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached price for ${symbol}: $${cached.price}`);
      return cached.price;
    }

    if (!ALPHA_VANTAGE_API_KEY) {
      console.error('Alpha Vantage API key is not configured. Please add your API key to the .env file.');
      return 0;
    }

    const response = await fetch(
      `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock price');
    }
    
    const data = await response.json();
    console.log(`API Response for ${symbol}:`, data); // Debug log

    // Check for API error messages
    if (data['Error Message']) {
      console.error(`API Error for ${symbol}:`, data['Error Message']);
      return 0;
    }

    // Check for API limit message
    if (data['Note']) {
      console.warn(`API Limit for ${symbol}:`, data['Note']);
      return 0;
    }

    const quote = data['Global Quote'] as AlphaVantageQuote;
    if (!quote || !quote['05. price']) {
      console.error(`Invalid quote data for ${symbol}:`, quote);
      return 0;
    }

    const price = parseFloat(quote['05. price']);
    if (isNaN(price)) {
      console.error(`Invalid price for ${symbol}:`, quote['05. price']);
      return 0;
    }

    // Update cache
    priceCache.set(symbol, { price, timestamp: Date.now() });
    console.log(`Successfully fetched price for ${symbol}: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return 0;
  }
};

export const fetchStockPrices = async (symbols: string[]): Promise<Map<string, number>> => {
  const prices = new Map<string, number>();
  
  try {
    // Group symbols into batches of 5 (Alpha Vantage's limit)
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      console.log(`Fetching prices for batch: ${batch.join(', ')}`); // Debug log
      
      // Fetch all symbols in the batch concurrently
      const batchPromises = batch.map(symbol => fetchStockPrice(symbol));
      const batchPrices = await Promise.all(batchPromises);
      
      // Add successful prices to the result map
      batch.forEach((symbol, index) => {
        const price = batchPrices[index];
        if (price > 0) {
          prices.set(symbol, price);
        }
      });

      // Add a small delay between batches to respect rate limits
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error('Error fetching stock prices:', error);
  }
  
  return prices;
}; 