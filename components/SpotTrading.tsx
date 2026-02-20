
import React, { useState, useEffect, useRef, useMemo } from 'react';
import OrderBook from './OrderBook';
import TradingViewWidget from './TradingViewWidget';
import { useExchangeStore } from '../store';
import { Order } from '../types';

const SpotTrading: React.FC = () => {
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'tpsl'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [percent, setPercent] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [isPairSelectorOpen, setIsPairSelectorOpen] = useState(false);
  const [pairSearchQuery, setPairSearchQuery] = useState('');
  const [historyTab, setHistoryTab] = useState<'open' | 'history' | 'assets' | 'bots'>('open');
  const [openOrdersSubTab, setOpenOrdersSubTab] = useState<'limit_market' | 'tpsl'>('limit_market');
  const [historySubTab, setHistorySubTab] = useState<'limit_market' | 'tpsl'>('limit_market');
  const [sidebarTab, setSidebarTab] = useState<'All' | 'Favorites' | 'Meme' | 'L1' | 'AI'>('All');
  
  // Assets Tab States
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  
  // TP/SL States
  const [showTPSL, setShowTPSL] = useState(false);
  const [tpInput, setTpInput] = useState('');
  const [slInput, setSlInput] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [tpslExecutionType, setTpslExecutionType] = useState<'market' | 'limit'>('market');
  const [isTpslTypeDropdownOpen, setIsTpslTypeDropdownOpen] = useState(false);
  
  // Modal State for Viewing TP/SL Details
  const [viewingTPSLOrder, setViewingTPSLOrder] = useState<Order | null>(null);
  
  const pairSelectorRef = useRef<HTMLDivElement>(null);
  const tpslTypeRef = useRef<HTMLDivElement>(null);

  const { balances, placeOrder, tradeHistory, openOrders, filledOrders, cancelOrder, activePair, setActivePair, favorites, toggleFavorite, user, setDepositModalOpen } = useExchangeStore();
  
  const [activeBase, activeQuote] = activePair.split('/');
  
  const baseAsset = balances.find(b => b.symbol === activeBase);
  const quoteAsset = balances.find(b => b.symbol === activeQuote);
  
  const livePrice = baseAsset?.price || 0;
  const priceChange = baseAsset?.change24h || 0;
  const absChange = (livePrice * (priceChange / 100));

  const [priceInput, setPriceInput] = useState(livePrice.toFixed(2));

  const quoteBalance = quoteAsset?.available || 0;
  const baseBalance = baseAsset?.available || 0;

  // Validation: Amount must be provided and greater than 0
  const isAmountValid = useMemo(() => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }, [amount]);

  // INITIALIZATION ONLY: Update price input when the active pair changes or order type changes to a fixed-price mode.
  useEffect(() => {
    if (orderType === 'limit' || (orderType === 'tpsl' && tpslExecutionType === 'limit')) {
      setPriceInput(livePrice.toFixed(2));
    }
  }, [activePair, orderType, tpslExecutionType]); 

  useEffect(() => {
    setAmount('');
    setTotal('');
    setPercent(0);
    setTpInput('');
    setSlInput('');
    setTriggerPrice('');
    if (orderType !== 'limit') {
      setShowTPSL(false);
    }
  }, [side, orderType, activePair]);

  const handlePriceChange = (val: string) => {
    setPriceInput(val);
    const p = parseFloat(val);
    const a = parseFloat(amount);
    if (!isNaN(p) && !isNaN(a)) {
      setTotal((p * a).toFixed(2));
    }
  };

  const handlePriceSelect = (price: number) => {
    const formattedPrice = price.toFixed(2);
    setPriceInput(formattedPrice);
    
    // Switch to limit if we are in market mode to make it intuitive
    if (orderType === 'market') {
      setOrderType('limit');
    }

    // Recalculate total if amount exists
    const a = parseFloat(amount);
    if (!isNaN(a)) {
      setTotal((price * a).toFixed(2));
    }
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const effectivePrice = (orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? livePrice : parseFloat(priceInput);
    const a = parseFloat(val);
    if (!isNaN(effectivePrice) && !isNaN(a)) {
      setTotal((effectivePrice * a).toFixed(2));
      const max = side === 'buy' ? (effectivePrice > 0 ? quoteBalance / effectivePrice : 0) : baseBalance;
      if (max > 0) {
        setPercent(Math.min(100, (a / max) * 100));
      } else {
        setPercent(0);
      }
    } else if (val === '') {
      setTotal('');
      setPercent(0);
    }
  };

  const handleTotalChange = (val: string) => {
    setTotal(val);
    const effectivePrice = (orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? livePrice : parseFloat(priceInput);
    const t = parseFloat(val);
    if (!isNaN(effectivePrice) && !isNaN(t) && effectivePrice > 0) {
      const calculatedAmount = (t / effectivePrice).toFixed(6);
      setAmount(calculatedAmount);
      const maxTotal = side === 'buy' ? quoteBalance : (baseBalance * effectivePrice);
      if (maxTotal > 0) {
        setPercent(Math.min(100, (t / maxTotal) * 100));
      } else {
        setPercent(0);
      }
    } else if (val === '') {
      setAmount('');
      setPercent(0);
    }
  };

  const handlePercentChange = (p: number) => {
    setPercent(p);
    const price = (orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? livePrice : parseFloat(priceInput);
    if (side === 'buy') {
      const buyableTotal = quoteBalance * (p / 100);
      setTotal(buyableTotal.toFixed(2));
      setAmount(price > 0 ? (buyableTotal / price).toFixed(6) : '0');
    } else {
      const sellableAmount = baseBalance * (p / 100);
      setAmount(sellableAmount.toFixed(6));
      setTotal((sellableAmount * price).toFixed(2));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pairSelectorRef.current && !pairSelectorRef.current.contains(event.target as Node)) {
        setIsPairSelectorOpen(false);
      }
      if (tpslTypeRef.current && !tpslTypeRef.current.contains(event.target as Node)) {
        setIsTpslTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrade = async () => {
    if (!isAmountValid) return; 

    const isMarketExecution = orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market');
    const numPrice = isMarketExecution ? livePrice : parseFloat(priceInput);
    const numAmount = parseFloat(amount);
    
    if (isNaN(numPrice)) return;

    const tpValue = (orderType === 'limit' && showTPSL && tpInput) ? parseFloat(tpInput) : undefined;
    const slValue = (orderType === 'tpsl' && triggerPrice) ? parseFloat(triggerPrice) : (orderType === 'limit' && showTPSL && slInput ? parseFloat(slInput) : undefined);

    const success = await placeOrder({
      symbol: activePair,
      side,
      price: numPrice,
      amount: numAmount,
      type: orderType,
      tpPrice: tpValue,
      slPrice: slValue
    });

    if (success) {
      setAmount('');
      setTotal('');
      setPercent(0);
      setTpInput('');
      setSlInput('');
      setTriggerPrice('');
      setShowTPSL(false);
    }
  };

  const availablePairs = useMemo(() => {
    let list = balances
      .filter(b => b.symbol !== 'USDT')
      .filter(b => 
        b.symbol.toLowerCase().includes(pairSearchQuery.toLowerCase()) || 
        b.name.toLowerCase().includes(pairSearchQuery.toLowerCase())
      );
    
    if (sidebarTab === 'Favorites') {
      list = list.filter(b => favorites.includes(b.symbol));
    } else if (sidebarTab === 'Meme') {
      list = list.filter(b => ['DOGE', 'SHIB', 'PEPE'].includes(b.symbol));
    } else if (sidebarTab === 'L1') {
      list = list.filter(b => ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'AVAX', 'DOT'].includes(b.symbol));
    } else if (sidebarTab === 'AI') {
      list = list.filter(b => ['NEAR', 'ICP', 'RNDR'].includes(b.symbol));
    }

    return list;
  }, [balances, pairSearchQuery, sidebarTab, favorites]);

  const filteredTerminalAssets = useMemo(() => {
    let list = balances.filter(b => b.balance > 0 && 
      (b.symbol.toLowerCase().includes(assetSearchQuery.toLowerCase()) || 
       b.name.toLowerCase().includes(assetSearchQuery.toLowerCase()))
    );
    return list.sort((a, b) => (b.balance * b.price) - (a.balance * a.price));
  }, [balances, assetSearchQuery]);

  const selectPair = (symbol: string) => {
    setActivePair(`${symbol}/USDT`);
    setIsPairSelectorOpen(false);
  };

  // Subtab Counts for Open Orders
  const openLimitMarketCount = useMemo(() => 
    openOrders.filter(o => o.symbol === activePair && (o.type === 'limit' || o.type === 'market')).length,
    [openOrders, activePair]
  );
  const openTPSLCount = useMemo(() => 
    openOrders.filter(o => o.symbol === activePair && o.type === 'tpsl').length,
    [openOrders, activePair]
  );

  // Subtab Counts for History - MUST ONLY COUNT FILLED OR CANCELED
  const historyLimitMarketCount = useMemo(() => 
    filledOrders.filter(o => o.status !== 'open' && o.symbol === activePair && (o.type === 'limit' || o.type === 'market')).length,
    [filledOrders, activePair]
  );
  const historyTPSLCount = useMemo(() => 
    filledOrders.filter(o => o.status !== 'open' && o.symbol === activePair && o.type === 'tpsl').length,
    [filledOrders, activePair]
  );

  const filteredOpenOrders = useMemo(() => {
    if (openOrdersSubTab === 'limit_market') {
      return openOrders.filter(o => o.symbol === activePair && (o.type === 'limit' || o.type === 'market'));
    }
    return openOrders.filter(o => o.symbol === activePair && o.type === 'tpsl');
  }, [openOrders, openOrdersSubTab, activePair]);

  const filteredHistoryOrders = useMemo(() => {
    const terminalOrders = filledOrders.filter(o => o.status !== 'open');
    if (historySubTab === 'limit_market') {
      return terminalOrders.filter(o => o.symbol === activePair && (o.type === 'limit' || o.type === 'market'));
    }
    return terminalOrders.filter(o => o.symbol === activePair && o.type === 'tpsl');
  }, [filledOrders, historySubTab, activePair]);

  const StarIcon = ({ filled, className }: { filled: boolean, className?: string }) => (
    <svg 
      width="15" 
      height="15" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`transition-all duration-300 ${className || ''} ${filled ? 'text-[#F1F22D]' : 'text-zinc-600 group-hover:text-zinc-400'}`}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  const AuthCTA = ({ feature }: { feature: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <h4 className="text-sm font-bold text-white mb-2 tracking-tight">Log in or sign up to view your {feature}</h4>
      <div className="flex gap-3 mt-4">
        <button className="px-6 py-2 bg-white text-black font-black rounded-full text-[11px] transition-all hover:bg-zinc-200">Log In</button>
        <button className="px-6 py-2 bg-zinc-800 text-white font-black rounded-full text-[11px] transition-all hover:bg-zinc-700">Sign Up</button>
      </div>
    </div>
  );

  const EmptyState = ({ icon, title, description, action }: { icon: React.ReactNode, title: string, description: string, action?: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-zinc-500 mb-6 shadow-inner">
        {icon}
      </div>
      <h4 className="text-base font-bold text-white mb-2 tracking-tight">{title}</h4>
      <p className="text-xs text-zinc-500 font-medium max-w-[280px] leading-relaxed mb-6">{description}</p>
      {action && action}
    </div>
  );

  // TP/SL Details Modal Component
  const TPSLModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
    const [isExiting, setIsExiting] = useState(false);
    const symbol = order.symbol.split('/')[1] || 'USDT';

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(onClose, 200); 
    };

    return (
      <div 
        className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isExiting ? 'animate-overlay-out' : 'animate-overlay-in'}`}
        onClick={handleClose}
      >
        <div 
          className={`bg-[#1a1c22] border border-zinc-800 rounded-xl w-full max-w-[440px] shadow-2xl overflow-hidden ${isExiting ? 'animate-modal-out' : 'animate-modal-in'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50">
            <h3 className="text-lg font-bold text-white tracking-tight uppercase">TP/SL</h3>
            <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">TP trigger price</span>
                <span className="text-white font-black tabular-nums">{order.tpPrice?.toLocaleString() || '--'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">SL trigger price</span>
                <span className="text-white font-black tabular-nums">{order.slPrice?.toLocaleString() || '--'}</span>
              </div>
            </div>

            <div className="space-y-3">
              {order.tpPrice && (
                <div className="bg-[#1e222a] p-4 rounded-xl text-[12px] leading-relaxed text-zinc-400">
                  When the last price reaches <span className="text-white font-bold">{order.tpPrice} {symbol}</span>, take-profit will be filled at <span className="text-white font-bold">{order.tpPrice} {symbol}</span>, the estimated PNL amount is <span className="text-white font-bold">0 {symbol}</span>, and the PNL rate is <span className="text-white font-bold">0.00%</span>.
                </div>
              )}
              {order.slPrice && (
                <div className="bg-[#1e222a] p-4 rounded-xl text-[12px] leading-relaxed text-zinc-400">
                  When the last price reaches <span className="text-white font-bold">{order.slPrice} {symbol}</span>, stop-loss will be filled at <span className="text-white font-bold">{order.slPrice} {symbol}</span>, the estimated PNL amount is <span className="text-white font-bold">0 {symbol}</span>, and the PNL rate is <span className="text-white font-bold">0.00%</span>.
                </div>
              )}
            </div>

            <button 
              onClick={handleClose}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-black rounded-full text-sm uppercase tracking-tight shadow-xl transition-all active:scale-[0.98]"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SubTabCounter = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
      <span className="w-4 h-4 bg-white text-black rounded-full flex items-center justify-center text-[9px] font-black leading-none pt-[0.5px]">
        {count}
      </span>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px-32px)] bg-black overflow-hidden border-t border-zinc-900">
      
      {/* Left Sidebar */}
      <div className="hidden xl:flex w-[260px] flex-col border-r border-zinc-900 bg-[#0a0a0a] shrink-0 h-full overflow-hidden">
        <div className="p-3 border-b border-zinc-900 bg-black/40">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search pairs" 
              value={pairSearchQuery}
              onChange={(e) => setPairSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-normal focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600 text-white" 
            />
          </div>
        </div>
        
        <div className="flex px-2 pt-1 gap-0.5 border-b border-zinc-900 bg-black/20 overflow-x-auto no-scrollbar">
          {['All', 'Favorites', 'Meme', 'L1', 'AI'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSidebarTab(cat as any)}
              className={`px-3 py-1.5 text-[11px] font-normal rounded-t-lg transition-all whitespace-nowrap ${sidebarTab === cat ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {cat === 'Favorites' ? (
                <div className="flex items-center gap-1">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-[#F1F22D]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   Favorites
                </div>
              ) : cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
          <div className="grid grid-cols-12 px-3 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-tight border-b border-zinc-900/30 sticky top-0 bg-[#0a0a0a] z-10">
            <div className="col-span-6">Pair / Name</div>
            <div className="col-span-4 text-right Price / 24h">Price / 24h</div>
            <div className="col-span-2 text-right"></div>
          </div>
          {availablePairs.map((asset) => (
            <div 
              key={asset.symbol} 
              onClick={() => selectPair(asset.symbol)}
              className={`grid grid-cols-12 items-center px-3 py-2.5 hover:bg-zinc-900/50 transition-all cursor-pointer group ${asset.symbol === activeBase ? 'bg-zinc-900/60 border-l-2 border-white' : ''}`}
            >
              <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-4 h-4 rounded-full object-cover shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-bold text-zinc-200 group-hover:text-white truncate">
                    {asset.symbol}<span className="text-zinc-500 font-medium">/USDT</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate font-medium">
                    {asset.name}
                  </span>
                </div>
              </div>
              <div className="col-span-4 text-right overflow-hidden flex flex-col">
                <span className="text-[12px] font-bold text-zinc-200 tabular-nums truncate">
                  {asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2 })}
                </span>
                <span className={`text-[10px] font-bold tabular-nums ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="col-span-2 text-right">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.symbol); }}
                  className="group/fav p-1 rounded-md hover:bg-zinc-800 transition-all active:scale-125"
                >
                  <StarIcon filled={favorites.includes(asset.symbol)} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-0 h-full overflow-hidden border-r border-zinc-900">
        
        {/* Ticker Header */}
        <div className="h-[60px] border-b border-zinc-900 flex items-center px-4 gap-7 bg-black shrink-0 relative z-50">
          <div className="flex items-center gap-3 shrink-0 relative" ref={pairSelectorRef}>
            <div 
              className="flex items-center gap-2 cursor-pointer group select-none" 
              onClick={() => setIsPairSelectorOpen(!isPairSelectorOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                <img src={`https://assets.coincap.io/assets/icons/${activeBase.toLowerCase()}@2x.png`} alt={activeBase} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight uppercase">{activePair}</span>
                <svg 
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${isPairSelectorOpen ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"
                >
                  <path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            {/* Star Icon in Circular Container */}
            <button 
              onClick={() => toggleFavorite(activeBase)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-all active:scale-95 group/fav"
            >
              <StarIcon filled={favorites.includes(activeBase)} className="transform active:scale-125" />
            </button>

            {/* Pair Selector Dropdown - Redesigned to match sidebar */}
            <div className={`absolute top-full left-0 mt-2 dropdown-container ${isPairSelectorOpen ? 'is-visible' : ''}`}>
              <div className="bg-[#111] border border-zinc-800 rounded-2xl w-[360px] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[500px]">
                <div className="p-4">
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search pairs" 
                      value={pairSearchQuery}
                      onChange={(e) => setPairSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 px-5 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tight border-b border-zinc-800/30 sticky top-0 bg-[#111] z-10">
                  <div className="col-span-6">Pair / Name</div>
                  <div className="col-span-4 text-right">Price / 24h</div>
                  <div className="col-span-2 text-right"></div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                  {availablePairs.map((asset) => {
                    const isSelected = asset.symbol === activeBase;
                    return (
                      <div 
                        key={asset.symbol} 
                        onClick={() => selectPair(asset.symbol)}
                        className={`grid grid-cols-12 items-center px-5 py-3.5 hover:bg-zinc-800 transition-all cursor-pointer group relative ${isSelected ? 'bg-zinc-800/80' : ''}`}
                      >
                        {/* Active Indicator Bar */}
                        {isSelected && <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r"></div>}
                        
                        <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                          <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                              {asset.symbol}<span className="text-zinc-500 font-medium">/USDT</span>
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium truncate uppercase">
                              {asset.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="col-span-4 text-right overflow-hidden flex flex-col items-end">
                          <span className="text-[13px] font-bold text-zinc-100 tabular-nums">
                            {asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 1 ? 4 : 2 })}
                          </span>
                          <span className={`text-[11px] font-bold tabular-nums ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                          </span>
                        </div>
                        
                        <div className="col-span-2 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.symbol); }}
                            className="p-1.5 rounded-md hover:bg-zinc-700 transition-all group/fav active:scale-125"
                          >
                            <StarIcon filled={favorites.includes(asset.symbol)} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {availablePairs.length === 0 && (
                    <div className="px-5 py-10 text-center text-zinc-600 text-[11px] font-bold uppercase tracking-widest opacity-40">
                      No pairs found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center shrink-0">
            <span className={`text-[16px] font-black tabular-nums leading-none ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
              {livePrice.toLocaleString(undefined, { minimumFractionDigits: livePrice < 1 ? 4 : 2 })}
            </span>
            <span className={`text-[10px] font-bold tabular-nums leading-none mt-1 ${priceChange >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
              {priceChange >= 0 ? '+' : ''}{absChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} ({priceChange.toFixed(2)}%)
            </span>
          </div>

          <div className="hidden min-[960px]:flex items-center gap-7 shrink-0">
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight mb-0.5">24h low</span>
              <span className="text-[12px] text-zinc-200 font-bold tabular-nums">{(livePrice * 0.95).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight mb-0.5">24h high</span>
              <span className="text-[12px] text-zinc-200 font-bold tabular-nums">{(livePrice * 1.05).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-tight mb-0.5">24h volume</span>
              <span className="text-[12px] text-zinc-200 font-bold tabular-nums">1.94K</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[52%] bg-black overflow-hidden relative border-b border-zinc-900 shrink-0">
          <TradingViewWidget />
        </div>
        
        {/* History Panel */}
        <div className="flex-1 bg-black flex flex-col min-h-0">
          <div className="flex border-b border-zinc-900 shrink-0 items-center justify-between pr-4">
            <div className="flex h-full">
              {[
                { id: 'open', label: `Open orders (${openOrders.filter(o => o.symbol === activePair).length})` },
                { id: 'history', label: 'Order history' },
                { id: 'assets', label: 'Assets' },
                { id: 'bots', label: 'Bots' }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setHistoryTab(tab.id as any)}
                  className={`px-4 py-2.5 text-[12px] font-normal transition-all relative h-full flex items-center gap-1 ${historyTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab.label}
                  {tab.id === 'assets' && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-40"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                  )}
                  {historyTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
                </button>
              ))}
            </div>
            
            {historyTab === 'assets' && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                <button onClick={() => setDepositModalOpen(true)} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-bold text-white hover:bg-zinc-800 transition-all uppercase tracking-tight">Deposit</button>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-md py-1 pl-7 pr-3 text-[10px] font-normal focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-600 text-white w-32" 
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {historyTab === 'open' ? (
              <div className="flex flex-col h-full">
                {!user ? (
                  <AuthCTA feature="orders" />
                ) : (
                  <>
                    <div className="flex gap-1 p-2 border-b border-zinc-900/50 bg-zinc-950/20 shrink-0">
                      <button onClick={() => setOpenOrdersSubTab('limit_market')} className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-2 ${openOrdersSubTab === 'limit_market' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-custom-400'}`}>
                        Limit | Market
                        <SubTabCounter count={openLimitMarketCount} />
                      </button>
                      <button onClick={() => setOpenOrdersSubTab('tpsl')} className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-2 ${openOrdersSubTab === 'tpsl' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}>
                        TP/SL
                        <SubTabCounter count={openTPSLCount} />
                      </button>
                    </div>
                    {filteredOpenOrders.length === 0 ? (
                      <EmptyState 
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
                        title="No active orders"
                        description="Start trading to see your orders here. You can place limit or market orders to build your portfolio."
                      />
                    ) : (
                      <table className="w-full text-[11px] text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                          <tr>
                            <th className="px-4 py-2 font-normal">Time</th>
                            <th className="px-4 py-2 font-normal">Pair / Type</th>
                            <th className="px-4 py-2 font-normal">Side</th>
                            {openOrdersSubTab === 'tpsl' && <th className="px-4 py-2 font-normal">Trigger condition</th>}
                            <th className="px-4 py-2 font-normal">Price</th>
                            <th className="px-4 py-2 font-normal">Amount</th>
                            <th className="px-4 py-2 font-normal">Filled</th>
                            {openOrdersSubTab !== 'tpsl' && <th className="px-4 py-3 font-normal">TP/SL</th>}
                            <th className="px-4 py-2 text-right font-normal">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOpenOrders.map((o) => {
                            const isBracket = o.type === 'tpsl' && o.tpPrice && o.slPrice;
                            const assetName = balances.find(b => b.symbol === o.symbol.split('/')[0])?.name || 'Asset';
                            
                            if (isBracket && openOrdersSubTab === 'tpsl') {
                              return (
                                <React.Fragment key={o.id}>
                                  <tr className="border-b border-zinc-900/10 hover:bg-zinc-900/20 transition-all">
                                    <td rowSpan={2} className="px-4 py-3 text-zinc-500 tabular-nums border-r border-zinc-900/10">{o.time}</td>
                                    <td rowSpan={2} className="px-4 py-3 font-medium border-r border-zinc-900/20">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-white uppercase">{o.symbol}</span>
                                        <span className="text-zinc-600 text-[9px] uppercase font-black">{assetName}</span>
                                      </div>
                                    </td>
                                    <td rowSpan={2} className={`px-4 py-3 font-black border-r border-zinc-900/20 ${o.side === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                                      {o.side.toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300 font-medium flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-[#00d18e]"></span>
                                      TP: {o.side === 'sell' ? '>=' : '<='} {o.tpPrice?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300 font-medium tabular-nums">{o.tpPrice?.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-zinc-300 font-medium tabular-nums">{o.amount}</td>
                                    <td rowSpan={2} className="px-4 py-3 border-l border-r border-zinc-900/20">
                                      <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#00d18e]" style={{ width: `${(o.filled / o.amount) * 100}%` }}></div>
                                      </div>
                                    </td>
                                    <td rowSpan={2} className="px-4 py-3 text-right">
                                      <button onClick={() => cancelOrder(o.id)} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest bg-red-500/5 px-3 py-1 rounded border border-red-500/20 hover:border-red-500/50 transition-all">Cancel</button>
                                    </td>
                                  </tr>
                                  <tr className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all">
                                    <td className="px-4 py-3 text-zinc-300 font-medium flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-[#ff4d4f]"></span>
                                      SL: {o.side === 'sell' ? '<=' : '>='} {o.slPrice?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300 font-medium tabular-nums">{o.slPrice?.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-zinc-300 font-medium tabular-nums">{o.amount}</td>
                                  </tr>
                                </React.Fragment>
                              );
                            }

                            return (
                              <tr key={o.id} className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all">
                                <td className="px-4 py-3 text-zinc-500 tabular-nums border-r border-zinc-900/10">{o.time}</td>
                                <td className="px-4 py-3 font-medium"><span className="font-bold text-white">{o.symbol}</span> <span className="text-zinc-600 text-[9px] uppercase">{o.type}</span></td>
                                <td className={`px-4 py-3 font-bold ${o.side === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{o.side.toUpperCase()}</td>
                                {openOrdersSubTab === 'tpsl' && (
                                  <td className="px-4 py-3 text-zinc-400 font-medium whitespace-nowrap">
                                    SL: {o.side === 'buy' ? '>=' : '<='} {o.slPrice?.toLocaleString()}
                                  </td>
                                )}
                                <td className="px-4 py-3 text-zinc-300 font-medium tabular-nums">{o.price.toLocaleString()}</td>
                                <td className="px-4 py-3 text-zinc-300 font-medium tabular-nums">{o.amount}</td>
                                <td className="px-4 py-3">
                                  <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00d18e]" style={{ width: `${(o.filled / o.amount) * 100}%` }}></div>
                                  </div>
                                </td>
                                {openOrdersSubTab !== 'tpsl' && (
                                  <td className="px-4 py-3">
                                    {(o.tpPrice || o.slPrice) ? (
                                      <button 
                                        onClick={() => setViewingTPSLOrder(o)}
                                        className="text-blue-400 hover:text-blue-300 font-black uppercase text-[10px] tracking-tight"
                                      >
                                        View
                                      </button>
                                    ) : (
                                      <span className="text-zinc-700 font-black">--</span>
                                    )}
                                  </td>
                                )}
                                <td className="px-4 py-3 text-right"><button onClick={() => cancelOrder(o.id)} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase">Cancel</button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            ) : historyTab === 'history' ? (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                {!user ? (
                   <AuthCTA feature="order history" />
                ) : (
                  <>
                    <div className="flex gap-1 p-2 border-b border-zinc-900/50 bg-zinc-950/20 shrink-0">
                      <button onClick={() => setHistorySubTab('limit_market')} className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-2 ${historySubTab === 'limit_market' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-custom-400'}`}>
                        Limit | Market
                        <SubTabCounter count={historyLimitMarketCount} />
                      </button>
                      <button onClick={() => setHistorySubTab('tpsl')} className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-2 ${historySubTab === 'tpsl' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-400'}`}>
                        TP/SL
                        <SubTabCounter count={historyTPSLCount} />
                      </button>
                    </div>
                    {filteredHistoryOrders.length === 0 ? (
                      <EmptyState 
                        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                        title="Order history is empty"
                        description="Your filled or canceled orders will appear here. No trade records were found for the current pair."
                      />
                    ) : (
                      <table className="w-full text-[11px] text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                          <tr>
                            <th className="px-4 py-3 font-normal">Time</th>
                            <th className="px-4 py-3 font-normal">Pair / Type</th>
                            <th className="px-4 py-3 font-normal">Side</th>
                            <th className="px-4 py-3 font-normal">Price</th>
                            <th className="px-4 py-3 font-normal">Amount</th>
                            {historySubTab !== 'tpsl' && <th className="px-4 py-3 font-normal">TP/SL</th>}
                            <th className="px-4 py-3 text-right font-normal pr-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredHistoryOrders.map((o) => {
                            const assetName = balances.find(b => b.symbol === o.symbol.split('/')[0])?.name || 'Asset';
                            const isPendingBracket = o.status === 'open' && o.type === 'tpsl' && o.tpPrice && o.slPrice;

                            if (isPendingBracket && historySubTab === 'tpsl') {
                              const opTp = o.side === 'sell' ? '>=' : '<=';
                              const opSl = o.side === 'sell' ? '<=' : '>=';
                              return (
                                <React.Fragment key={o.id}>
                                  <tr className="border-b border-zinc-900/10 hover:bg-zinc-900/20 transition-all">
                                    <td rowSpan={2} className="px-4 py-4 text-zinc-500 font-medium tabular-nums border-r border-zinc-900/10">{o.time}</td>
                                    <td rowSpan={2} className="px-4 py-4 border-r border-zinc-900/10">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-white uppercase">{o.symbol}</span>
                                        <span className="text-[9px] text-zinc-600 font-black uppercase">{assetName}</span>
                                      </div>
                                    </td>
                                    <td rowSpan={2} className={`px-4 py-4 font-black border-r border-zinc-900/10 ${o.side === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                                      {o.side.toUpperCase()}
                                    </td>
                                    <td className="px-4 py-4 text-zinc-300 font-medium tabular-nums">
                                      <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00d18e]"></span>
                                        {opTp} {o.tpPrice?.toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-zinc-400 font-medium tabular-nums">{o.amount}</td>
                                    <td rowSpan={2} className="px-4 py-4 text-right pr-4">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse">Pending</span>
                                    </td>
                                  </tr>
                                  <tr className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all">
                                    <td className="px-4 py-4 text-zinc-300 font-medium tabular-nums">
                                      <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]"></span>
                                        {opSl} {o.slPrice?.toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-zinc-400 font-medium tabular-nums">{o.amount}</td>
                                  </tr>
                                </React.Fragment>
                              );
                            }

                            // Operator logic for terminal TPSL orders in history
                            const priceDisplay = (o.type === 'tpsl') ? (
                              <span className="tabular-nums">
                                {o.tpPrice ? (o.side === 'sell' ? '≥ ' : '≤ ') : (o.side === 'sell' ? '≤ ' : '≥ ')}
                                {o.price.toLocaleString()}
                              </span>
                            ) : o.price.toLocaleString();

                            return (
                              <tr key={o.id} className={`border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all group ${o.status === 'canceled' ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                                <td className="px-4 py-4 text-zinc-500 font-medium tabular-nums border-r border-zinc-900/10">{o.time}</td>
                                <td className="px-4 py-4"><span className="font-bold text-white uppercase">{o.symbol}</span> <span className="text-[9px] text-zinc-600 uppercase ml-1">{o.type === 'tpsl' ? assetName : o.type}</span></td>
                                <td className={`px-4 py-4 font-bold border-r border-zinc-900/10 ${o.side === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{o.side.toUpperCase()}</td>
                                <td className="px-4 py-4 tabular-nums text-zinc-200 font-bold">{priceDisplay}</td>
                                <td className="px-4 py-4 tabular-nums text-zinc-400 font-medium">{o.amount}</td>
                                {historySubTab !== 'tpsl' && (
                                  <td className="px-4 py-4">
                                    {o.type === 'tpsl' || o.tpPrice || o.slPrice ? (
                                      <button 
                                        onClick={() => setViewingTPSLOrder(o)}
                                        className="text-blue-400 hover:text-blue-300 font-black uppercase text-[10px] tracking-tight"
                                      >
                                        View
                                      </button>
                                    ) : (
                                      <span className="text-zinc-700 font-black">--</span>
                                    )}
                                  </td>
                                )}
                                <td className="px-4 py-4 text-right pr-4">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${o.status === 'filled' ? 'text-[#00d18e]' : 'text-zinc-500'}`}>
                                    {o.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            ) : historyTab === 'assets' ? (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                {!user ? (
                   <AuthCTA feature="assets" />
                ) : filteredTerminalAssets.length === 0 ? (
                   <EmptyState 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M12 7v5"/><path d="M12 15v.01"/></svg>}
                    title="No assets found"
                    description="You don't have any holdings in your spot account. Deposit funds to start trading and build your crypto portfolio."
                    action={<button onClick={() => setDepositModalOpen(true)} className="px-8 py-2.5 bg-white text-black font-black rounded-full text-[12px] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all">Deposit Crypto</button>}
                   />
                ) : (
                  <table className="w-full text-[11px] text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                      <tr>
                        <th className="px-4 py-3 font-normal">Assets</th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">Equity <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 11l5 5 5-5M7 13l5 5 5-5"/></svg></span>
                        </th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">Balance <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 11l5 5 5-5M7 13l5 5 5-5"/></svg></span>
                        </th>
                        <th className="px-4 py-3 font-normal">Frozen</th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">Cost price</span>
                        </th>
                        <th className="px-4 py-3 font-normal">
                          <span className="border-b border-dotted border-zinc-800 inline-flex items-center gap-1 cursor-help">PnL <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 11l5 5 5-5M7 13l5 5 5-5"/></svg></span>
                        </th>
                        <th className="px-4 py-3 text-right font-normal pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTerminalAssets.map((asset) => {
                        const equity = asset.balance * asset.price;
                        const mockCostPrice = asset.price * (1 - (0.05 * (asset.symbol.charCodeAt(0) % 5) / 5)); 
                        const mockPnl = equity - (asset.balance * mockCostPrice);
                        const mockPnlPercent = ((asset.price - mockCostPrice) / mockCostPrice) * 100;
                        
                        return (
                          <tr key={asset.symbol} className="border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all group">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                                   <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="font-black text-white uppercase">{asset.symbol}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-100 font-bold">
                              ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-400 font-medium">
                              {asset.balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-500 font-medium">
                              {(asset.balance - asset.available).toLocaleString(undefined, { minimumFractionDigits: 4 })}
                            </td>
                            <td className="px-4 py-4 tabular-nums text-zinc-500">
                              {mockCostPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-4">
                              <div className={`flex flex-col tabular-nums font-black ${mockPnl >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                                <span className="text-[12px]">{mockPnl >= 0 ? '+' : ''}{mockPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className="text-[10px] opacity-70">{mockPnl >= 0 ? '+' : ''}{mockPnlPercent.toFixed(2)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right pr-4">
                               <div className="flex items-center justify-end gap-4">
                                 <button className="text-blue-400 hover:text-blue-300 font-black uppercase text-[10px] tracking-tight" onClick={() => setActivePair(`${asset.symbol}/USDT`)}>Trade</button>
                                 <button className="text-zinc-600 hover:text-zinc-300 font-black uppercase text-[10px] tracking-tight">TP/SL</button>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : historyTab === 'bots' ? (
              <div className="flex flex-col h-full">
                {!user ? (
                  <AuthCTA feature="bots" />
                ) : (
                  <EmptyState 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2" /><path d="M15 13v2M9 13v2"/></svg>}
                    title="No active bots"
                    description="Automate your trading strategy with our powerful DCA and Grid bots. You have no bots running at the moment."
                    action={<button className="px-8 py-2.5 bg-zinc-900 text-white font-black rounded-full text-[12px] hover:bg-zinc-800 transition-all border border-white/5">Create Trading Bot</button>}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {!user ? (
                  <AuthCTA feature="trade history" />
                ) : (
                  <table className="w-full text-[11px] text-left border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-zinc-950 text-zinc-500 font-normal border-b border-zinc-900 z-10">
                      <tr>
                        <th className="px-4 py-2 font-normal">Time</th>
                        <th className="px-4 py-2 font-normal">Pair / Type</th>
                        <th className="px-4 py-2 font-normal">Side</th>
                        <th className="px-4 py-2 font-normal">Price</th>
                        <th className="px-4 py-2 text-right font-normal">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeHistory.filter(t => t.pair === activePair).map((t) => (
                        <tr key={t.id} className="border-b border-zinc-900/30">
                          <td className="px-4 py-1.5 text-zinc-500 font-medium tabular-nums">{t.time}</td>
                          <td className="px-4 py-1.5 font-medium"><span className="font-bold text-white uppercase">{t.pair}</span></td>
                          <td className={`px-4 py-1.5 font-normal ${t.type === 'buy' ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{t.type === 'buy' ? 'Buy' : 'Sell'}</td>
                          <td className="px-4 py-1.5 text-zinc-300 font-medium tabular-nums">{t.price.toLocaleString()}</td>
                          <td className="px-4 py-1.5 text-right text-zinc-500 font-medium tabular-nums">{t.amount}</td>
                        </tr>
                      ))}
                      {tradeHistory.filter(t => t.pair === activePair).length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-zinc-600 uppercase font-black text-[10px] tracking-widest opacity-20">No trade history</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column Group (Orderbook & Trade) */}
      <div className="flex shrink-0 h-full overflow-y-auto min-[1500px]:overflow-hidden bg-[#0a0a0a] border-l border-zinc-900 w-[300px] min-[1500px]:w-[640px] flex-col min-[1500px]:flex-row transition-all duration-300">
        
        <div className="w-full min-[1500px]:w-1/2 flex flex-col h-auto min-[1500px]:h-full border-r border-zinc-900/50 shrink-0">
          <div className="flex-1 min-[1500px]:h-full h-[480px] overflow-hidden">
             <OrderBook currentPrice={livePrice} onPriceSelect={handlePriceSelect} />
          </div>
        </div>

        <div className="w-full min-[1500px]:w-1/2 flex flex-col h-fit min-[1500px]:h-full bg-black min-w-0">
          <div className="p-4 pb-0 shrink-0">
            <div className="flex gap-1 p-0.5 bg-zinc-900/50 rounded-lg mb-4">
              <button onClick={() => setSide('buy')} className={`flex-1 py-1.5 rounded-md text-[13px] font-bold transition-all ${side === 'buy' ? 'bg-[#00d18e] text-black shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Buy</button>
              <button onClick={() => setSide('sell')} className={`flex-1 py-1.5 rounded-md text-[13px] font-bold transition-all ${side === 'sell' ? 'bg-[#ff4d4f] text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>Sell</button>
            </div>

            <div className="flex gap-5 mb-2 border-b border-zinc-900">
              {['Limit', 'Market', 'TP/SL'].map(t => (
                <button key={t} onClick={() => setOrderType(t.toLowerCase() === 'tp/sl' ? 'tpsl' : t.toLowerCase() as any)} className={`text-[13px] font-medium pb-2 transition-all ${orderType === (t.toLowerCase() === 'tp/sl' ? 'tpsl' : t.toLowerCase()) ? 'text-white border-b-2 border-white' : 'text-zinc-500'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="h-auto min-[1500px]:flex-1 min-[1500px]:overflow-y-auto custom-scrollbar px-4 space-y-4 pt-4 pb-4">
            {orderType === 'tpsl' && (
              <div className="flex items-center border border-zinc-800 bg-[#111] rounded-xl px-3 h-12 focus-within:border-zinc-500 transition-all min-w-0">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Trigger</span>
                <input 
                  type="number" 
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  placeholder="Price"
                  className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
                />
                <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
              </div>
            )}

            <div className="flex items-center border rounded-xl px-3 h-12 group transition-all relative bg-[#111] border-zinc-800 focus-within:border-zinc-400 min-w-0">
              {orderType === 'tpsl' ? (
                /* DROPDOWN SELECTOR IN TP/SL MODE */
                <div className="relative h-full flex items-center" ref={tpslTypeRef}>
                  <div 
                    onClick={() => setIsTpslTypeDropdownOpen(!isTpslTypeDropdownOpen)}
                    className="flex items-center gap-1 cursor-pointer min-[1500px]:min-w-[70px] min-w-[60px] text-zinc-500 group-hover:text-zinc-300 transition-colors"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{tpslExecutionType}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${isTpslTypeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  
                  {isTpslTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-zinc-200 text-black rounded-lg shadow-2xl py-1 z-50 w-24 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {['market', 'limit'].map((type) => (
                        <button 
                          key={type}
                          onClick={() => { setTpslExecutionType(type as any); setIsTpslTypeDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-300 transition-colors ${tpslExecutionType === type ? 'bg-zinc-400/30' : ''}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Price</span>
              )}
              
              <input 
                type="text" 
                value={(orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')) ? 'Market' : priceInput} 
                onChange={(e) => handlePriceChange(e.target.value)} 
                disabled={orderType === 'market' || (orderType === 'tpsl' && tpslExecutionType === 'market')} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 disabled:text-zinc-500 min-w-0" 
              />
              <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
            </div>

            <div className="flex items-center border rounded-xl px-3 h-12 group transition-all bg-[#111] border-zinc-800 focus-within:border-zinc-400 min-w-0">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Amount</span>
              <input 
                type="number" 
                value={amount} 
                placeholder="0.00"
                onChange={(e) => handleAmountChange(e.target.value)} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
              />
              <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeBase}</span>
            </div>

            {/* SLIDER UI */}
            <div className="px-1 py-1 relative group/slider">
              <div className="relative h-8 flex items-center">
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-zinc-800 -translate-y-1/2 rounded-full overflow-hidden">
                   <div 
                    className={`h-full ${side === 'buy' ? 'bg-[#00d18e]' : 'bg-[#ff4d4f]'}`} 
                    style={{ width: `${percent}%` }}
                   />
                </div>
                
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between pointer-events-none px-0.5">
                  {[0, 25, 50, 75, 100].map((dot) => (
                    <div 
                      key={dot} 
                      className={`w-1.5 h-1.5 rounded-full border border-zinc-900 transition-colors ${percent >= dot ? 'bg-white' : 'bg-zinc-600'}`}
                    />
                  ))}
                </div>

                <input 
                  type="range" min="0" max="100" step="any" value={percent}
                  onChange={(e) => handlePercentChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer z-10 opacity-0"
                />

                <div 
                  className={`absolute top-1/2 w-4 h-4 rounded-full shadow-lg border-2 border-zinc-900 pointer-events-none -translate-x-1/2 -translate-y-1/2 bg-white`} 
                  style={{ left: `${percent}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 px-0.5 uppercase tracking-tight -mt-1 select-none">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePercentChange(p)}
                    className="bg-zinc-900/50 border border-white/5 hover:border-white/20 rounded-lg py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex items-center border rounded-xl px-3 h-12 group transition-all bg-[#111] border-zinc-800 focus-within:border-zinc-400 min-w-0`}>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">Total</span>
              <input 
                type="number" 
                value={total} 
                placeholder="0.00"
                onChange={(e) => handleTotalChange(e.target.value)} 
                className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
              />
              <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
            </div>

            {orderType === 'limit' && (
              <div className="flex items-center gap-2 mt-2 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${showTPSL ? 'bg-white border-white' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={showTPSL} 
                      onChange={() => setShowTPSL(!showTPSL)} 
                    />
                    {showTPSL && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-tight">TP/SL</span>
                </label>
              </div>
            )}

            {orderType === 'limit' && showTPSL && (
              <div className="space-y-4 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center border border-zinc-800 bg-[#111] rounded-xl px-3 h-12 focus-within:border-zinc-500 transition-all min-w-0">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">TP</span>
                  <input 
                    type="number" 
                    value={tpInput}
                    onChange={(e) => setTpInput(e.target.value)}
                    placeholder="Take profit price"
                    className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
                  />
                  <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
                </div>
                <div className="flex items-center border border-zinc-800 bg-[#111] rounded-xl px-3 h-12 focus-within:border-zinc-500 transition-all min-w-0">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest min-[1500px]:min-w-[60px] min-w-[50px] shrink-0">SL</span>
                  <input 
                    type="number" 
                    value={slInput}
                    onChange={(e) => setSlInput(e.target.value)}
                    placeholder="Stop loss price"
                    className="flex-1 bg-transparent border-none outline-none text-right text-[14px] font-medium text-white pr-2 placeholder:text-zinc-700 min-w-0" 
                  />
                  <span className="text-[11px] font-bold text-zinc-600 shrink-0 uppercase truncate max-w-[40px]">{activeQuote}</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-zinc-900/50 bg-black shrink-0">
              {user ? (
                <>
                  <div className="flex justify-between items-center text-[12px] font-normal text-zinc-500 px-1 mb-3">
                    <span>Available</span>
                    <span className="text-zinc-300 font-bold tabular-nums tracking-tight">{side === 'buy' ? `${quoteBalance.toLocaleString()} ${activeQuote}` : `${baseBalance.toFixed(4)} ${activeBase}`}</span>
                  </div>

                  <button 
                    onClick={handleTrade}
                    disabled={!isAmountValid}
                    className={`w-full py-3.5 rounded-2xl font-black text-[14px] uppercase tracking-wider transition-all active:scale-[0.98] shadow-2xl disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed ${
                      side === 'buy' ? 'bg-[#00d18e] hover:bg-[#00e099] text-black' : 'bg-[#ff4d4f] hover:bg-[#ff5c5e] text-white'
                    }`}
                  >
                    {side === 'buy' ? 'Buy' : 'Sell'} {activeBase}
                  </button>
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  <button className="w-full py-4 apr-badge-glow text-white font-black rounded-full text-[13px] transition-all flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V22H4V12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H16.5C18.433 7 20 5.433 20 3.5C20 1.567 18.433 0 16.5 0C14.567 0 12 2 12 7ZM12 7H7.5C5.567 7 4 5.433 4 3.5C4 1.567 5.567 0 7.5 0C9.433 0 12 2 12 7Z"/></svg>
                    Sign up to claim $10
                  </button>
                  <button className="w-full py-4 bg-zinc-800 text-white font-black rounded-full text-[13px] transition-all hover:bg-zinc-700">
                    Log In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal for viewing TP/SL Details */}
      {viewingTPSLOrder && (
        <TPSLModal order={viewingTPSLOrder} onClose={() => setViewingTPSLOrder(null)} />
      )}
    </div>
  );
};

export default SpotTrading;
