
import { create } from 'zustand';
import { Asset, Trade, Order, Notification } from './types';
import { MOCK_ASSETS } from './constants';
import { supabase } from './lib/supabase';

export type ReferralTier = 'Rookie' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface TierBenefits {
  commission: number;
  feeDiscount: number;
  aprBoost: number;
  perks: string[];
  color: string;
  requirement: number;
  volRequirement: number;
  avgEarn: string;
}

export const TIER_DATA: Record<ReferralTier, TierBenefits> = {
  Rookie: { 
    commission: 10, feeDiscount: 0, aprBoost: 0, 
    perks: ['Standard Support'], color: '#71717a', 
    requirement: 0, volRequirement: 0, avgEarn: '$0' 
  },
  Bronze: { 
    commission: 20, feeDiscount: 5, aprBoost: 0.2, 
    perks: ['Bronze Badge'], color: '#CD7F32', 
    requirement: 1, volRequirement: 0, avgEarn: '$50' 
  },
  Silver: { 
    commission: 30, feeDiscount: 15, aprBoost: 0.8, 
    perks: ['Priority Support', 'API Boost'], color: '#C0C0C0', 
    requirement: 11, volRequirement: 1000, avgEarn: '$450' 
  },
  Gold: { 
    commission: 50, feeDiscount: 30, aprBoost: 2.0, 
    perks: ['Exclusive Events', 'Early Access'], color: '#FFD700', 
    requirement: 51, volRequirement: 50000, avgEarn: '$3,200' 
  },
  Platinum: { 
    commission: 75, feeDiscount: 50, aprBoost: 5.0, 
    perks: ['VIP Support', 'Custom Rates', 'VIP Merch'], color: '#E5E4E2', 
    requirement: 201, volRequirement: 500000, avgEarn: '$15,000' 
  },
};

// Audio Utilities
const SOUNDS = {
  PLACED: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  FILLED: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' 
};

const playAudio = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(e => console.debug('Audio play blocked by browser policy until interaction.'));
};

const getTimestamp = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toLocaleTimeString([], { hour12: false });
  return `${date} ${time}`;
};

interface ExchangeState {
  balances: Asset[];
  tradeHistory: Trade[];
  openOrders: Order[];
  filledOrders: Order[]; 
  notifications: Notification[];
  favorites: string[];
  referralCode: string;
  referralCount: number;
  referralVolume: number;
  earnings: number;
  referralXP: number;
  isSyncing: boolean;
  user: any | null;
  profile: { nickname: string } | null;
  isGuest: boolean;
  isDepositModalOpen: boolean;
  marketsActiveTab: 'Markets Overview' | 'Rankings';
  activePair: string;
  
  initialize: () => Promise<void>;
  setUser: (user: any) => void;
  enterAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  deposit: (symbol: string, amount: number) => Promise<void>;
  withdraw: (symbol: string, amount: number) => Promise<void>;
  executeTrade: (pair: string, type: 'buy' | 'sell', price: number, amount: number) => Promise<boolean>;
  placeOrder: (order: Omit<Order, 'id' | 'filled' | 'status' | 'time'>) => Promise<boolean>;
  cancelOrder: (id: string) => void;
  updatePrices: (priceData: Record<string, number | { price: number; change24h: number }>) => void;
  setDepositModalOpen: (open: boolean) => void;
  setMarketsActiveTab: (tab: 'Markets Overview' | 'Rankings') => void;
  getTier: () => ReferralTier;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  setActivePair: (pair: string) => void;
  toggleFavorite: (symbol: string) => void;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  balances: [...MOCK_ASSETS],
  tradeHistory: [],
  openOrders: [],
  filledOrders: [],
  notifications: [],
  favorites: [],
  referralCode: 'LINTEX_PRO_88',
  referralCount: 0,
  referralVolume: 0,
  earnings: 0.00,
  referralXP: 0,
  isSyncing: false,
  user: null,
  profile: null,
  isGuest: false,
  isDepositModalOpen: false,
  marketsActiveTab: 'Markets Overview',
  activePair: 'BTC/USDT',

