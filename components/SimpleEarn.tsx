
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useExchangeStore } from '../store';

declare global {
  interface Window {
    VANTA: any;
  }
}

type EarnCategory = 'Simple Earn' | 'Staking' | 'ETH Staking' | 'Dual Investment';

interface StakeModalProps {
  asset: any;
  onClose: () => void;
  activeEarnTab: EarnCategory;
}

const StakeModal: React.FC<StakeModalProps> = ({ asset, onClose, activeEarnTab }) => {
  const [selectedTerm, setSelectedTerm] = useState('Flexible');
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const { balances } = useExchangeStore();

  const assetBalance = balances.find(b => b.symbol === 'ETH' && activeEarnTab === 'ETH Staking' ? b.symbol === 'ETH' : b.symbol === asset.symbol)?.available || 0;

  const terms = [
    { id: 'Flexible', apr: asset.apy, label: 'Flexible', max: true },
    { id: '7d', apr: (parseFloat(asset.apy) * 1.2).toFixed(2), label: '7 Day' },
    { id: '30d', apr: (parseFloat(asset.apy) * 1.8).toFixed(2), label: '30 Day' },
  ];

  const currentTerm = terms.find(t => t.id === selectedTerm) || terms[0];

  const handleStake = () => {
    if (!agreed || !amount || parseFloat(amount) <= 0) return;
    alert(`Successfully staked ${amount} ${asset.symbol}`);
    onClose();
  };

  const today = new Date();
  const formatDateTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').split('.')[0];
  };

  const stakingTime = today;
  const interestAccruesOn = new Date(today);
  interestAccruesOn.setDate(today.getDate() + 1);
  interestAccruesOn.setHours(8, 0, 0, 0);

  const maturityDate = new Date(today);
  maturityDate.setDate(today.getDate() + (selectedTerm === '7d' ? 7 : selectedTerm === '30d' ? 30 : 1));
  maturityDate.setHours(8, 0, 0, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight">Stake {asset.symbol}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section>
            <h3 className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Term</h3>
            <div className="grid grid-cols-3 gap-3">
              {terms.map((term) => (
                <button
                  key={term.id}
                  onClick={() => setSelectedTerm(term.id)}
                  className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                    selectedTerm === term.id 
                      ? 'bg-zinc-800 border-white' 
                      : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-[11px] font-bold text-zinc-400 mb-1">{term.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white tabular-nums">{term.apr}%</span>
                    {term.max && <span className="text-[9px] font-black text-zinc-500 uppercase">Max</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">Amount</h3>
            </div>
            <div className="relative group">
              <input
                type="number"
                placeholder="≥ 0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-4 pr-16 text-sm font-bold focus:border-white/40 outline-none transition-all placeholder:text-zinc-700"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <span className="text-xs font-bold text-zinc-500">{asset.symbol}</span>
                <button 
                  onClick={() => setAmount(assetBalance.toString())}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[12px] font-medium">
              <div className="flex justify-between">
                <span className="text-zinc-500">Available Spot balance</span>
                <span className="text-white flex items-center gap-1 tabular-nums">
                  {assetBalance.toLocaleString()} {asset.symbol}
                  <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Available to Stake</span>
                <span className="text-white tabular-nums">100,000 {asset.symbol}</span>
              </div>
            </div>
          </section>

          <div className="border-b border-white/10 flex gap-6">
            <button className="pb-3 text-sm font-bold border-b-2 border-white text-white">Overview</button>
            <button className="pb-3 text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors">FAQ</button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-400 border-b border-dotted border-zinc-700">Est. Total Interest</span>
              <span className="text-sm font-bold text-zinc-500">-- {asset.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-400">Est. APR</span>
              <span className="text-sm font-bold text-white tabular-nums">{currentTerm.apr}%</span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[13px] font-bold text-zinc-200">Daily interest; early redemption allowed</h4>
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-[7px] top-[10px] bottom-[10px] w-[2px] bg-zinc-800"></div>
              
              {[
                { label: 'Staking Time', value: formatDateTime(stakingTime), active: true },
                { label: 'Interest Accrues on', value: formatDateTime(interestAccruesOn), active: false },
                { label: 'First Interest Distribution', value: 'Upon Redemption', active: false },
                { label: 'Maturity Date', value: formatDateTime(maturityDate), active: false },
              ].map((step, i) => (
                <div key={i} className="relative flex justify-between items-center">
                  <div className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-[#111] ${step.active ? 'bg-white' : 'bg-zinc-800'}`}></div>
                  <span className="text-sm font-medium text-zinc-500 border-b border-dotted border-zinc-800">{step.label}</span>
                  <span className="text-sm font-bold text-zinc-300 tabular-nums">{step.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <svg className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <p className="text-[12px] font-medium text-zinc-500 leading-relaxed">
              Early redemption will forfeit all earned interest. Redemption processing time may vary depending on network conditions.
            </p>
          </div>
        </div>

        <div className="p-6 bg-zinc-900/30 border-t border-white/5 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${agreed ? 'bg-blue-500 border-blue-500' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
              {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
            </div>
            <span className="text-[12px] font-medium text-zinc-400">
              I have read and agree to the <span className="text-blue-400">Quilex Earn Service Agreement</span>
            </span>
          </label>

          <button 
            disabled={!agreed || !amount || parseFloat(amount) <= 0}
            onClick={handleStake}
            className="w-full py-4 bg-white text-black font-black rounded-full text-sm uppercase tracking-tighter disabled:opacity-20 disabled:cursor-not-allowed hover:bg-zinc-200 transition-all active:scale-[0.98]"
          >
            Stake Now
          </button>
        </div>
      </div>
    </div>
  );
};

const SimpleEarn: React.FC = () => {
  const { balances } = useExchangeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEarnTab, setActiveEarnTab] = useState<EarnCategory>('Simple Earn');
  const [productFilter] = useState('All products');
  const [termFilter] = useState('All terms');
  
  const [selectedAssetForStaking, setSelectedAssetForStaking] = useState<any>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const earnTabs: EarnCategory[] = ['Simple Earn', 'Staking', 'ETH Staking', 'Dual Investment'];

  const carouselItems = [
    { symbol: 'ETH', name: 'Ethereum', apr: '20.00%', term: '7 Day(s)' },
    { symbol: 'SOL', name: 'Solana', apr: '20.00%', term: '7 Day(s)' },
    { symbol: 'XRP', name: 'Ripple', apr: '10.00%', term: '7 Day(s)' },
    { symbol: 'DOT', name: 'Polkadot', apr: '15.00%', term: '7 Day(s)' },
    { symbol: 'ADA', name: 'Cardano', apr: '12.00%', term: '7 Day(s)' },
    { symbol: 'AVAX', name: 'Avalanche', apr: '18.00%', term: '7 Day(s)' },
  ];

  useEffect(() => {
    const initVanta = () => {
      if (!vantaEffectRef.current && vantaRef.current && window.VANTA) {
        vantaEffectRef.current = window.VANTA.DOTS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xd7ff20,
          color2: 0x444444,
          size: 2.50,
          spacing: 35.00,
          showLines: false,
          backgroundColor: 0x000000
        });
      }
    };

    const destroyVanta = () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          initVanta();
        } else {
          destroyVanta();
        }
      },
      { threshold: 0.1 }
    );

    if (vantaRef.current) {
      observer.observe(vantaRef.current);
    }

    return () => {
      observer.disconnect();
      destroyVanta();
    };
  }, []);

  useEffect(() => {
    if (isCarouselHovered) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const firstChild = carouselRef.current.firstElementChild as HTMLElement;
        const cardWidth = firstChild?.getBoundingClientRect().width || 0;
        const gap = 24; 
        const scrollAmount = cardWidth + gap;

        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isCarouselHovered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeEarnTab]);

  const earnProducts = useMemo(() => {
    let baseAssets = [...balances];

    if (activeEarnTab === 'ETH Staking') {
      baseAssets = baseAssets.filter(b => b.symbol === 'ETH');
    } else if (activeEarnTab === 'Dual Investment') {
      baseAssets = baseAssets.filter(b => ['BTC', 'ETH', 'SOL', 'BNB'].includes(b.symbol));
    } else if (activeEarnTab === 'Staking') {
      baseAssets = baseAssets.filter(b => b.symbol !== 'USDT' && b.symbol !== 'USDC');
    } else {
      baseAssets = baseAssets.filter(b => b.symbol !== 'USDT' && b.symbol !== 'USDC');
    }

    const assetsWithAPY = baseAssets.map(asset => {
      let apyValue = 1.25;
      let term = 'Flexible';

      if (activeEarnTab === 'Staking') {
        apyValue = 5.5 + (asset.symbol.charCodeAt(0) % 15);
        term = '30/60/90 Days';
      } else if (activeEarnTab === 'ETH Staking') {
        apyValue = 3.42;
        term = 'Beacon Chain';
      } else if (activeEarnTab === 'Dual Investment') {
        apyValue = 15.0 + (asset.symbol.charCodeAt(0) % 80);
        term = 'High Yield';
      } else {
        if (asset.symbol === 'BTC') apyValue = 0.05;
        else if (asset.symbol === 'ETH') apyValue = 1.10;
        else if (asset.symbol === 'SOL') apyValue = 7.42;
        else apyValue = 2.45 + (asset.symbol.charCodeAt(0) % 10);
      }

      const seed = asset.symbol.charCodeAt(0) + asset.symbol.charCodeAt(asset.symbol.length - 1);
      const lockedAmount = asset.price > 1000 ? (seed * 12.5) : (seed * 15420.5);
      const tvl = lockedAmount * asset.price;

      return {
        ...asset,
        apy: apyValue.toFixed(2),
        term: term,
        lockedAmount: lockedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        tvl: tvl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      };
    });

    return assetsWithAPY.filter(p => 
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [balances, searchQuery, activeEarnTab]);

  const totalPages = Math.ceil(earnProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return earnProducts.slice(start, start + itemsPerPage);
  }, [earnProducts, currentPage]);

  return (
    <div className="bg-black min-h-screen text-white pb-32 selection:bg-[#d7ff20]/20">
      <div className="bg-[#0a0a0a] border-b border-zinc-900 px-8 sticky top-0 z-[45] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {earnTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveEarnTab(tab)}
              className={`py-4 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap tracking-tight ${
                activeEarnTab === tab 
                  ? 'border-white text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div ref={vantaRef} className="relative pt-24 pb-24 px-8 md:px-12 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#d7ff20]/10 via-transparent to-transparent blur-[120px] pointer-events-none opacity-40"></div>

        <div className="relative z-10 max-w-[1400px] w-full mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <div className="mb-3 text-[14px] font-bold uppercase tracking-[0.8em] opacity-40 ml-[0.8em]">QUILEX</div>
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter leading-none text-white">
            {activeEarnTab}
          </h1>
          <p className="text-lg md:text-xl font-light text-[#d7ff20] mb-8 tracking-wide opacity-90">
            {activeEarnTab === 'Dual Investment' ? 'Up to 120% APR' : 'Stable yields for your assets'}
          </p>
          
          <div className="flex flex-wrap gap-12 mt-12 items-end justify-center">
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[13px] font-medium border-b border-dotted border-zinc-700 w-fit pb-0.5">
                My Holdings 
                <button onClick={(e) => { e.stopPropagation(); setHideBalances(!hideBalances); }} className="hover:text-white transition-colors ml-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {hideBalances ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              <div className="text-4xl font-bold flex items-center gap-2 tracking-tight tabular-nums">
                {hideBalances ? '******' : '0.00'} 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-500"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="text-zinc-500 text-[13px] font-medium border-b border-dotted border-zinc-700 w-fit pb-0.5">
                Interest Accrued
              </div>
              <div className="text-4xl font-bold flex items-center gap-2 tracking-tight tabular-nums">
                {hideBalances ? '******' : '0.00'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-500"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-zinc-500 text-[13px] font-medium border-b border-dotted border-zinc-700 w-fit pb-0.5">
                Yesterday's Interest
              </div>
              <div className="text-4xl font-bold tracking-tight tabular-nums">
                {hideBalances ? '******' : '0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 mt-12">
        <div 
          className="relative mb-16 group"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-4"
          >
            {carouselItems.map((item, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-[calc(33.333%-16px)] min-w-[320px] bg-[#0d0d0d] border border-white/5 rounded-2xl p-8 flex flex-col justify-between h-48 snap-start hover:border-white/20 transition-all hover:bg-zinc-900/40 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                    <img src={`https://assets.coincap.io/assets/icons/${item.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">{item.symbol}</span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-500 mb-1">Est. APR</span>
                    <span className="text-3xl font-black tracking-tighter text-white tabular-nums">{item.apr}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Term</span>
                    <span className="text-lg font-bold text-zinc-300">{item.term}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-6">
          <h2 className="text-xl font-medium tracking-tight">{activeEarnTab} Products</h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button className="bg-zinc-900/40 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-[11px] font-normal flex items-center gap-2 hover:border-zinc-700 transition-all min-w-[130px] text-zinc-400">
              {productFilter}
              <svg className="ml-auto w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <button className="bg-zinc-900/40 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-[11px] font-normal flex items-center gap-2 hover:border-zinc-700 transition-all min-w-[130px] text-zinc-400">
              {termFilter}
              <svg className="ml-auto w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <div className="relative flex-1 md:flex-none md:w-[240px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search crypto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg py-1.5 pl-9 pr-3 text-[11px] font-normal focus:border-zinc-700 outline-none transition-all placeholder:text-zinc-700 text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-zinc-600 font-normal border-b border-zinc-900 tracking-tight">
                  <th className="px-8 py-4 font-normal">Token</th>
                  <th className="px-8 py-4 font-normal">Market APY</th>
                  <th className="px-8 py-4 font-normal text-right">Total Locked</th>
                  <th className="px-8 py-4 font-normal text-right">TVL (USD)</th>
                  <th className="px-8 py-4 font-normal text-center">Term</th>
                  <th className="px-8 py-4 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {paginatedProducts.length > 0 ? paginatedProducts.map((product) => (
                  <tr key={product.symbol} onClick={() => setSelectedAssetForStaking(product)} className="hover:bg-zinc-900/20 transition-all group cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5">
                           <img src={`https://assets.coincap.io/assets/icons/${product.symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-white group-hover:text-[#d7ff20] transition-colors">{product.symbol}</span>
                          <span className="text-[9px] text-zinc-600 font-normal uppercase tracking-tight">{product.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-bold text-[#00d18e] tabular-nums">{product.apy}%</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-[12px] text-zinc-300 font-medium tabular-nums">{product.lockedAmount} {product.symbol}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-[12px] text-zinc-500 font-medium tabular-nums">${product.tvl}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="text-[12px] text-zinc-500 font-medium">{product.term}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="px-6 py-2 bg-white text-black text-[13px] font-bold rounded-full hover:bg-[#d7ff20] transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 tracking-tight shadow-xl">
                          Stake
                        </button>
                        <svg className="w-4 h-4 text-zinc-800 transition-colors group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center">
                      <p className="text-zinc-600 text-[11px] font-normal uppercase tracking-widest opacity-60">No products available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-zinc-950/20">
              <div className="text-[11px] text-zinc-500 font-medium">
                Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, earnProducts.length)}</span> of <span className="text-white">{earnProducts.length}</span> products
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 rounded-lg text-[11px] font-bold transition-all ${currentPage === page ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between group hover:border-zinc-800 transition-colors">
            <div>
              <h3 className="text-base font-medium mb-3 tracking-tight">{activeEarnTab} Overview</h3>
              <p className="text-zinc-500 text-[12px] leading-relaxed mb-6 font-normal opacity-80">
                {activeEarnTab} is a premier product that provides {activeEarnTab === 'Simple Earn' ? 'flexible or fixed terms' : 'staking rewards'} with daily payouts. Your assets are managed through institutional-grade protocols to ensure consistent yield generation.
              </p>
            </div>
            <button className="text-[#d7ff20] text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-all">
              Learn more about yield <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between group hover:border-zinc-800 transition-colors">
            <div>
              <h3 className="text-base font-medium mb-3 tracking-tight">Safety & Security</h3>
              <p className="text-zinc-500 text-[12px] leading-relaxed mb-6 font-normal opacity-80">
                Your principal is protected by Quilex. We use industry-standard risk management frameworks to ensure that rewards are distributed consistently while maintaining 100% solvency of the pool.
              </p>
            </div>
            <button className="text-[#d7ff20] text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-all">
              Review safety report <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {selectedAssetForStaking && (
        <StakeModal 
          asset={selectedAssetForStaking} 
          onClose={() => setSelectedAssetForStaking(null)} 
          activeEarnTab={activeEarnTab}
        />
      )}
    </div>
  );
};

export default SimpleEarn;
