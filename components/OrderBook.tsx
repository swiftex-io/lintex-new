
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_ASKS, MOCK_BIDS } from '../constants';
import { useExchangeStore } from '../store';

interface OrderBookProps {
  currentPrice?: number;
  onPriceSelect?: (price: number) => void;
}

interface LiveOrderEntry {
  priceOffset: number;
  amount: number;
  flash?: 'up' | 'down' | null;
}

interface MarketTrade {
  id: string;
  price: number;
  amount: number;
  time: string;
  side: 'buy' | 'sell';
}

type ViewMode = 'mixed' | 'buy' | 'sell';

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice = 65432.50, onPriceSelect }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'trades'>('book');
  const [viewMode, setViewMode] = useState<ViewMode>('mixed');
  const [asks, setAsks] = useState<LiveOrderEntry[]>([]);
  const [bids, setBids] = useState<LiveOrderEntry[]>([]);
  const [marketTrades, setMarketTrades] = useState<MarketTrade[]>([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  const { openOrders } = useExchangeStore();
  
  const spread = 2.5;
  const spreadPercent = ((spread / currentPrice) * 100).toFixed(4);
  
  // Dynamic visible rows based on view mode and screen size
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1500);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleRows = useMemo(() => {
    if (viewMode === 'mixed') return isLargeScreen ? 20 : 10;
    return isLargeScreen ? 40 : 20;
  }, [viewMode, isLargeScreen]);

  // Initialize data
  useEffect(() => {
    // We generate enough mock data to fill the expanded view
    const baseAsks = Array.from({ length: 80 }, (_, i) => ({
      priceOffset: i * 0.5 + spread / 2,
      amount: Math.random() * 0.8,
      flash: null as 'up' | 'down' | null
    }));
    const baseBids = Array.from({ length: 80 }, (_, i) => ({
      priceOffset: i * 0.5 + spread / 2,
      amount: Math.random() * 0.8,
      flash: null as 'up' | 'down' | null
    }));

    setAsks(baseAsks.slice(0, visibleRows));
    setBids(baseBids.slice(0, visibleRows));

    const initialTrades: MarketTrade[] = Array.from({ length: 50 }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      price: currentPrice + (Math.random() - 0.5) * 10,
      amount: Math.random() * 0.5,
      time: new Date(Date.now() - i * 10000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      side: Math.random() > 0.5 ? 'buy' : 'sell'
    }));
    setMarketTrades(initialTrades);
  }, [currentPrice, visibleRows]);

  // Simulate live updates for Order Book volume
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const targetSide = Math.random() > 0.5 ? 'asks' : 'bids';
      const rowIndex = Math.floor(Math.random() * visibleRows);
      
      if (targetSide === 'asks') {
        setAsks(prev => prev.map((row, idx) => {
          if (idx !== rowIndex) return { ...row, flash: null };
          const oldAmount = row.amount;
          const newAmount = Math.max(0.001, row.amount + (Math.random() - 0.4) * 0.1);
          return { 
            ...row, 
            amount: newAmount, 
            flash: newAmount > oldAmount ? 'up' : 'down' 
          };
        }));
      } else {
        setBids(prev => prev.map((row, idx) => {
          if (idx !== rowIndex) return { ...row, flash: null };
          const oldAmount = row.amount;
          const newAmount = Math.max(0.001, row.amount + (Math.random() - 0.4) * 0.1);
          return { 
            ...row, 
            amount: newAmount, 
            flash: newAmount > oldAmount ? 'up' : 'down' 
          };
        }));
      }

      setTimeout(() => {
        setAsks(prev => prev.map(r => ({ ...r, flash: null })));
        setBids(prev => prev.map(r => ({ ...r, flash: null })));
      }, 300);

    }, 800);

    return () => clearInterval(updateInterval);
  }, [visibleRows]);

  // Simulate live Market Trades
  useEffect(() => {
    const tradeInterval = setInterval(() => {
      const newTrade: MarketTrade = {
        id: Math.random().toString(36).substr(2, 9),
        price: currentPrice + (Math.random() - 0.5) * 5,
        amount: Math.random() * 0.2 + 0.001,
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        side: Math.random() > 0.5 ? 'buy' : 'sell'
      };
      setMarketTrades(prev => [newTrade, ...prev].slice(0, 50));
    }, Math.random() * 2000 + 1000);

    return () => clearInterval(tradeInterval);
  }, [currentPrice]);

  // Helper to check if user has an order at this price
  const hasUserOrder = (price: number, side: 'buy' | 'sell') => {
    return openOrders.some(o => Math.abs(o.price - price) < 0.2 && o.side === side);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-900 h-9 shrink-0 pr-2">
        <div className="flex h-full">
          <button 
            onClick={() => setActiveTab('book')}
            className={`px-4 text-[12px] font-normal transition-all ${activeTab === 'book' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Order book
          </button>
          <button 
            onClick={() => setActiveTab('trades')}
            className={`px-4 text-[12px] font-normal transition-all ${activeTab === 'trades' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Last trades
          </button>
        </div>

        {/* View Toggles */}
        {activeTab === 'book' && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setViewMode('mixed')} title="Mixed View" className={`p-1 rounded transition-colors ${viewMode === 'mixed' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="6" height="7" rx="1" className="text-[#ff4d4f]" />
                <rect x="3" y="13" width="6" height="7" rx="1" className="text-[#00d18e]" />
                <rect x="11" y="5" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="9" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="13" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="17" width="10" height="2" rx="0.5" className="opacity-80" />
              </svg>
            </button>
            <button onClick={() => setViewMode('buy')} title="Buy Only" className={`p-1 rounded transition-colors ${viewMode === 'buy' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="6" height="16" rx="1" className="text-[#00d18e]" />
                <rect x="11" y="5" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="9" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="13" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="17" width="10" height="2" rx="0.5" className="opacity-80" />
              </svg>
            </button>
            <button onClick={() => setViewMode('sell')} title="Sell Only" className={`p-1 rounded transition-colors ${viewMode === 'sell' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="6" height="16" rx="1" className="text-[#ff4d4f]" />
                <rect x="11" y="5" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="9" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="13" width="10" height="2" rx="0.5" className="opacity-80" />
                <rect x="11" y="17" width="10" height="2" rx="0.5" className="opacity-80" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Column Titles */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-zinc-500 font-normal text-[11px] shrink-0 border-b border-zinc-900/30">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden py-1 custom-scrollbar overflow-y-auto">
        {activeTab === 'book' ? (
          <>
            {/* Asks (Sell Orders) - Red */}
            {(viewMode === 'mixed' || viewMode === 'sell') && (
              <div className="flex flex-col-reverse justify-end overflow-hidden">
                {asks.map((ask, i) => {
                  const displayPrice = currentPrice + ask.priceOffset;
                  const depth = Math.min(100, (ask.amount / 0.8) * 100);
                  const isMine = hasUserOrder(displayPrice, 'sell');
                  return (
                    <div 
                      key={i} 
                      onClick={() => onPriceSelect?.(displayPrice)}
                      className={`grid grid-cols-3 px-3 py-[2.5px] relative group cursor-pointer transition-colors duration-300 ${
                        ask.flash === 'up' ? 'bg-[#ff4d4f]/20' : ask.flash === 'down' ? 'bg-white/5' : 'hover:bg-zinc-900/30'
                      }`}
                    >
                      <div 
                        className="absolute right-0 top-0 bottom-0 bg-[#ff4d4f]/10 transition-all duration-500 ease-out"
                        style={{ width: `${depth}%` }}
                      ></div>
                      <div className="flex items-center gap-1.5 z-10">
                        {isMine && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>}
                        <span className="text-[#ff4d4f] font-medium tabular-nums text-[11px]">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                      </div>
                      <span className="text-right z-10 font-medium text-zinc-400 tabular-nums text-[11px] transition-all duration-300">
                        {ask.amount.toFixed(4)}
                      </span>
                      <span className="text-right z-10 font-medium text-zinc-600 tabular-nums text-[11px]">{displayPrice.toFixed(0).slice(-3)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mid Price & Spread Indicator */}
            <div className="py-2 px-3 bg-zinc-900/20 border-y border-zinc-900/30 my-1 flex flex-col shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#00d18e] tabular-nums tracking-tighter animate-pulse">
                  {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                </span>
                <span className="text-[10px] font-normal text-zinc-500">
                  Spread {spread.toFixed(1)} ({spreadPercent}%)
                </span>
              </div>
            </div>

            {/* Bids (Buy Orders) - Green */}
            {(viewMode === 'mixed' || viewMode === 'buy') && (
              <div className="flex flex-col overflow-hidden">
                {bids.map((bid, i) => {
                  const displayPrice = currentPrice - bid.priceOffset;
                  const depth = Math.min(100, (bid.amount / 0.8) * 100);
                  const isMine = hasUserOrder(displayPrice, 'buy');
                  return (
                    <div 
                      key={i} 
                      onClick={() => onPriceSelect?.(displayPrice)}
                      className={`grid grid-cols-3 px-3 py-[2.5px] relative group cursor-pointer transition-colors duration-300 ${
                        bid.flash === 'up' ? 'bg-[#00d18e]/20' : bid.flash === 'down' ? 'bg-white/5' : 'hover:bg-zinc-900/30'
                      }`}
                    >
                      <div 
                        className="absolute right-0 top-0 bottom-0 bg-[#00d18e]/10 transition-all duration-500 ease-out"
                        style={{ width: `${depth}%` }}
                      ></div>
                      <div className="flex items-center gap-1.5 z-10">
                        {isMine && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>}
                        <span className="text-[#00d18e] font-medium tabular-nums text-[11px]">{displayPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                      </div>
                      <span className="text-right z-10 font-medium text-zinc-400 tabular-nums text-[11px] transition-all duration-300">
                        {bid.amount.toFixed(4)}
                      </span>
                      <span className="text-right z-10 font-medium text-zinc-600 tabular-nums text-[11px]">{displayPrice.toFixed(0).slice(-3)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Last Trades Tab Content */
          <div className="flex flex-col overflow-hidden">
            {marketTrades.map((trade) => (
              <div key={trade.id} className="grid grid-cols-3 px-3 py-[3px] hover:bg-zinc-900/30 transition-colors animate-in fade-in slide-in-from-top-1 duration-500">
                <span className={`font-medium tabular-nums text-[11px] ${trade.side === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                  {trade.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <span className="text-right font-medium text-zinc-400 tabular-nums text-[11px]">
                  {trade.amount.toFixed(4)}
                </span>
                <span className="text-right font-medium text-zinc-500 tabular-nums text-[11px]">
                  {trade.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderBook;
