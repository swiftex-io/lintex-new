
import React, { useState, useEffect, useMemo } from 'react';
import { useExchangeStore } from '../store';

interface DCATokenAllocation {
  symbol: string;
  percentage: number;
}

interface CreatePlanModalProps {
  initialTokens: string[];
  onClose: () => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ initialTokens, onClose }) => {
  const { balances } = useExchangeStore();
  const [tokens, setTokens] = useState<DCATokenAllocation[]>(
    initialTokens.map((t, i) => ({ 
      symbol: t, 
      percentage: i === 0 ? 100 : 0 
    }))
  );
  const [interval, setInterval] = useState('Every 1 days at');
  const [time, setTime] = useState('6:00 (UTC-8)');
  const [amount, setAmount] = useState('');
  const [startImmediately, setStartImmediately] = useState(true);

  const totalAllocation = tokens.reduce((acc, curr) => acc + curr.percentage, 0);
  const remainingAllocation = 100 - totalAllocation;
  const usdtBalance = balances.find(b => b.symbol === 'USDT')?.available || 0;

  const handleAddToken = () => {
    if (tokens.length < 5) {
      setTokens([...tokens, { symbol: 'ETH', percentage: 0 }]);
    }
  };

  const removeToken = (index: number) => {
    if (tokens.length > 1) {
      setTokens(tokens.filter((_, i) => i !== index));
    }
  };

  const updatePercentage = (index: number, val: string) => {
    const num = parseInt(val) || 0;
    const newTokens = [...tokens];
    newTokens[index].percentage = num;
    setTokens(newTokens);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight">Create Plan</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* DCA Tokens Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">DCA Tokens</h3>
              <button 
                onClick={handleAddToken}
                className="text-[12px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                Add Token
              </button>
            </div>

            <div className="space-y-3">
              {tokens.map((token, idx) => (
                <div key={idx} className="flex gap-3 items-center animate-in slide-in-from-left-2 duration-300">
                  <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center px-4 h-14 group focus-within:border-white/20 transition-all">
                    <div className="flex items-center gap-2 pr-4 border-r border-white/5 cursor-pointer">
                      <img src={`https://assets.coincap.io/assets/icons/${token.symbol.toLowerCase()}@2x.png`} className="w-5 h-5 rounded-full" alt="" />
                      <span className="text-sm font-bold">{token.symbol}</span>
                      <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                    <input 
                      type="number"
                      value={token.percentage === 0 ? '' : token.percentage}
                      onChange={(e) => updatePercentage(idx, e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-transparent border-none outline-none text-right font-bold px-4 text-white tabular-nums"
                    />
                    <span className="text-zinc-600 font-bold text-sm">%</span>
                  </div>
                  {tokens.length > 1 && (
                    <button 
                      onClick={() => removeToken(idx)}
                      className="w-14 h-14 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className={`text-[11px] font-bold uppercase tracking-tight ${remainingAllocation !== 0 ? 'text-zinc-500' : 'text-green-500'}`}>
              Remaining allocation ratio <span className="tabular-nums">{remainingAllocation}%</span>
            </div>
          </section>

          {/* DCA Interval Section */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">DCA Interval</h3>
            <div className="space-y-3">
              <div className="relative group">
                <select 
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-5 h-14 appearance-none text-sm font-bold outline-none focus:border-white/20 transition-all cursor-pointer"
                >
                  <option>Every 1 days at</option>
                  <option>Every week at</option>
                  <option>Every month on the 1 at</option>
                </select>
                <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <div className="relative group">
                <select 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-5 h-14 appearance-none text-sm font-bold outline-none focus:border-white/20 transition-all cursor-pointer"
                >
                  <option>6:00 (UTC-8)</option>
                  <option>10:00 (UTC-8)</option>
                  <option>14:00 (UTC-8)</option>
                  <option>18:00 (UTC-8)</option>
                </select>
                <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <label className="flex items-center gap-3 pt-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${startImmediately ? 'bg-blue-500 border-blue-500' : 'border-zinc-700'}`}>
                <input type="checkbox" className="hidden" checked={startImmediately} onChange={() => setStartImmediately(!startImmediately)} />
                {startImmediately && <svg className="text-white w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="m5 13 4 4L19 7"/></svg>}
              </div>
              <span className="text-[13px] font-bold text-zinc-300">Start First Investment</span>
            </label>
          </section>

          {/* Amount Per Round */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">Amount Per Round</h3>
            <div className="relative h-14 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center px-5 group focus-within:border-white/20 transition-all">
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min. ≥ 1 USDT"
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-zinc-700 tabular-nums"
              />
              <span className="text-zinc-500 font-bold text-sm">USDT</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <span className="text-zinc-500">Available</span>
              <span className="text-white tabular-nums">{usdtBalance.toLocaleString()} USDT</span>
              <button className="text-blue-500 hover:text-blue-400 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-[13px] font-bold text-zinc-400">Advanced Settings</span>
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-8 bg-zinc-900/30 border-t border-white/5">
          <button 
            disabled={remainingAllocation !== 0 || !amount}
            onClick={onClose}
            className="w-full py-5 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-full text-sm uppercase tracking-tight shadow-2xl transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
          >
            Create Plan
          </button>
        </div>
      </div>
    </div>
  );
};

const SpotDCA: React.FC = () => {
  const { balances } = useExchangeStore();
  const [searchToken, setSearchToken] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInitialTokens, setSelectedInitialTokens] = useState<string[]>(['BTC']);
  const [hideBalances, setHideBalances] = useState(false);
  
  const [tokenRanges, setTokenRanges] = useState<Record<string, string>>({
    BTC: '5Y', ETH: '5Y', SOL: '5Y', BNB: '5Y', XRP: '5Y',
  });

  const featuredCards = [
    { title: 'Major Tokens', users: '933', roi: '-21.21%', isNegative: true, allocation: ['BTC', 'ETH', 'SOL'] },
    { title: 'POW', users: '722', roi: '-8.21%', isNegative: true, allocation: ['BTC', 'LTC', 'BCH', 'ETC'] },
    { title: 'Public chain coins', users: '609', roi: '-20.85%', isNegative: true, allocation: ['ETH', 'SOL', 'DOT', 'ADA', 'AVAX'] }
  ];

  const dcaTokens = [
    { 
      symbol: 'BTC', name: 'Bitcoin', 
      roiData: { '5Y': { val: '+48.21%', neg: false }, '3Y': { val: '+32.15%', neg: false }, '1Y': { val: '+12.44%', neg: false }, '6M': { val: '+8.10%', neg: false }, '3M': { val: '-2.11%', neg: true }, '1M': { val: '-0.85%', neg: true } }
    },
    { 
      symbol: 'ETH', name: 'Ethereum', 
      roiData: { '5Y': { val: '+38.08%', neg: false }, '3Y': { val: '+25.12%', neg: false }, '1Y': { val: '+9.30%', neg: false }, '6M': { val: '+4.20%', neg: false }, '3M': { val: '-3.45%', neg: true }, '1M': { val: '-1.12%', neg: true } }
    },
    { 
      symbol: 'SOL', name: 'Solana', 
      roiData: { '5Y': { val: '+124.5%', neg: false }, '3Y': { val: '+98.20%', neg: false }, '1Y': { val: '+45.15%', neg: false }, '6M': { val: '+22.40%', neg: false }, '3M': { val: '+10.12%', neg: false }, '1M': { val: '+5.67%', neg: false } }
    },
    { 
      symbol: 'BNB', name: 'BNB', 
      roiData: { '5Y': { val: '+12.4%', neg: false }, '3Y': { val: '+18.5%', neg: false }, '1Y': { val: '+7.82%', neg: false }, '6M': { val: '+2.10%', neg: false }, '3M': { val: '-1.50%', neg: true }, '1M': { val: '-0.25%', neg: true } }
    },
    { 
      symbol: 'XRP', name: 'Ripple', 
      roiData: { '5Y': { val: '-5.2%', neg: true }, '3Y': { val: '-12.4%', neg: true }, '1Y': { val: '-8.12%', neg: true }, '6M': { val: '-4.30%', neg: true }, '3M': { val: '+2.15%', neg: false }, '1M': { val: '+1.05%', neg: false } }
    },
  ];

  const ranges = ['5Y', '3Y', '1Y', '6M', '3M', '1M'];

  const handleRangeChange = (symbol: string, range: string) => {
    setTokenRanges(prev => ({ ...prev, [symbol]: range }));
  };

  const openCreateModal = (initial: string[]) => {
    setSelectedInitialTokens(initial);
    setModalOpen(true);
  };

  const renderIcon = (symbol: string, size: string = "w-6 h-6") => (
    <div className={`${size} rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/5`}>
      <img src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`} className="w-full h-full object-cover" alt={symbol} />
    </div>
  );

  const renderSparkline = (isNegative: boolean) => {
    const color = isNegative ? '#ff4d4f' : '#00d18e';
    return (
      <svg className="w-24 h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M0,25 Q15,10 30,20 T60,15 T100,5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M0,25 Q15,10 30,20 T60,15 T100,5 V30 H0 Z" fill={isNegative ? "rgba(255,77,79,0.1)" : "rgba(0,209,142,0.1)"} />
      </svg>
    );
  };

  return (
    <div className="bg-black min-h-screen text-white pb-32 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12">
        
        {/* Hero Section */}
        <div className="relative pt-20 pb-20 flex items-center">
          <div className="max-w-2xl text-left">
            <h1 className="text-6xl font-black mb-4 tracking-tight">Spot DCA</h1>
            <p className="text-xl text-zinc-400 font-medium mb-10">Steady growth through ups and downs</p>
            
            <div className="flex gap-12 mb-10">
              <div className="flex flex-col">
                <div className="text-zinc-500 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  My Holdings 
                  <button 
                    onClick={() => setHideBalances(!hideBalances)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
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
                <div className="text-3xl font-bold tabular-nums">{hideBalances ? '******' : '0.00'}</div>
              </div>
              <div className="flex flex-col">
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Total PNL</div>
                <div className="text-3xl font-bold tabular-nums">{hideBalances ? '******' : '0.00'}</div>
              </div>
              <div className="flex flex-col">
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Active</div>
                <div className="text-3xl font-bold tabular-nums">0</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => openCreateModal(['BTC'])}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-xl tracking-tight text-[13px]"
              >
                Create DCA Bot
              </button>
              <button className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-full hover:bg-zinc-800 transition-all tracking-tight text-[13px]">My DCA Bots</button>
            </div>
          </div>
        </div>

        {/* Featured Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {featuredCards.map((card, idx) => (
            <div key={idx} className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group text-left">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                  <div className="text-[11px] text-zinc-500 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span className="tabular-nums">{card.users}</span> Users
                  </div>
                </div>
                <button 
                  onClick={() => openCreateModal(card.allocation)}
                  className="px-5 py-2 bg-white text-black text-[13px] font-bold rounded-full hover:bg-gray-200 transition-all shadow-lg whitespace-nowrap"
                >
                  Create<span className="hidden xl:inline"> DCA Bot</span>
                </button>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className={`text-3xl font-black tracking-tighter tabular-nums ${card.isNegative ? 'text-red-500' : 'text-green-500'}`}>
                    {card.roi}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">1-Year ROI</div>
                </div>
                {renderSparkline(card.isNegative)}
              </div>

              <div className="space-y-4">
                <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">Token Allocation</div>
                <div className="flex items-center">
                  <div className="flex -space-x-1.5">
                    {card.allocation.slice(0, 3).map((sym) => (
                      <div key={sym} className="border-2 border-[#0d0d0d] rounded-full">
                        {renderIcon(sym, "w-6 h-6")}
                      </div>
                    ))}
                    {card.allocation.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold border-2 border-[#0d0d0d] text-zinc-500 tabular-nums">
                        +{card.allocation.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DCA Plans List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h2 className="text-4xl font-black tracking-tight">DCA Plans</h2>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search Token"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="bg-[#0d0d0d] border border-white/5 rounded-full py-2.5 pl-12 pr-6 text-sm font-medium w-64 focus:border-white outline-none transition-all placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-black rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#111318] text-[11px] text-zinc-500 uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-4 font-bold">Token</th>
                    <th className="px-8 py-4 font-bold text-left">Historical ROI</th>
                    <th className="px-8 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {dcaTokens.map((token) => {
                    const selectedRange = tokenRanges[token.symbol] || '5Y';
                    const activeRoi = token.roiData[selectedRange as keyof typeof token.roiData];
                    return (
                      <tr key={token.symbol} className="hover:bg-zinc-900/10 transition-all group">
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-4">
                            {renderIcon(token.symbol, "w-10 h-10")}
                            <span className="text-lg font-bold group-hover:text-white transition-colors">{token.symbol}</span>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-10">
                            <div className="flex items-center gap-2 min-w-[120px]">
                               <span className={`text-lg font-bold transition-colors tabular-nums ${activeRoi.neg ? 'text-[#ff4d4f]' : 'text-[#00d18e]'}`}>{activeRoi.val}</span>
                               <svg width="18" height="18" className={`transition-all ${activeRoi.neg ? 'text-[#ff4d4f] rotate-180' : 'text-[#00d18e]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 17l6-6 4 4 8-8"/><polyline points="14 7 21 7 21 14"/></svg>
                            </div>
                            <div className="bg-[#111318] p-1 rounded-lg flex items-center">
                              {ranges.map(r => (
                                <button key={r} onClick={(e) => { e.stopPropagation(); handleRangeChange(token.symbol, r); }} className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${selectedRange === r ? 'bg-[#1e222d] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>{r}</button>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7 text-right">
                          <button 
                            onClick={() => openCreateModal([token.symbol])}
                            className="px-8 py-2.5 bg-white text-black text-[13px] font-bold rounded-full hover:bg-gray-200 transition-all shadow-xl"
                          >
                            Create DCA Bot
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && <CreatePlanModal initialTokens={selectedInitialTokens} onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default SpotDCA;
