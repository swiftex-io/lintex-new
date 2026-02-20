export enum Page {
  TRADE = 'trade',
  ASSETS = 'assets',
  REFERRAL = 'referral',
  AFFILIATE = 'affiliate',
  SETTINGS = 'settings',
  HOME = 'home',
  MARKETS = 'markets',
  SIMPLE_EARN = 'simple_earn',
  SPOT_DCA = 'spot_dca'
}

export type LayoutType = 'default' | 'trading' | 'none';

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  available: number;
  price: number;
  change24h: number;
}

export interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  time: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'tpsl';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'filled' | 'canceled';
  time: string;
  tpPrice?: number;
  slPrice?: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
  timestamp: number;
}