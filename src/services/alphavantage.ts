const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const fetchStockPrice = async (symbol: string): Promise<number> => {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log(`Fetching price for ${symbol}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API Response for ${symbol}:`, data);
    
    // Check if we hit API limits
    if (data.Note && data.Note.includes('API call frequency')) {
      console.warn('API Rate Limit Message:', data.Note);
      throw new Error('API call frequency exceeded');
    }
    
    // Check if we have valid data
    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
      console.warn(`No price data found for ${symbol}. Full response:`, data);
      return 0;
    }
    
    const price = parseFloat(data['Global Quote']['05. price']);
    console.log(`Successfully fetched price for ${symbol}: $${price}`);
    return isNaN(price) ? 0 : price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    throw error;
  }
};

export const fetchStockPrices = async (symbols: string[]): Promise<Record<string, number>> => {
  const prices: Record<string, number> = {};
  
  for (const symbol of symbols) {
    try {
      // Add a small random delay between requests (0.5-1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const price = await fetchStockPrice(symbol);
      if (price > 0) {
        prices[symbol] = price;
      } else {
        console.warn(`Skipping ${symbol} due to invalid price`);
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      // Don't retry on API limit errors
      if (error instanceof Error && error.message.includes('API call frequency')) {
        console.warn('API rate limit reached, skipping remaining symbols');
        break;
      }
    }
  }
  
  return prices;
}; 