  getTier: () => {
    const count = get().referralCount;
    if (count >= 201) return 'Platinum';
    if (count >= 51) return 'Gold';
    if (count >= 11) return 'Silver';
    if (count >= 1) return 'Bronze';
    return 'Rookie';
  },

  setActivePair: (pair) => set({ activePair: pair }),

  toggleFavorite: (symbol) => {
    const { favorites } = get();
    if (favorites.includes(symbol)) {
      set({ favorites: favorites.filter(s => s !== symbol) });
    } else {
      set({ favorites: [...favorites, symbol] });
    }
  },

  addNotification: (n) => {
    const id = Math.random().toString(36).substring(2, 9);
    set(s => ({ 
      notifications: [{ ...n, id, timestamp: Date.now() }, ...s.notifications].slice(0, 5) 
    }));
    setTimeout(() => get().removeNotification(id), 5000);
  },

  removeNotification: (id) => set(s => ({ 
    notifications: s.notifications.filter(n => n.id !== id) 
  })),

  setMarketsActiveTab: (tab) => set({ marketsActiveTab: tab }),
  setDepositModalOpen: (open: boolean) => set({ isDepositModalOpen: open }),
  setUser: (user) => set({ user, isGuest: false }),

  enterAsGuest: async () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      email: 'guest@lintex.exchange',
      user_metadata: { nickname: 'Guest_Trader' }
    };
    
    set({ 
      user: guestUser, 
      profile: { nickname: 'Guest_Trader' },
      isGuest: true, 
      balances: MOCK_ASSETS.map(b => b.symbol === 'USDT' ? { ...b, balance: 10000, available: 10000 } : { ...b, balance: 0.1, available: 0.1 }),
      tradeHistory: [],
      openOrders: [],
      filledOrders: []
    });
    localStorage.setItem('lintex_guest_session', JSON.stringify(guestUser));
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('lintex_guest_session');
    set({ user: null, profile: null, isGuest: false, tradeHistory: [], openOrders: [], filledOrders: [], balances: [...MOCK_ASSETS] });
  },

  initialize: async () => {
    set({ isSyncing: true });
    try {
      const savedGuest = localStorage.getItem('lintex_guest_session');
      if (savedGuest) {
        const guestUser = JSON.parse(savedGuest);
        set({ 
          user: guestUser, 
          profile: { nickname: guestUser.user_metadata?.nickname || 'Guest' },
          isGuest: true,
          balances: MOCK_ASSETS.map(b => {
             if (b.symbol === 'USDT') return { ...b, balance: 10000, available: 10000 };
             if (b.symbol === 'BTC') return { ...b, balance: 0.245, available: 0.245 };
             return { ...b, balance: 0, available: 0 };
          })
        });
        set({ isSyncing: false });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        set({ user, isGuest: false });
        set({ profile: { nickname: user.email?.split('@')[0] || 'Trader' } });
      }
    } catch (err) {
      console.error("Initialization failed:", err);
    } finally {
      set({ isSyncing: false });
    }
  },

  deposit: async (symbol, amount) => {
    const { user } = get();
    if (!user) return;
    set((state) => ({
      balances: state.balances.map(b => b.symbol === symbol ? { ...b, balance: b.balance + amount, available: b.available + amount } : b)
    }));
  },

  withdraw: async (symbol, amount) => {
    const { balances } = get();
    const asset = balances.find(b => b.symbol === symbol);
    if (!asset || asset.available < amount) return;
    set((state) => ({
      balances: state.balances.map(b => b.symbol === symbol ? { ...b, balance: b.balance - amount, available: b.available - amount } : b)
    }));
  },

  updatePrices: (priceData) => {
    const { openOrders, balances, tradeHistory, addNotification } = get();
    const updatedHistory: Trade[] = [...tradeHistory];
    const nextOpenOrders: Order[] = [];
    let updatedFilledOrders: Order[] = [...get().filledOrders];
    let balancesChanged = false;
    let updatedBalances = [...balances];
    let playSuccess = false;

    openOrders.forEach(order => {
      const baseSymbol = order.symbol.split('/')[0];
      const pairKey = `${baseSymbol}USDT`;
      const priceEntry = priceData[pairKey];
      const currentPrice = typeof priceEntry === 'object' ? priceEntry.price : priceEntry;
      
      if (!currentPrice) {
        nextOpenOrders.push(order);
        return;
      }

      // 1. Handle TP/SL Triggers (Conditional Orders)
      if (order.type === 'tpsl') {
        let triggered = false;
        let triggerType: 'tp' | 'sl' | null = null;

        if (order.side === 'sell') {
          if (order.tpPrice && currentPrice >= order.tpPrice) { triggered = true; triggerType = 'tp'; }
          else if (order.slPrice && currentPrice <= order.slPrice) { triggered = true; triggerType = 'sl'; }
        } else {
          if (order.tpPrice && currentPrice <= order.tpPrice) { triggered = true; triggerType = 'tp'; }
          else if (order.slPrice && currentPrice >= order.slPrice) { triggered = true; triggerType = 'sl'; }
        }

        if (triggered) {
          balancesChanged = true;
          playSuccess = true;
          
          const sideLabel = triggerType === 'tp' ? 'Take Profit' : 'Stop Loss';
          addNotification({
            title: `${sideLabel} Triggered`,
            message: `Closed ${order.amount} ${baseSymbol} @ ${currentPrice.toLocaleString()}`,
            type: triggerType === 'tp' ? 'success' : 'warning'
          });

          const quoteSymbol = order.symbol.split('/')[1];
          updatedBalances = updatedBalances.map(b => {
            if (order.side === 'sell') { 
              if (b.symbol === baseSymbol) return { ...b, balance: b.balance - order.amount, available: b.available - order.amount };
              if (b.symbol === quoteSymbol) return { ...b, balance: b.balance + (currentPrice * order.amount), available: b.available + (currentPrice * order.amount) };
            } else { 
              if (b.symbol === quoteSymbol) return { ...b, balance: b.balance - (currentPrice * order.amount), available: b.available - (currentPrice * order.amount) };
              if (b.symbol === baseSymbol) return { ...b, balance: b.balance + order.amount, available: b.available + order.amount };
            }
            return b;
          });

          updatedHistory.unshift({
            id: `exit-${order.id}`,
            pair: order.symbol,
            type: order.side,
            price: currentPrice,
            amount: order.amount,
            time: getTimestamp()
          });
          
          // Update status in history
          updatedFilledOrders = updatedFilledOrders.map(o => o.id === order.id ? { ...o, status: 'filled', filled: order.amount } : o);
          return; 
        } else {
          nextOpenOrders.push(order);
          return;
        }
      }

      // 2. Handle Limit/Market Fills (Entry Orders)
      let isFilled = false;
      if (order.side === 'buy') {
        if (currentPrice <= order.price) isFilled = true;
      } else {
        if (currentPrice >= order.price) isFilled = true;
      }

      if (isFilled) {
        balancesChanged = true;
        playSuccess = true;
        
        // Update history entry status
        updatedFilledOrders = updatedFilledOrders.map(o => o.id === order.id ? { ...o, status: 'filled', filled: order.amount } : o);

        updatedHistory.unshift({
          id: order.id,
          pair: order.symbol,
          type: order.side,
          price: order.price, 
          amount: order.amount,
          time: getTimestamp()
        });
        
        addNotification({
          title: 'Limit Order Filled',
          message: `${order.side.toUpperCase()} ${order.amount} ${baseSymbol} @ ${order.price.toLocaleString()}`,
          type: 'success'
        });

        const quoteSymbol = order.symbol.split('/')[1];
        updatedBalances = updatedBalances.map(b => {
          if (order.side === 'buy') {
             if (b.symbol === quoteSymbol) return { ...b, balance: b.balance - (order.price * order.amount) };
             if (b.symbol === baseSymbol) return { ...b, balance: b.balance + order.amount, available: b.available + order.amount };
          } else {
             if (b.symbol === baseSymbol) return { ...b, balance: b.balance - order.amount };
             if (b.symbol === quoteSymbol) return { ...b, balance: b.balance + (order.price * order.amount), available: b.available + (order.price * order.amount) };
          }
          return b;
        });

        if (order.tpPrice || order.slPrice) {
          const tpslExitOrder: Order = {
            id: `tpsl-exit-${order.id}`,
            symbol: order.symbol,
            side: order.side === 'buy' ? 'sell' : 'buy',
            type: 'tpsl',
            price: order.price,
            amount: order.amount,
            filled: 0,
            status: 'open',
            time: getTimestamp(),
            tpPrice: order.tpPrice,
            slPrice: order.slPrice
          };
          nextOpenOrders.push(tpslExitOrder);
          // Also add protective order to history as Pending
          updatedFilledOrders.unshift(tpslExitOrder);
          
          addNotification({
            title: 'TP/SL Protection Active',
            message: `Conditional exit order created for ${baseSymbol}`,
            type: 'info'
          });
        }
      } else {
        nextOpenOrders.push(order);
      }
    });

    if (playSuccess) playAudio(SOUNDS.FILLED);

    set((state) => ({
      openOrders: nextOpenOrders,
      filledOrders: updatedFilledOrders,
      tradeHistory: updatedHistory,
      balances: (balancesChanged ? updatedBalances : state.balances).map(asset => {
        const pair = `${asset.symbol}USDT`;
        const entry = priceData[pair];
        if (!entry) return asset;
        
        if (typeof entry === 'object') {
          return {
            ...asset,
            price: entry.price,
            change24h: entry.change24h
          };
        }
        return {
          ...asset,
          price: entry
        };
      })
    }));
  },

  placeOrder: async (orderData) => {
    const { balances, addNotification } = get();
    const base = orderData.symbol.split('/')[0];
    const quote = orderData.symbol.split('/')[1];
    const orderId = Math.random().toString(36).substr(2, 9);
    const timestamp = getTimestamp();

    if (orderData.type === 'market') {
      const bAsset = balances.find(b => b.symbol === base);
      const qAsset = balances.find(b => b.symbol === quote);
      
      if (orderData.side === 'buy') {
        const cost = orderData.price * orderData.amount;
        if (!qAsset || qAsset.available < cost) return false;
        
        set(s => ({
          balances: s.balances.map(b => {
            if (b.symbol === quote) return { ...b, balance: b.balance - cost, available: b.available - cost };
            if (b.symbol === base) return { ...b, balance: b.balance + orderData.amount, available: b.available + orderData.amount };
            return b;
          }),
          tradeHistory: [{
            id: orderId,
            pair: orderData.symbol,
            type: 'buy',
            price: orderData.price,
            amount: orderData.amount,
            time: timestamp
          }, ...s.tradeHistory],
          filledOrders: [{
            ...orderData,
            id: orderId,
            filled: orderData.amount,
            status: 'filled',
            time: timestamp
          }, ...s.filledOrders]
        }));
      } else {
        if (!bAsset || bAsset.available < orderData.amount) return false;
        const gain = orderData.price * orderData.amount;
        
        set(s => ({
          balances: s.balances.map(b => {
            if (b.symbol === base) return { ...b, balance: b.balance - orderData.amount, available: b.available - orderData.amount };
            if (b.symbol === quote) return { ...b, balance: b.balance + gain, available: b.available + gain };
            return b;
          }),
          tradeHistory: [{
            id: orderId,
            pair: orderData.symbol,
            type: 'sell',
            price: orderData.price,
            amount: orderData.amount,
            time: timestamp
          }, ...s.tradeHistory],
          filledOrders: [{
            ...orderData,
            id: orderId,
            filled: orderData.amount,
            status: 'filled',
            time: timestamp
          }, ...s.filledOrders]
        }));
      }

      playAudio(SOUNDS.FILLED);
      addNotification({
        title: 'Order Filled',
        message: `${orderData.side.toUpperCase()} ${orderData.amount} ${base} @ ${orderData.price.toLocaleString()}`,
        type: 'success'
      });

      if (orderData.tpPrice || orderData.slPrice) {
        const tpslExitOrder: Order = {
          id: `tpsl-exit-mkt-${Math.random().toString(36).substr(2, 9)}`,
          symbol: orderData.symbol,
          side: orderData.side === 'buy' ? 'sell' : 'buy',
          type: 'tpsl',
          price: orderData.price,
          amount: orderData.amount,
          filled: 0,
          status: 'open',
          time: timestamp,
          tpPrice: orderData.tpPrice,
          slPrice: orderData.slPrice
        };
        set(s => ({ 
          openOrders: [...s.openOrders, tpslExitOrder],
          filledOrders: [tpslExitOrder, ...s.filledOrders]
        }));
      }

      return true;
    } else {
      if (orderData.side === 'buy') {
        const quoteAsset = balances.find(b => b.symbol === quote);
        const cost = orderData.price * orderData.amount;
        if (!quoteAsset || quoteAsset.available < cost) return false;
        
        set(s => ({
          balances: s.balances.map(b => b.symbol === quote ? { ...b, available: b.available - cost } : b)
        }));
      } else {
        const baseAsset = balances.find(b => b.symbol === base);
        if (!baseAsset || baseAsset.available < orderData.amount) return false;
        
        set(s => ({
          balances: s.balances.map(b => b.symbol === base ? { ...b, available: b.available - orderData.amount } : b)
        }));
      }

      const newOrder: Order = {
        ...orderData,
        id: orderId,
        filled: 0,
        status: 'open',
        time: timestamp
      };

      set(s => ({ 
        openOrders: [...s.openOrders, newOrder],
        filledOrders: [newOrder, ...s.filledOrders]
      }));
      playAudio(SOUNDS.PLACED);
      addNotification({
        title: 'Order Placed',
        message: `Limit ${orderData.side.toUpperCase()} ${orderData.amount} ${base} @ ${orderData.price.toLocaleString()}`,
        type: 'info'
      });

      return true;
    }
  },

  cancelOrder: (id) => {
    const { openOrders, filledOrders, addNotification } = get();
    const order = openOrders.find(o => o.id === id);
    if (!order) return;

    const quote = order.symbol.split('/')[1];
    const base = order.symbol.split('/')[0];

    if (order.type === 'limit') {
      if (order.side === 'buy') {
        const cost = order.price * order.amount;
        set(s => ({
          balances: s.balances.map(b => b.symbol === quote ? { ...b, available: b.available + cost } : b)
        }));
      } else {
        set(s => ({
          balances: s.balances.map(b => b.symbol === base ? { ...b, available: b.available + order.amount } : b)
        }));
      }
    }

    set(s => ({ 
      openOrders: s.openOrders.filter(o => o.id !== id),
      filledOrders: s.filledOrders.map(o => o.id === id ? { ...o, status: 'canceled' } : o)
    }));
    
    addNotification({
      title: 'Order Canceled',
      message: `${order.type === 'tpsl' ? 'TP/SL Protection' : order.side.toUpperCase() + ' ' + order.amount + ' ' + base} canceled.`,
      type: 'warning'
    });
  },

  executeTrade: async (pair, type, price, amount) => {
    return get().placeOrder({ symbol: pair, side: type, price, amount, type: 'market' });
  },
}));
