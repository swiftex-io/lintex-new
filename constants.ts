
import { Asset, Trade, OrderBookEntry } from './types';

export const MOCK_ASSETS: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.245, available: 0.245, price: 65432.50, change24h: 2.45 },
  { symbol: 'ETH', name: 'Ethereum', balance: 4.12, available: 3.5, price: 3452.12, change24h: -1.2 },
  { symbol: 'USDT', name: 'Tether', balance: 12500.45, available: 12500.45, price: 1.00, change24h: 0.01 },
  { symbol: 'BNB', name: 'BNB', balance: 2.5, available: 2.5, price: 580.40, change24h: 0.8 },
  { symbol: 'SOL', name: 'Solana', balance: 15.0, available: 15.0, price: 145.67, change24h: 5.67 },
  { symbol: 'USDC', name: 'USD Coin', balance: 0, available: 0, price: 1.00, change24h: 0.00 },
  { symbol: 'XRP', name: 'Ripple', balance: 0, available: 0, price: 0.62, change24h: 1.2 },
  { symbol: 'ADA', name: 'Cardano', balance: 0, available: 0, price: 0.45, change24h: -0.5 },
  { symbol: 'DOGE', name: 'Dogecoin', balance: 0, available: 0, price: 0.16, change24h: 3.4 },
  { symbol: 'SHIB', name: 'Shiba Inu', balance: 0, available: 0, price: 0.000027, change24h: 2.1 },
  { symbol: 'AVAX', name: 'Avalanche', balance: 0, available: 0, price: 35.40, change24h: 4.2 },
  { symbol: 'DOT', name: 'Polkadot', balance: 0, available: 0, price: 7.20, change24h: -1.1 },
  { symbol: 'LINK', name: 'Chainlink', balance: 0, available: 0, price: 18.50, change24h: 0.9 },
  { symbol: 'TRX', name: 'TRON', balance: 0, available: 0, price: 0.12, change24h: 0.2 },
  { symbol: 'MATIC', name: 'Polygon', balance: 0, available: 0, price: 0.72, change24h: -2.3 },
  { symbol: 'NEAR', name: 'NEAR Protocol', balance: 0, available: 0, price: 6.80, change24h: 5.1 },
  { symbol: 'LTC', name: 'Litecoin', balance: 0, available: 0, price: 82.40, change24h: 1.5 },
  { symbol: 'BCH', name: 'Bitcoin Cash', balance: 0, available: 0, price: 480.20, change24h: -0.8 },
  { symbol: 'UNI', name: 'Uniswap', balance: 0, available: 0, price: 7.80, change24h: -3.2 },
  { symbol: 'DAI', name: 'Dai', balance: 0, available: 0, price: 1.00, change24h: 0.01 },
  { symbol: 'ATOM', name: 'Cosmos', balance: 0, available: 0, price: 8.50, change24h: 0.4 },
  { symbol: 'ETC', name: 'Ethereum Classic', balance: 0, available: 0, price: 28.40, change24h: 1.2 },
  { symbol: 'RNDR', name: 'Render', balance: 0, available: 0, price: 10.20, change24h: 6.7 },
  { symbol: 'FIL', name: 'Filecoin', balance: 0, available: 0, price: 5.80, change24h: -1.4 },
  { symbol: 'ICP', name: 'Internet Computer', balance: 0, available: 0, price: 12.40, change24h: 2.8 },
  { symbol: 'APT', name: 'Aptos', balance: 0, available: 0, price: 9.20, change24h: 0.5 },
  { symbol: 'PEPE', name: 'Pepe', balance: 0, available: 0, price: 0.000008, change24h: 12.4 },
  { symbol: 'HBAR', name: 'Hedera', balance: 0, available: 0, price: 0.11, change24h: 1.1 },
  { symbol: 'ARB', name: 'Arbitrum', balance: 0, available: 0, price: 1.15, change24h: -4.2 },
  { symbol: 'OP', name: 'Optimism', balance: 0, available: 0, price: 2.40, change24h: -2.1 },
];

export const MOCK_TRADES: Trade[] = [
  { id: '1', pair: 'BTC/USDT', type: 'buy', price: 65432.50, amount: 0.012, time: '14:20:11' },
  { id: '2', pair: 'BTC/USDT', type: 'sell', price: 65430.10, amount: 0.005, time: '14:20:05' },
  { id: '3', pair: 'BTC/USDT', type: 'buy', price: 65435.00, amount: 0.1, time: '14:19:55' },
];

export const MOCK_ASKS: OrderBookEntry[] = Array.from({ length: 15 }, (_, i) => ({
  price: 65435 + i * 2,
  amount: Math.random() * 0.5,
  total: 0
})).reverse();

export const MOCK_BIDS: OrderBookEntry[] = Array.from({ length: 15 }, (_, i) => ({
  price: 65430 - i * 2,
  amount: Math.random() * 0.8,
  total: 0
}));
