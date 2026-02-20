
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useExchangeStore } from '../store';

const DEFAULT_NETWORKS = [
  { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' },
  { id: 'eth', name: 'ETH', fullName: 'Ethereum(ERC20)' }
];

const ASSET_NETWORKS: Record<string, { id: string; name: string; fullName: string }[]> = {
  'USDT': [
    { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' },
    { id: 'eth', name: 'ETH', fullName: 'Ethereum(ERC20)' },
    { id: 'tron', name: 'TRX', fullName: 'Tron(TRC20)' },
    { id: 'sol', name: 'SOL', fullName: 'Solana' }
  ],
  'BTC': [
    { id: 'btc', name: 'BTC', fullName: 'Bitcoin' },
    { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' }
  ],
  'ETH': [
    { id: 'eth', name: 'ETH', fullName: 'Ethereum(ERC20)' },
    { id: 'arb', name: 'Arbitrum', fullName: 'Arbitrum One' },
    { id: 'opt', name: 'Optimism', fullName: 'OP Mainnet' }
  ],
  'TRX': [
    { id: 'tron', name: 'TRX', fullName: 'Tron(TRC20)' }
  ],
  'SOL': [
    { id: 'sol', name: 'SOL', fullName: 'Solana' }
  ],
  'BNB': [
    { id: 'bsc', name: 'BSC', fullName: 'BNB Smart Chain(BEP20)' }
  ]
};

const Assets: React.FC = () => {
  const { balances, deposit, isDepositModalOpen: showDepositFlow, setDepositModalOpen: setShowDepositFlow } = useExchangeStore();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeFeeGroup, setActiveFeeGroup] = useState('Group 1');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const totalBalanceUSD = balances.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65000;
  const totalInBTC = totalBalanceUSD / btcPrice;

  const pnlAmount = totalBalanceUSD * 0.0245; 
  const pnlPercentage = 2.45;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [assetSearch, hideSmallBalances, activeTab]);

  const filteredBalances = useMemo(() => {
    let result = balances.filter(asset => 
      asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
      asset.name.toLowerCase().includes(assetSearch.toLowerCase())
    );

    if (hideSmallBalances) {
      result = result.filter(asset => (asset.balance * asset.price) >= 1);
    }

    return [...result].sort((a, b) => {
      const aVal = a.balance > 0 ? 1 : 0;
      const bVal = b.balance > 0 ? 1 : 0;
      return bVal - aVal;
    });
  }, [balances, hideSmallBalances, assetSearch]);

  const totalPages = Math.ceil(filteredBalances.length / itemsPerPage);
  const paginatedBalances = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBalances.slice(start, start + itemsPerPage);
  }, [filteredBalances, currentPage]);

  const renderCryptoIcon = (symbol: string, sizeClass: string = "w-9 h-9") => (
    <div className={`${sizeClass} rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-[11px] text-gray-500 overflow-hidden relative`}>
      <img 
        src={`https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`} 
        alt={symbol}
        className="w-full h-full object-cover relative z-10"
        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
      />
    </div>
  );

  const renderOverview = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6 mb-12">
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.015] blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-[10px] uppercase tracking-widest mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Total Assets Value</span>
              </div>
              <div className="flex flex-col sm:flex-row items-baseline gap-4 mb-4">
                <span className="text-2xl md:text-4xl font-medium tracking-tighter text-white">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-base md:text-lg font-medium text-zinc-500 tracking-tight">≈ {totalInBTC.toFixed(6)} BTC</span>
              </div>
              
              <div className="flex items-center gap-3 text-[13px] font-semibold">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                  <span className="text-zinc-500 font-medium">Today's PNL:</span>
                  <span className={`${pnlAmount >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'} flex items-center gap-1`}>
                    {pnlAmount >= 0 ? '+' : ''}${Math.abs(pnlAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-[11px] opacity-80">
                      ({pnlAmount >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setShowDepositFlow(true)} className="flex-1 md:flex-none px-8 py-3.5 apr-badge-glow text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all shadow-lg text-xs uppercase tracking-widest">Deposit</button>
              <button className="flex-1 md:flex-none px-8 py-3.5 bg-zinc-900 text-white font-bold rounded-full border border-white/10 hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest">Withdraw</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight">My Assets</h2>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 ml-auto">
             <input 
                type="text" 
                placeholder="Search coins"
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="bg-zinc-900 border border-white/5 rounded-lg py-1.5 pl-3 pr-3 text-[11px] font-medium w-36 outline-none text-white"
              />
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[10px] text-gray-600 font-medium uppercase border-b border-white/5">
              <tr>
                <th className="px-8 py-4">Asset</th>
                <th className="px-8 py-4">Total Balance</th>
                <th className="px-8 py-4">Frozen</th>
                <th className="px-8 py-4">Available</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedBalances.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-8 py-5 flex items-center gap-4">
                    {renderCryptoIcon(asset.symbol)}
                    <div className="text-left">
                      <div className="font-semibold text-sm">{asset.symbol}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{asset.name}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-white">{asset.balance.toLocaleString(undefined, { minimumFractionDigits: 4 })}</span>
                      <span className="text-[10px] text-gray-500 font-medium mt-0.5">${(asset.balance * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs text-zinc-500">{(asset.balance - asset.available).toLocaleString(undefined, { minimumFractionDigits: 4 })}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs text-white">{asset.available.toLocaleString(undefined, { minimumFractionDigits: 4 })}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="px-6 py-1.5 bg-white text-black text-[13px] font-bold rounded-full hover:bg-zinc-200 transition-all shadow-lg">Trade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFees = () => (
    <div className="animate-in fade-in duration-700 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-900 pb-10 text-left">
        <div>
          <div className="text-zinc-500 text-[13px] font-medium mb-3">My fee tier</div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-2">Regular user</h1>
        </div>
        <button className="text-[13px] font-bold text-zinc-400 hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700">
          Compare rates
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {[1, 2, 3].map((group) => (
          <div key={group} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-8 relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Spot - Group {group}</span>
                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Maker fee</div>
                <div className="text-2xl font-bold text-white tracking-tight">0.2000%</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Taker fee</div>
                <div className="text-2xl font-bold text-white tracking-tight">0.3500%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 flex items-center justify-center gap-6">
        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v13m0-13 4 4m-4-4-4 4M4 21h16"/></svg>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
          <span className="text-[13px] font-bold text-zinc-500">24-hour withdrawal limit</span>
          <span className="text-xl font-bold text-white">10,000,000 USD</span>
        </div>
      </div>

      <div className="space-y-6 pt-10 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Fee table</h2>
          <button className="text-[13px] font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-2">
            Learn more about fee tiers <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m9 5 7 7-7 7"/></svg>
          </button>
        </div>

        <div className="flex gap-1 bg-zinc-950/40 p-1 border border-zinc-900 rounded-xl w-fit">
          {['Group 1', 'Group 2', 'Group 3', 'Zero-fee pairs'].map((group) => (
            <button 
              key={group}
              onClick={() => setActiveFeeGroup(group)}
              className={`px-5 py-2 text-[12px] font-bold rounded-lg transition-all ${activeFeeGroup === group ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="text-sm font-bold text-zinc-500 px-2 uppercase tracking-widest">Regular users</div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900/30 text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-900 tracking-wider">
                    <th className="px-8 py-5">Tier</th>
                    <th className="px-8 py-5">Assets (USD)</th>
                    <th className="px-4 py-5 text-center">or</th>
                    <th className="px-8 py-5">30-day trading volume (USD)</th>
                    <th className="px-8 py-5">Maker fee</th>
                    <th className="px-8 py-5">Taker fee</th>
                    <th className="px-8 py-5 text-right whitespace-nowrap">24h crypto withdrawal limit (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  <tr className="bg-white/[0.02]">
                    <td className="px-8 py-6 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-bold text-white">Regular user</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-zinc-300">0 - 100,000</td>
                    <td className="px-4 py-6 text-center text-zinc-600">/</td>
                    <td className="px-8 py-6 text-sm font-medium text-zinc-300">0 - 100,000</td>
                    <td className="px-8 py-6 text-sm font-bold text-white">0.2000%</td>
                    <td className="px-8 py-6 text-sm font-bold text-white">0.3500%</td>
                    <td className="px-8 py-6 text-sm font-bold text-white text-right">10,000,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10 overflow-x-hidden">
      <div className="bg-[#0a0a0a] border-b border-zinc-900 px-8 sticky top-0 z-[45] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {['Overview', 'Spot', 'Fees'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap tracking-tight ${
                activeTab === tab 
                  ? 'border-white text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-10">
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Fees' && renderFees()}
        
        {!['Overview', 'Fees'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700">
             <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7-7-7M5 12h14"/></svg>
             </div>
             <h3 className="text-2xl font-bold mb-2">{activeTab}</h3>
             <p className="text-zinc-500 text-sm max-w-xs">This section is currently under development.</p>
          </div>
        )}
      </div>

      {showDepositFlow && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-right duration-300">
          <header className="h-20 border-b border-white/5 flex items-center px-8 gap-6 justify-between shrink-0">
            <div className="flex items-center gap-6">
              <button onClick={() => setShowDepositFlow(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <h2 className="text-3xl font-bold tracking-tight">Deposit</h2>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-16 custom-scrollbar">
               <div className="max-w-7xl mx-auto flex flex-col gap-16">
                 <div className="flex flex-col lg:flex-row gap-16">
                   <div className="flex-1 space-y-16">
                      <section className="text-left">
                        <h3 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3"><span className="hidden sm:inline text-zinc-500 text-sm">01</span> Select Crypto</h3>
                        <div className="relative" ref={dropdownRef}>
                          <div onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)} className={`bg-zinc-900/40 border rounded-xl p-6 flex items-center justify-between cursor-pointer transition-all group ${isAssetDropdownOpen ? 'border-white' : 'border-white/5 hover:border-white/20'}`}>
                            <div className="flex items-center gap-5">
                               {renderCryptoIcon(selectedAsset, "w-11 h-11")}
                               <div>
                                 <div className="text-base font-bold text-white">{selectedAsset}</div>
                                 <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Select Crypto</div>
                               </div>
                            </div>
                            <svg className={`w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-all ${isAssetDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                      </section>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
