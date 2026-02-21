import React, { useState, useRef, useEffect } from 'react';
import { useExchangeStore } from '../store';
import { motion } from 'motion/react';

interface HomeProps {
  onTrade: () => void;
}

const Home: React.FC<HomeProps> = ({ onTrade }) => {
  const { balances } = useExchangeStore();
  
  // States for currency dropdowns
  const [hotCurrency, setHotCurrency] = useState('USD');
  const [isHotOpen, setIsHotOpen] = useState(false);
  const [newListCurrency, setNewListCurrency] = useState('USD');
  const [isNewListOpen, setIsNewListOpen] = useState(false);

  const hotRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hotRef.current && !hotRef.current.contains(event.target as Node)) setIsHotOpen(false);
      if (newRef.current && !newRef.current.contains(event.target as Node)) setIsNewListOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dohvatanje podataka za Hot Crypto boks
  const hotAssets = balances.filter(b => ['BTC', 'ETH', 'SOL'].includes(b.symbol));

  const renderIcon = (symbol: string) => (
    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[11px] font-black text-zinc-400 transition-colors overflow-hidden relative">
      <img 
        src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`} 
        alt={symbol}
        className="w-full h-full object-cover relative z-10"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );

  const CurrencyDropdown = ({ selected, onSelect, isOpen, setIsOpen, containerRef }: any) => (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-[11px] font-bold transition-colors"
      >
        {selected} <svg className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-20 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
          {['USD', 'USDT'].map(curr => (
            <button 
              key={curr}
              onClick={() => { onSelect(curr); setIsOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-zinc-800 transition-colors ${selected === curr ? 'text-white' : 'text-zinc-500'}`}
            >
              {curr}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center bg-black px-6 pb-20 overflow-hidden">
      {/* Hero Section */}
      <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(253,104,24,0.1),transparent_50%)] pointer-events-none"></div>
        
        <div className="max-w-6xl w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Live on Mainnet</span>
            </div>
            
            <h1 className="text-7xl md:text-[120px] font-black mb-8 leading-[0.85] tracking-tighter text-white">
              THE NEXT GEN<br />
              <span className="text-brand">EXCHANGE.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Trade Bitcoin, Ethereum, and 100+ assets with institutional-grade tools and the lowest fees in the industry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
              <button 
                onClick={onTrade}
                className="group px-10 py-5 bg-white text-white font-black rounded-full text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] apr-badge-glow hover:shadow-[0_0_25px_rgba(253,104,24,0.4)]"
              >
                <span className="rolling-text-container relative -top-[0.5px]">
                  <span className="rolling-text-inner">
                    <span className="block">Trade Now</span>
                    <span className="block">Trade Now</span>
                  </span>
                </span>
              </button>
              <button className="px-10 py-5 bg-transparent text-white font-black rounded-full text-lg border border-white/20 hover:bg-white/5 transition-all backdrop-blur-sm">
                <span className="rolling-text-container relative -top-[0.5px]">
                  <span className="rolling-text-inner">
                    <span className="block">View Markets</span>
                    <span className="block">View Markets</span>
                  </span>
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl w-full relative z-10 -mt-20">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-[#050505]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] p-12 mb-24 shadow-2xl">
          <div>
            <div className="text-4xl font-black mb-1 tracking-tighter">$2.4B+</div>
            <div className="text-zinc-500 text-xs font-black uppercase tracking-widest">24h Volume</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-1 tracking-tighter">0.1%</div>
            <div className="text-zinc-500 text-xs font-black uppercase tracking-widest">Trading Fee</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-1 tracking-tighter">20M+</div>
            <div className="text-zinc-500 text-xs font-black uppercase tracking-widest">Users</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-1 tracking-tighter">100%</div>
            <div className="text-zinc-500 text-xs font-black uppercase tracking-widest">Reserves</div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mb-24 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            {['Binance', 'Coinbase', 'Kraken', 'Bybit', 'OKX'].map(partner => (
              <div key={partner} className="text-xl font-black tracking-tighter text-white">{partner}</div>
            ))}
          </div>
        </div>

        {/* 3 Market Insight Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Box 1: Hot crypto */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1">
                Hot crypto <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg>
              </h3>
              <CurrencyDropdown 
                selected={hotCurrency} 
                onSelect={setHotCurrency} 
                isOpen={isHotOpen} 
                setIsOpen={setIsHotOpen} 
                containerRef={hotRef}
              />
            </div>
            <div className="space-y-2">
              {hotAssets.map((asset) => (
                <div 
                  key={asset.symbol} 
                  onClick={onTrade}
                  className="flex justify-between items-center cursor-pointer hover:bg-white/[0.04] -mx-2 px-2 py-2 rounded-lg transition-all group/row"
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(asset.symbol)}
                    <span className="text-sm font-bold">{asset.symbol}<span className="text-zinc-600">/{hotCurrency}</span></span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold tracking-tight text-zinc-200">{asset.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                    <div className={`text-[11px] font-bold ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: New listings */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1">
                New listings <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg>
              </h3>
              <CurrencyDropdown 
                selected={newListCurrency} 
                onSelect={setNewListCurrency} 
                isOpen={isNewListOpen} 
                setIsOpen={setIsNewListOpen} 
                containerRef={newRef}
              />
            </div>
            <div className="space-y-2">
              {[
                { symbol: 'ZAMA', name: 'Zama', price: 0.02774, change: 4.68 },
                { symbol: 'USAT', name: 'USAT', price: 1.0020, change: 0.00 },
                { symbol: 'SENT', name: 'Sentinel', price: 0.02912, change: 5.47 }
              ].map((item) => (
                <div 
                  key={item.symbol} 
                  onClick={onTrade}
                  className="flex justify-between items-center cursor-pointer hover:bg-white/[0.04] -mx-2 px-2 py-2 rounded-lg transition-all group/row"
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(item.symbol)}
                    <span className="text-sm font-bold">{item.symbol}<span className="text-zinc-600">/{newListCurrency}</span></span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold tracking-tight text-zinc-200">{item.price.toFixed(item.price < 1 ? 5 : 2)}</div>
                    <div className={`text-[11px] font-bold ${item.change >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3: Macro data */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1">
                Macro data <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7"/></svg>
              </h3>
            </div>
            <div className="flex justify-between mb-6">
               <div>
                 <div className="flex items-center gap-1.5 mb-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f]"></div>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Market cap</span>
                 </div>
                 <div className="text-sm font-black">$2.31T <span className="text-[#ff4d4f] text-[11px]">-8.42%</span></div>
               </div>
               <div>
                 <div className="flex items-center gap-1.5 mb-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Volume</span>
                 </div>
                 <div className="text-sm font-black">$358.32B <span className="text-[#00d18e] text-[11px]">+62.70%</span></div>
               </div>
               <div className="text-right">
                 <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-1.5">BTC dominance</div>
                 <div className="text-sm font-black">56.4%</div>
               </div>
            </div>
            {/* Mini Chart Mockup */}
            <div className="h-16 w-full relative mt-6 overflow-hidden">
              <svg className="w-full h-full text-[#ff4d4f]/50" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 L10,8 L20,12 L30,5 L40,15 L50,8 L60,10 L70,14 L80,9 L90,11 L100,7" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <div className="absolute inset-0 flex items-end gap-[2px]">
                {Array.from({length: 40}).map((_, i) => (
                  <div key={i} className="flex-1 bg-zinc-900" style={{height: `${Math.random() * 60 + 20}%`}}></div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
