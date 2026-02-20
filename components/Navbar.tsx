
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Page } from '../types';
import { useExchangeStore } from '../store';
import AuthModal from './AuthModal';
import Logo from './Logo';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { balances, user, profile, signOut, isGuest, setDepositModalOpen, setMarketsActiveTab, setActivePair, favorites, toggleFavorite } = useExchangeStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isMarketsOpen, setIsMarketsOpen] = useState(false);
  const [isEarnNavOpen, setIsEarnNavOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  
  // Badge text cycle
  const [badgeIndex, setBadgeIndex] = useState(0);
  const badgeItems = ['ETH 25.1%', 'UNI 59.0%', 'SOL 12.4%', 'PEPE 180%', 'BTC 0.05%'];

  useEffect(() => {
    const timer = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % badgeItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [badgeItems.length]);

  // Search placeholder cycle
  const hotSearchItems = ['BTC', 'ETH', 'SOL', 'PEPE', 'DOGE'];
  const [searchPlaceholderIndex, setSearchPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchPlaceholderIndex((prev) => (prev + 1) % hotSearchItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [hotSearchItems.length]);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedLang, setSelectedLang] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const totalBalanceUSD = balances.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65000;
  const totalInBTC = totalBalanceUSD / btcPrice;

  const maskedEmail = user?.email ? `${user.email.split('@')[0].slice(0, 3)}***@${user.email.split('@')[1]}` : 'guest@lintex.exchange';
  const displayUid = user?.id?.slice(0, 16) || '805418618808070350';

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered results for search - Show pairs
  const searchResults = useMemo(() => {
    // We only want pairs like BTC/USDT, filtering out USDT/USDT
    const tradeableAssets = balances.filter(b => b.symbol !== 'USDT');
    
    if (!searchQuery.trim()) {
      return tradeableAssets.slice(0, 8);
    }
    
    return tradeableAssets.filter(asset => 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [balances, searchQuery]);

  // Standardized UI constants
  const dropdownBaseClass = "bg-white text-black rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.18)] overflow-hidden border border-gray-100";
  const darkDropdownBaseClass = "bg-[#111] text-white rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden border border-zinc-800";
  const dropdownItemClass = "w-full flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50 transition-all text-left group";
  const dropdownTextClass = "text-[13px] font-medium text-gray-800 group-hover:text-black tracking-tight"; 
  const dropdownIconClass = "text-gray-400 group-hover:text-black transition-colors shrink-0";

  return (
    <>
      <nav className="h-16 flex items-center px-6 bg-black z-[60] sticky top-0 shadow-2xl">
        <div className="flex items-center gap-2 mr-10 cursor-pointer group shrink-0" onClick={() => onNavigate(Page.HOME)}>
          <Logo className="h-6 md:h-7 transition-all text-white" />
        </div>

        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium tracking-tight h-full">
          {/* Trade Dropdown */}
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsTradeOpen(true)} onMouseLeave={() => setIsTradeOpen(false)}>
            <button onClick={() => onNavigate(Page.TRADE)} className={`transition-all hover:text-white flex items-center gap-1.5 h-full ${currentPage === Page.TRADE ? 'text-white' : 'text-gray-400'}`}>
              Trade
              <svg className={`w-3 h-3 transition-transform duration-300 ${isTradeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className={`top-full left-0 dropdown-container ${isTradeOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[380px] py-4`}>
                <div className="space-y-1 px-2">
                  {[
                    { title: 'Convert', desc: 'Quick conversion, zero fees', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h7"/></svg> },
                    { title: 'Spot', desc: 'Buy and sell crypto with ease', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9-9a9 9 0 0 0-9 9"/></svg> },
                    { title: 'Spot DCA', desc: 'Automated recurring buy strategy', isNew: true, page: Page.SPOT_DCA, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9-9a9 9 0 0 0-9 9"/><path d="M12 7v5l3 3"/></svg> },
                    { title: 'Futures', desc: 'Up to 125x leverage', soon: true, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> }
                  ].map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { if (!item.soon) { onNavigate(item.page || Page.TRADE); } setIsTradeOpen(false); }} 
                      className={`${dropdownItemClass} rounded-2xl ${item.soon ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <span className={dropdownIconClass}>{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={dropdownTextClass}>{item.title}</div>
                          {item.soon && <span className="bg-blue-500/10 text-blue-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Soon</span>}
                          {item.isNew && <span className="apr-badge-glow text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1.5">NEW</span>}
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Markets Dropdown */}
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsMarketsOpen(true)} onMouseLeave={() => setIsMarketsOpen(false)}>
            <button onClick={() => onNavigate(Page.MARKETS)} className={`transition-all hover:text-white flex items-center gap-1.5 h-full ${currentPage === Page.MARKETS ? 'text-white' : 'text-gray-400'}`}>
              Markets
              <svg className={`w-3 h-3 transition-transform duration-300 ${isMarketsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className={`top-full left-0 dropdown-container ${isMarketsOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[300px] py-4 px-2`}>
                <div className="space-y-1">
                  {[
                    { title: 'Markets Overview', desc: 'Prices and trends', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/></svg> },
                    { title: 'Rankings', desc: 'Top gainers and trends', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg> }
                  ].map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { setMarketsActiveTab(item.title as any); onNavigate(Page.MARKETS); setIsMarketsOpen(false); }} 
                      className={`${dropdownItemClass} rounded-2xl`}
                    >
                      <span className={dropdownIconClass}>{item.icon}</span>
                      <div>
                        <div className={dropdownTextClass}>{item.title}</div>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Earn Dropdown */}
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsEarnNavOpen(true)} onMouseLeave={() => setIsEarnNavOpen(false)}>
            <button className={`transition-all hover:text-white flex items-center gap-1.5 h-full text-gray-400`}>
              Earn
              <span className="ml-1 hidden xl:inline-flex items-center justify-center apr-badge-glow text-white text-[11px] font-black px-1.5 rounded-full tracking-tighter whitespace-nowrap overflow-hidden h-[21px] min-w-[78px]">
                <div className="relative h-full w-full badge-text-slide-up" style={{ transform: `translateY(-${badgeIndex * 100}%)` }}>
                  {badgeItems.map((bi, i) => (
                    <div key={i} className="h-full flex items-center justify-center">{bi}</div>
                  ))}
                </div>
              </span>
              <svg className={`w-3 h-3 transition-transform duration-300 ${isEarnNavOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className={`top-full left-0 dropdown-container ${isEarnNavOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[380px] py-4`}>
                <div className="space-y-1 px-2">
                  {[
                    { title: 'Simple Earn', page: Page.SIMPLE_EARN, desc: 'Flexible savings with daily rewards', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                    { title: 'Staking', desc: 'Earn high yields on your crypto', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v18M3 12h18M5 19l14-14M5 5l14 14"/></svg> },
                    { title: 'ETH Staking', desc: 'Stake ETH and receive BETH', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 2 7 4-7 4-7-4 7-4zM12 11l7 4-7 4-7-4 7-4zM12 20l7 4-7 4-7-4 7-4z"/></svg> },
                    { title: 'Dual Investment', desc: 'Buy low or sell high with bonus yield', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="7" cy="12" r="5"/><circle cx="17" cy="12" r="5"/></svg> }
                  ].map((item, idx) => (
                    <button key={idx} onClick={() => { if(item.page) onNavigate(item.page); setIsEarnNavOpen(false); }} className={`${dropdownItemClass} rounded-2xl`}>
                      <span className={dropdownIconClass}>{item.icon}</span>
                      <div className="flex-1">
                        <div className={dropdownTextClass}>{item.title}</div>
                        <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Learn Dropdown */}
          <div className="relative h-full flex items-center" onMouseEnter={() => setIsLearnOpen(true)} onMouseLeave={() => setIsLearnOpen(false)}>
            <button className={`transition-all hover:text-white flex items-center gap-1.5 h-full text-gray-400`}>
              Learn
              <svg className={`w-3 h-3 transition-transform duration-300 ${isLearnOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className={`top-full left-0 dropdown-container ${isLearnOpen ? 'is-visible' : ''}`}>
              <div className={`${dropdownBaseClass} w-[340px] py-4 px-2`}>
                <div className="space-y-1">
                  {[
                    { title: 'Learn crypto', desc: 'Build crypto fundamentals', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
                    { title: 'How to buy crypto', desc: 'Step-by-step guides', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20M7 15h.01M11 15h2"/></svg> },
                    { title: 'Getting started', desc: 'Common journey questions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> }
                  ].map((item, idx) => (
                    <button key={idx} className={`${dropdownItemClass} rounded-2xl`}>
                      <span className={dropdownIconClass}>{item.icon}</span>
                      <div>
                        <div className={dropdownTextClass}>{item.title}</div>
                        <p className="text-[11px] text-gray-400 font-medium leading-snug mt-1">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => onNavigate(Page.REFERRAL)} className={`transition-all hover:text-white relative h-full flex items-center ${currentPage === Page.REFERRAL ? 'text-white' : 'text-gray-400'}`}>
            Referral
          </button>
          
          <button onClick={() => onNavigate(Page.AFFILIATE)} className={`transition-all hover:text-white relative h-full flex items-center ${currentPage === Page.AFFILIATE ? 'text-white' : 'text-gray-400'}`}>
            Affiliate
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center relative mr-2 group" ref={searchRef}>
            <button 
              onClick={() => { setIsSearchOpen(!isSearchOpen); if (!isSearchOpen) setTimeout(() => inputRef.current?.focus(), 50); }}
              className="xl:absolute xl:left-3.5 xl:top-1/2 xl:-translate-y-1/2 p-2.5 rounded-xl text-gray-400 hover:text-white xl:pointer-events-none xl:p-0 transition-colors z-10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <div className="relative hidden xl:block">
              <input 
                ref={inputRef}
                type="text" 
                value={searchQuery}
                onFocus={() => { setIsSearchOpen(true); }}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                className={`bg-zinc-800/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-medium transition-all placeholder:text-gray-500 placeholder:tracking-tighter text-white shadow-inner relative z-[1] outline-none ${isSearchOpen ? 'w-48 bg-zinc-800 border-white/20' : 'w-32'}`}
              />
              {!searchQuery && (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none flex items-center h-[20px] z-[2]">
                  <div key={searchPlaceholderIndex} className="coin-placeholder-fade flex items-center gap-1.5">
                    <span className="text-[10px] transform -translate-y-[0.5px]">🔥</span>
                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{hotSearchItems[searchPlaceholderIndex]}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Search Dropdown - Dark Theme Redesign */}
            <div className={`absolute top-full right-0 xl:left-0 mt-2 dropdown-container ${isSearchOpen ? 'is-visible' : ''}`}>
              <div className={`${darkDropdownBaseClass} w-[340px] py-4`}>
                <div className="px-5 pb-3 text-[13px] font-bold text-white tracking-tight">{searchQuery ? 'Search results' : 'Popular searches'}</div>
                <div className="space-y-0.5">
                  {searchResults.map((asset) => (
                    <div 
                      key={asset.symbol} 
                      onClick={() => { 
                        setActivePair(`${asset.symbol}/USDT`);
                        onNavigate(Page.TRADE); 
                        setIsSearchOpen(false); 
                        setSearchQuery(''); 
                      }} 
                      className="w-full flex items-center px-4 py-2.5 hover:bg-zinc-800 transition-all group/item cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-[9px] text-zinc-500 overflow-hidden relative shrink-0">
                           <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} alt={asset.symbol} className="w-full h-full object-cover relative z-10" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                        </div>
                        <div className="flex flex-col items-start leading-none truncate">
                          <div className="flex items-center gap-1.5">
                             <span className="text-[13px] font-bold text-white group-hover/item:text-blue-400 transition-colors">{asset.symbol}</span>
                             <span className="text-[11px] text-zinc-500 font-medium">/ USDT</span>
                          </div>
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 font-black px-1 rounded-sm uppercase tracking-tighter mt-1">Spot</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[12px] font-bold text-white tabular-nums">{asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div className={`text-[10px] font-bold ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'} tabular-nums`}>{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</div>
                        </div>
                        <button 
                          onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            toggleFavorite(asset.symbol); 
                          }}
                          className="p-1.5 rounded-md hover:bg-zinc-700 transition-all active:scale-125 group/fav"
                        >
                           <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill={favorites.includes(asset.symbol) ? "#F1F22D" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`transition-all duration-300 ${favorites.includes(asset.symbol) ? 'text-[#F1F22D]' : 'text-zinc-600 group-hover/fav:text-zinc-400'}`}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {user ? (
            <>
              <button 
                onClick={() => { onNavigate(Page.ASSETS); setDepositModalOpen(true); }} 
                className="hidden lg:block group px-5 py-2 apr-badge-glow text-white text-[12px] font-bold tracking-tight rounded-full active:scale-95 transition-all mr-3 shadow-[0_0_15px_rgba(79,230,241,0.2)] hover:shadow-[0_0_25px_rgba(79,230,241,0.5)] whitespace-nowrap shrink-0 overflow-hidden"
              >
                <span className="rolling-text-container">
                  <span className="rolling-text-inner">
                    <span className="block">Deposit</span>
                    <span className="block">Deposit</span>
                  </span>
                </span>
              </button>

              <div className="relative h-16 flex items-center" onMouseEnter={() => setIsWalletOpen(true)} onMouseLeave={() => setIsWalletOpen(false)}>
                <button onClick={() => onNavigate(Page.ASSETS)} className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 hover:bg-zinc-800 hover:text-white ${isWalletOpen ? 'bg-zinc-800 text-white' : (currentPage === Page.ASSETS ? 'text-white' : 'text-gray-400')}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
                  <span className="hidden xl:block text-[11px] font-semibold tracking-tight">Wallet</span>
                </button>
                <div className={`absolute top-full right-0 dropdown-container ${isWalletOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-80 p-6`}>
                    <div className="mb-6">
                      <div className="text-[10px] font-bold text-gray-400 tracking-tight mb-1.5 opacity-80 uppercase">Total balance</div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-black tracking-tight">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[11px] font-bold text-gray-400">USD</span>
                        </div>
                        <div className="text-[13px] font-medium text-gray-500 tracking-tight">≈ {totalInBTC.toFixed(6)} BTC</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button onClick={() => { onNavigate(Page.ASSETS); setDepositModalOpen(true); setIsWalletOpen(false); }} className="py-3 bg-black text-white text-[11px] font-semibold rounded-full hover:bg-zinc-800 transition-all shadow-lg tracking-tight">Deposit</button>
                      <button onClick={() => { onNavigate(Page.ASSETS); setIsWalletOpen(false); }} className="py-3 bg-gray-50 text-black text-[11px] font-semibold rounded-full border border-gray-100 hover:bg-gray-100 transition-all tracking-tight">Withdraw</button>
                    </div>
                    <div className="space-y-0.5 border-t border-gray-50 pt-5">
                      {[
                        { label: 'Overview', page: Page.ASSETS, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 12L16 10M12 12V7"/></svg> },
                        { label: 'Spot', page: Page.TRADE, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5"/></svg> },
                        { label: 'Fees', page: Page.SETTINGS, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg> }
                      ].map((link) => (
                        <button key={link.label} onClick={() => { onNavigate(link.page); setIsWalletOpen(false); }} className={dropdownItemClass}>
                          <span className={dropdownIconClass}>{link.icon}</span>
                          <span className={dropdownTextClass}>{link.label}</span>
                          <svg className="ml-auto w-3.5 h-3.5 text-gray-200 group-hover:text-black transition-all transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-16 flex items-center" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                <button onClick={() => onNavigate(Page.SETTINGS)} className={`p-2.5 rounded-xl transition-all flex items-center justify-center hover:bg-zinc-800 hover:text-white ${isUserOpen ? 'bg-zinc-800 text-white' : (currentPage === Page.SETTINGS ? 'text-white' : 'text-gray-400')}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
                <div className={`top-full right-0 dropdown-container ${isUserOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-[300px] py-4`}>
                    <div className="px-5 pb-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'lintex'}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate tracking-tight">{maskedEmail}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-tight mt-0.5 UID: ">UID: {displayUid}</span>
                      </div>
                    </div>
                    <div className="px-5 pb-4 border-b border-gray-50">
                      <button className="w-full py-2 border border-gray-200 rounded-full text-[11px] font-semibold hover:bg-gray-50 transition-colors tracking-tight">Switch sub-account</button>
                    </div>
                    <div className="py-2 max-h-[440px] overflow-y-auto light-scrollbar">
                      {[
                        { label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 12L16 10M12 12V7"/></svg> },
                        { label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                        { label: 'Security', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
                        { label: 'Verification', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="14" x="3" y="5" rx="2"/><path d="M7 10h10M7 14h6"/></svg> },
                        { label: 'Preferences', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> }
                      ].map((item) => (
                        <button key={item.label} onClick={() => { onNavigate(Page.SETTINGS); setIsUserOpen(false); }} className={dropdownItemClass}>
                          <span className={dropdownIconClass}>{item.icon}</span>
                          <span className={dropdownTextClass}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 pt-2 border-t border-gray-50">
                      <button onClick={() => { signOut(); setIsUserOpen(false); }} className={`${dropdownItemClass} py-4`}>
                        <span className={dropdownIconClass}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
                        <span className="text-[13px] font-bold text-red-600 group-hover:text-red-700 tracking-tight">Log out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-zinc-600/60 mx-2 hidden sm:block"></div>
              
              <div className="relative h-16 flex items-center hidden sm:flex" onMouseEnter={() => setIsSupportOpen(true)} onMouseLeave={() => setIsSupportOpen(false)}>
                <button className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${isSupportOpen ? 'text-white bg-zinc-800' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </button>
                <div className={`top-full right-0 dropdown-container ${isSupportOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-64 p-3`}>
                    <button className={dropdownItemClass}>
                      <span className={dropdownIconClass}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
                      <span className={dropdownTextClass}>Support center</span>
                    </button>
                    <button className={dropdownItemClass}>
                      <span className={dropdownIconClass}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 4h2a2 2 0 0 1-2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></span>
                      <span className={dropdownTextClass}>Open a Ticket</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative h-16 flex items-center hidden sm:flex" onMouseEnter={() => setIsLanguageOpen(true)} onMouseLeave={() => setIsLanguageOpen(false)}>
                <button className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${isLanguageOpen ? 'text-white bg-zinc-800' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </button>
                <div className={`top-full right-0 dropdown-container ${isLanguageOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-[640px] p-8`}>
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <div className="flex items-center gap-2 mb-6"><h3 className="text-xl font-bold tracking-tight">Language</h3></div>
                        <div className="relative mb-6">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
                          <input type="text" placeholder="Search" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-2 light-scrollbar">
                          {['English', '简体中文', '繁體中文', 'Tiếng Việt', 'Русский', 'Español', 'Bahasa Indonesia', 'Français', 'Deutsch', 'Italiano'].map(lang => (
                            <button key={lang} onClick={() => setSelectedLang(lang)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all text-left group">
                              <span className={`text-[13px] font-medium ${selectedLang === lang ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>{lang}</span>
                              {selectedLang === lang && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-6"><h3 className="text-xl font-bold tracking-tight">Local currency</h3></div>
                        <div className="relative mb-6">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
                          <input type="text" placeholder="Search" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-2 light-scrollbar">
                          {['USD', 'CNY', 'RUB', 'JPY', 'EUR', 'VND', 'IDR', 'PHP', 'INR', 'GBP'].map(curr => (
                            <button key={curr} onClick={() => setSelectedCurrency(curr)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all text-left group">
                              <span className={`text-[13px] font-medium ${selectedCurrency === curr ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>{curr}</span>
                              {selectedCurrency === curr && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative h-16 flex items-center hidden lg:flex" onMouseEnter={() => setIsSupportOpen(true)} onMouseLeave={() => setIsSupportOpen(false)}>
                <button className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${isSupportOpen ? 'text-white bg-zinc-800' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span className="hidden xl:block text-[11px] font-semibold tracking-tight">Support</span>
                </button>
                <div className={`top-full right-0 dropdown-container ${isSupportOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-64 p-3`}>
                    <button className={dropdownItemClass}>
                      <span className={dropdownIconClass}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
                      <span className={dropdownTextClass}>Support center</span>
                    </button>
                    <button className={dropdownItemClass}>
                      <span className={dropdownIconClass}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 4h2a2 2 0 0 1-2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></span>
                      <span className={dropdownTextClass}>Open a Ticket</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative h-16 flex items-center hidden lg:flex" onMouseEnter={() => setIsLanguageOpen(true)} onMouseLeave={() => setIsLanguageOpen(false)}>
                <button className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${isLanguageOpen ? 'text-white bg-zinc-800' : 'text-gray-400 hover:text-white hover:bg-zinc-800'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </button>
                <div className={`top-full right-0 dropdown-container ${isLanguageOpen ? 'is-visible' : ''}`}>
                  <div className={`${dropdownBaseClass} w-[640px] p-8`}>
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <div className="flex items-center gap-2 mb-6"><h3 className="text-xl font-bold tracking-tight">Language</h3></div>
                        <div className="relative mb-6">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
                          <input type="text" placeholder="Search" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-2 light-scrollbar">
                          {['English', '简体中文', '繁體中文', 'Tiếng Việt', 'Русский', 'Español', 'Bahasa Indonesia', 'Français', 'Deutsch', 'Italiano'].map(lang => (
                            <button key={lang} onClick={() => setSelectedLang(lang)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all text-left group">
                              <span className={`text-[13px] font-medium ${selectedLang === lang ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>{lang}</span>
                              {selectedLang === lang && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-6"><h3 className="text-xl font-bold tracking-tight">Local currency</h3></div>
                        <div className="relative mb-6">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
                          <input type="text" placeholder="Search" className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-0.5 max-h-[400px] overflow-y-auto pr-2 light-scrollbar">
                          {['USD', 'CNY', 'RUB', 'JPY', 'EUR', 'VND', 'IDR', 'PHP', 'INR', 'GBP'].map(curr => (
                            <button key={curr} onClick={() => setSelectedCurrency(curr)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all text-left group">
                              <span className={`text-[13px] font-medium ${selectedCurrency === curr ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>{curr}</span>
                              {selectedCurrency === curr && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-zinc-600/60 mx-3 hidden sm:block"></div>
              <button onClick={() => setShowAuth(true)} className="group px-6 py-2.5 bg-white text-black text-[12px] font-bold tracking-tight rounded-full hover:bg-gray-200 transition-all shadow-xl whitespace-nowrap shrink-0 overflow-hidden">
                <span className="rolling-text-container">
                  <span className="rolling-text-inner">
                    <span className="block">Log In</span>
                    <span className="block">Log In</span>
                  </span>
                </span>
              </button>
            </>
          )}
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;
