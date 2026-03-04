
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useExchangeStore } from '../store';
import { walletService } from '../services/walletService';

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
  const { balances, deposit, depositHistory, isDepositModalOpen: showDepositFlow, setDepositModalOpen: setShowDepositFlow, addNotification } = useExchangeStore();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeFeeGroup, setActiveFeeGroup] = useState('Group 1');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [depositStep, setDepositStep] = useState(1);
  const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  
  // History Filters
  const [historyCrypto, setHistoryCrypto] = useState('All');
  const [historyType, setHistoryType] = useState('All');
  const [historyDateRange, setHistoryDateRange] = useState('Last 30 days');
  const [historyCryptoSearch, setHistoryCryptoSearch] = useState('');

  const [isHistoryCryptoOpen, setIsHistoryCryptoOpen] = useState(false);
  const [isHistoryTypeOpen, setIsHistoryTypeOpen] = useState(false);
  const [isHistoryDateOpen, setIsHistoryDateOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const networkDropdownRef = useRef<HTMLDivElement>(null);
  const historyDateRef = useRef<HTMLDivElement>(null);
  const historyCryptoRef = useRef<HTMLDivElement>(null);
  const historyTypeRef = useRef<HTMLDivElement>(null);
  
  const totalBalanceUSD = balances.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65000;
  const totalInBTC = totalBalanceUSD / btcPrice;

  const pnlAmount = totalBalanceUSD * 0.0245; 
  const pnlPercentage = 2.45;

  const currentAssetNetworks = ASSET_NETWORKS[selectedAsset] || DEFAULT_NETWORKS;
  const activeNetwork = currentAssetNetworks.find(n => n.id === selectedNetwork);

  useEffect(() => {
    if (showDepositFlow) {
      setActiveTab('Deposit');
      setShowDepositFlow(false);
    }
  }, [showDepositFlow, setShowDepositFlow]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target as Node)) {
        setIsNetworkDropdownOpen(false);
      }
      if (historyDateRef.current && !historyDateRef.current.contains(event.target as Node)) {
        setIsHistoryDateOpen(false);
      }
      if (historyCryptoRef.current && !historyCryptoRef.current.contains(event.target as Node)) {
        setIsHistoryCryptoOpen(false);
      }
      if (historyTypeRef.current && !historyTypeRef.current.contains(event.target as Node)) {
        setIsHistoryTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [assetSearch, hideSmallBalances, activeTab]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (activeTab === 'Deposit' && selectedAsset && selectedNetwork) {
        setIsGeneratingAddress(true);
        try {
          // In a real app, the index would come from the user's profile in Supabase
          const mockUserIndex = 105; 
          const result = await walletService.generateAddress(selectedAsset, selectedNetwork, mockUserIndex);
          setCurrentAddress(result.address);
        } catch (error) {
          console.error("Failed to generate address:", error);
        } finally {
          setIsGeneratingAddress(false);
        }
      }
    };
    fetchAddress();
  }, [selectedAsset, selectedNetwork, activeTab]);

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

  const renderDeposit = () => {
    const renderStepIndicator = (step: number, label: string) => {
      const isCompleted = depositStep > step;
      const isActive = depositStep === step;
      
      return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
          isCompleted ? 'bg-brand text-white' : (isActive ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500')
        }`}>
          {isCompleted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m20 6-11 11-5-5"/></svg>
          ) : (
            <span>{label}</span>
          )}
        </div>
      );
    };

    const handleCopyAddress = (address: string) => {
      navigator.clipboard.writeText(address);
      addNotification({
        title: 'Address Copied',
        message: 'Deposit address has been copied to your clipboard.',
        type: 'success'
      });
    };

    return (
      <div className="animate-in fade-in duration-500 space-y-12">
        {/* Deposit Title & Back Button */}
        <div className="flex items-center gap-5 mb-4">
          <button 
            onClick={() => setActiveTab('Overview')}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-zinc-400 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Deposit</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Form */}
          <div className="flex-1 space-y-12">
            {/* Step 1: Select Crypto */}
            <section className="text-left relative">
              <div className="flex items-center gap-4 mb-6">
                {renderStepIndicator(1, "1")}
                <h3 className="text-lg font-bold tracking-tight">Select Crypto</h3>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)} 
                  className={`bg-zinc-900/40 border rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all group ${isAssetDropdownOpen ? 'border-white' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                    {renderCryptoIcon(selectedAsset, "w-8 h-8")}
                    <div>
                      <div className="text-sm font-bold text-white">{selectedAsset} <span className="text-zinc-500 font-medium ml-1 text-xs">{balances.find(b => b.symbol === selectedAsset)?.name}</span></div>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-all ${isAssetDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                </div>

                {isAssetDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 py-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="px-5 mb-4">
                      <div className="text-[10px] font-bold text-zinc-500 mb-3">Hot Crypto</div>
                      <div className="flex flex-wrap gap-2">
                        {['BNB', 'USDT', 'BTC', 'ETH', 'TRX'].map(sym => (
                          <button 
                            key={sym}
                            onClick={(e) => { 
                              e.stopPropagation();
                              setSelectedAsset(sym); 
                              setIsAssetDropdownOpen(false); 
                              setSelectedNetwork(null);
                              setDepositStep(2);
                            }}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[11px] font-bold text-white transition-colors"
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="px-5 mb-2">
                      <div className="text-[10px] font-bold text-zinc-500 mb-3">Crypto</div>
                    </div>
                    
                    {balances.map(asset => (
                      <div 
                        key={asset.symbol}
                        onClick={() => { 
                          setSelectedAsset(asset.symbol); 
                          setIsAssetDropdownOpen(false); 
                          setSelectedNetwork(null);
                          setDepositStep(2);
                        }}
                        className="px-5 py-2.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        {renderCryptoIcon(asset.symbol, "w-6 h-6")}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{asset.symbol}</span>
                          <span className="text-xs text-zinc-500 font-medium">{asset.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Step 2: Network */}
            <section className={`text-left relative transition-opacity duration-300 ${depositStep < 2 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center gap-4 mb-6">
                {renderStepIndicator(2, "2")}
                <h3 className="text-lg font-bold tracking-tight">Network</h3>
              </div>

              <div className="relative" ref={networkDropdownRef}>
                <div 
                  onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)} 
                  className={`bg-zinc-900/40 border rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all group ${isNetworkDropdownOpen ? 'border-white' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>
                      {activeNetwork ? (
                        <div className="text-sm font-bold text-white">{activeNetwork.name} <span className="text-zinc-500 font-medium ml-1 text-xs">{activeNetwork.fullName}</span></div>
                      ) : (
                        <div className="text-sm font-bold text-zinc-500">Select desired network</div>
                      )}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-all ${isNetworkDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                </div>

                {isNetworkDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                    {currentAssetNetworks.map(network => (
                      <div 
                        key={network.id}
                        onClick={() => { 
                          setSelectedNetwork(network.id); 
                          setIsNetworkDropdownOpen(false); 
                          setDepositStep(Math.max(depositStep, 3));
                        }}
                        className="px-5 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{network.name}</span>
                          <span className="text-xs text-zinc-500 font-medium">{network.fullName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Step 3: Deposit Address */}
            <section className={`text-left relative transition-opacity duration-300 ${depositStep < 3 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {renderStepIndicator(3, "3")}
                  <h3 className="text-lg font-bold tracking-tight">Deposit Address</h3>
                </div>
                <button className="text-[11px] font-bold text-zinc-500 hover:text-white transition-all flex items-center gap-1">
                  Manage Addresses <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>

              <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {isGeneratingAddress && (
                  <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                    <div className="w-10 h-10 border-2 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                    <div className="text-[11px] font-bold text-zinc-400 tracking-tight">Generating unique {selectedAsset} address...</div>
                  </div>
                )}
                <div className="w-32 h-32 bg-white p-2 rounded-xl shrink-0">
                  {currentAddress ? (
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentAddress}`} alt="QR Code" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="7" height="7" x="7" y="7" rx="1"/></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="text-[11px] font-bold text-zinc-500 mb-2">{activeNetwork?.fullName} Address</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3.5 font-mono text-sm text-white flex items-center justify-between group">
                      <span className="truncate">{currentAddress}</span>
                      <svg 
                        className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-all cursor-pointer" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                        onClick={() => handleCopyAddress(currentAddress)}
                      >
                        <path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2Z"/>
                        <path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/>
                      </svg>
                    </div>
                    <button 
                      onClick={() => handleCopyAddress(currentAddress)}
                      className="px-6 py-3.5 bg-brand text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-brand/20"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[11px] font-bold text-zinc-500">Security verification of deposit address</span>
                  <button className="text-[11px] font-bold text-white hover:underline flex items-center gap-1">Verify <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[11px] font-bold text-zinc-500">Minimum deposit amount</span>
                  <span className="text-[11px] font-bold text-white">0.01 {selectedAsset}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[11px] font-bold text-zinc-500">Deposit Account</span>
                  <button className="text-[11px] font-bold text-white flex items-center gap-2">
                    Spot Account <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m17 2 4 4-4 4M3 18l4-4 4 4M21 6H9M3 18h12"/></svg>
                  </button>
                </div>
              </div>

              <button className="w-full mt-6 py-2 text-[11px] font-bold text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-2">
                Details <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </section>
          </div>

          {/* Right Column: Tips & FAQ */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 text-left">
              <h4 className="text-base font-bold mb-6">Tips</h4>
              <ul className="space-y-6 text-[11px] text-zinc-500 leading-relaxed font-medium">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0"></span>
                  Deposits made via smart contracts may not be credited. Please deposit from a standard wallet address.
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0"></span>
                  Lintex does not support users receiving airdrops. To avoid potential asset loss, please do not use your Lintex deposit address to receive airdrops or as a mining address.
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0"></span>
                  This address only supports deposit of {selectedAsset} assets. Do not deposit other assets to this address as the assets will not be credited or recoverable.
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0"></span>
                  Please note: If the single deposit amount is less than the minimum deposit amount, it will not be credited. The platform will not be liable for any loss of assets resulting from this. Thank you for your understanding and support!
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0"></span>
                  Do not trade with high-risk platforms. <span className="text-brand hover:underline cursor-pointer">Learn More</span>
                </li>
              </ul>
            </div>

            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 text-left">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold">Deposit FAQ</h4>
                <button className="text-[10px] font-bold text-zinc-500 hover:text-white transition-all flex items-center gap-1">View More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
              <ul className="space-y-4 text-[12px] font-bold text-zinc-400">
                <li className="hover:text-white cursor-pointer transition-colors">How to Deposit on Lintex?</li>
                <li className="hover:text-white cursor-pointer transition-colors">Have an uncredited deposit? Apply for return</li>
                <li className="hover:text-white cursor-pointer transition-colors">View all deposit & withdrawal status</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Deposits */}
        <div className="pt-12 border-t border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight">Recent Deposits</h2>
              <button 
                onClick={async () => {
                  addNotification({ title: 'Sweeper Started', message: 'Scanning for new deposits...', type: 'info' });
                  const result = await walletService.sweepAddress(currentAddress);
                  if (result.success) {
                    addNotification({ title: 'Funds Found!', message: `Swept to Hot Wallet. Tx: ${result.txHash?.slice(0, 10)}...`, type: 'success' });
                  } else {
                    addNotification({ title: 'Scan Complete', message: 'No new funds found on this address.', type: 'info' });
                  }
                }}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                Scan & Sweep
              </button>
            </div>
            <button 
              onClick={() => setActiveTab('Funding history')}
              className="text-[11px] font-bold text-zinc-500 hover:text-white transition-all flex items-center gap-1"
            >
              History <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900/30 text-[12px] font-bold text-zinc-500 border-b border-white/5">
                    <th className="px-8 py-5">Crypto</th>
                    <th className="px-8 py-5">Network</th>
                    <th className="px-8 py-5">Time</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">TxID</th>
                    <th className="px-8 py-5">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {depositHistory.length > 0 ? (
                    depositHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            {renderCryptoIcon(record.crypto, "w-6 h-6")}
                            <span className="font-bold text-sm">{record.crypto}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{record.network}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">BNB Smart Chain(...</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-primary font-medium text-zinc-400">{record.time}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-1.5 text-[#00d18e] font-bold text-sm">
                            Deposit successful
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-primary font-bold text-white">{record.amount}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <span className="text-sm font-mono">{record.txId}</span>
                            <svg className="w-3.5 h-3.5 hover:text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                            <svg className="w-3.5 h-3.5 hover:text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-primary font-bold text-white">{record.progress}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6 border border-white/5">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/><path d="M9 13h6"/><path d="M9 17h3"/></svg>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">No records found</h3>
                          <p className="text-zinc-500 text-sm max-w-xs">You haven't made any deposits yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6 mb-12">
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.015] blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-[10px] mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Total Assets Value</span>
              </div>
              <div className="flex flex-col sm:flex-row items-baseline gap-4 mb-4">
                <span className="text-2xl md:text-4xl font-primary font-medium tracking-tighter text-white">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-base md:text-lg font-primary font-medium text-zinc-500 tracking-tight">≈ {totalInBTC.toFixed(6)} BTC</span>
              </div>
              
              <div className="flex items-center gap-3 text-[13px] font-semibold">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                  <span className="text-zinc-500 font-medium">Today's PNL:</span>
                  <span className={`${pnlAmount >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'} flex items-center gap-1 font-primary`}>
                    {pnlAmount >= 0 ? '+' : ''}${Math.abs(pnlAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-[11px] opacity-80">
                      ({pnlAmount >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setShowDepositFlow(true)} className="flex-1 md:flex-none px-8 py-3.5 apr-badge-glow text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all shadow-lg text-xs">Deposit</button>
              <button className="flex-1 md:flex-none px-8 py-3.5 bg-zinc-900 text-white font-bold rounded-full border border-white/10 hover:bg-zinc-800 transition-all text-xs">Withdraw</button>
            </div>
          </div>
        </div>
      </div>

      {totalBalanceUSD === 0 && (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-xl font-bold tracking-tight mb-6 text-left">Suggestions for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900/50 transition-all cursor-pointer group relative overflow-hidden">
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 group-hover:text-white transition-colors">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <circle cx="12" cy="10" r="3"/><path d="M12 7v6"/>
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-zinc-500 mb-1 block">New user</span>
                  <h3 className="text-lg font-bold text-white mb-4 leading-tight">How do I make a deposit?</h3>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                    View more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] transition-all"></div>
            </div>

            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 hover:bg-zinc-900/50 transition-all cursor-pointer group relative overflow-hidden">
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 group-hover:text-white transition-colors">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    <path d="M12 2v2M12 18v2M2 12h2M20 12h2"/>
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-zinc-500 mb-1 block">New user</span>
                  <h3 className="text-lg font-bold text-white mb-4 leading-tight">Where is the address and tag/memo?</h3>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                    View more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] transition-all"></div>
            </div>
          </div>
        </div>
      )}

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
            <thead className="text-[12px] text-gray-600 font-medium border-b border-white/5">
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
                      <span className="font-primary text-xs text-white">{asset.balance.toLocaleString(undefined, { minimumFractionDigits: 4 })}</span>
                      <span className="text-[10px] text-gray-500 font-primary font-medium mt-0.5">${(asset.balance * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-primary text-xs text-zinc-500">{(asset.balance - asset.available).toLocaleString(undefined, { minimumFractionDigits: 4 })}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-primary text-xs text-white">{asset.available.toLocaleString(undefined, { minimumFractionDigits: 4 })}</span>
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

  const renderHistory = () => {
    const filteredHistory = depositHistory.filter(record => {
      if (historyCrypto !== 'All' && record.crypto !== historyCrypto) return false;
      // In a real app, we'd filter by type and date here
      return true;
    });

    return (
      <div className="animate-in fade-in duration-700 space-y-8 text-left">
        <div className="flex flex-col gap-8">
          {/* Filters Section */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500">Date</label>
              <div className="relative" ref={historyDateRef}>
                <button 
                  onClick={() => setIsHistoryDateOpen(!isHistoryDateOpen)}
                  className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3 min-w-[200px] hover:border-white/20 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <span className="text-sm font-medium text-white">{historyDateRange}</span>
                  <svg className={`w-4 h-4 text-zinc-600 ml-auto transition-all ${isHistoryDateOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {isHistoryDateOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                    {['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'].map(range => (
                      <div 
                        key={range}
                        onClick={() => { setHistoryDateRange(range); setIsHistoryDateOpen(false); }}
                        className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                      >
                        {range}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Crypto Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500">Crypto</label>
              <div className="relative" ref={historyCryptoRef}>
                <button 
                  onClick={() => {
                    setIsHistoryCryptoOpen(!isHistoryCryptoOpen);
                    setHistoryCryptoSearch('');
                  }}
                  className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3 min-w-[220px] hover:border-white/20 transition-all"
                >
                  <span className="text-sm font-medium text-white">{historyCrypto}</span>
                  <svg className={`w-4 h-4 text-zinc-600 ml-auto transition-all ${isHistoryCryptoOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {isHistoryCryptoOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2 overflow-hidden">
                    <div className="px-3 pb-2 pt-1 border-b border-white/5 mb-1">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/></svg>
                        <input 
                          type="text"
                          placeholder="Search crypto..."
                          value={historyCryptoSearch}
                          onChange={(e) => setHistoryCryptoSearch(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {historyCryptoSearch === '' && (
                        <div 
                          onClick={() => { setHistoryCrypto('All'); setIsHistoryCryptoOpen(false); }}
                          className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                          All
                        </div>
                      )}
                      {balances
                        .filter(asset => asset.symbol.toLowerCase().includes(historyCryptoSearch.toLowerCase()))
                        .map(asset => (
                          <div 
                            key={asset.symbol}
                            onClick={() => { setHistoryCrypto(asset.symbol); setIsHistoryCryptoOpen(false); }}
                            className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                          >
                            {asset.symbol}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500">Type</label>
              <div className="relative" ref={historyTypeRef}>
                <button 
                  onClick={() => setIsHistoryTypeOpen(!isHistoryTypeOpen)}
                  className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3 min-w-[220px] hover:border-white/20 transition-all"
                >
                  <span className="text-sm font-medium text-white">{historyType}</span>
                  <svg className={`w-4 h-4 text-zinc-600 ml-auto transition-all ${isHistoryTypeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {isHistoryTypeOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                    {['All', 'Deposit', 'Withdrawal', 'Internal Transfer'].map(type => (
                      <div 
                        key={type}
                        onClick={() => { setHistoryType(type); setIsHistoryTypeOpen(false); }}
                        className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ml-auto">
              <button 
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-all group shadow-lg shadow-black/20"
                title="Download full history including records beyond 90 days"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Download
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/30 text-[12px] font-bold text-zinc-500 border-b border-white/5">
                  <th className="pl-8 pr-4 py-5">Time</th>
                  <th className="px-4 py-5">Asset</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="pl-8 pr-4 py-6 text-sm font-primary font-medium text-zinc-400">{record.time}</td>
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-3">
                          {renderCryptoIcon(record.crypto, "w-6 h-6")}
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{record.crypto}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{record.network}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-medium text-white">Deposit</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-primary font-bold text-white">{record.amount}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-[#00d18e] font-bold text-sm">
                          {record.status === 'success' ? 'Completed' : record.status}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-[11px] font-bold text-zinc-500 hover:text-white transition-colors">Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6 border border-white/5">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/><path d="M9 13h6"/><path d="M9 17h3"/></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No records found</h3>
                        <p className="text-zinc-500 text-sm max-w-xs">Try adjusting your filters to find what you're looking for.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[12px] font-medium text-zinc-500 mt-4">
          You can view your order history from the last 90 days, or download to view all your history
        </p>
      </div>
    );
  };

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
                <div className="text-[11px] font-bold text-zinc-500 mb-1.5">Maker fee</div>
                <div className="text-2xl font-primary font-bold text-white tracking-tight">0.2000%</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-500 mb-1.5">Taker fee</div>
                <div className="text-2xl font-primary font-bold text-white tracking-tight">0.3500%</div>
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
          <span className="text-xl font-primary font-bold text-white">10,000,000 USD</span>
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
          <div className="text-sm font-bold text-zinc-500 px-2">Regular users</div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900/30 text-[12px] font-bold text-zinc-500 border-b border-zinc-900">
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
                      <span className="w-2 h-2 rounded-full bg-brand"></span>
                      <span className="text-sm font-bold text-white">Regular user</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-primary font-medium text-zinc-300">0 - 100,000</td>
                    <td className="px-4 py-6 text-center text-zinc-600">/</td>
                    <td className="px-8 py-6 text-sm font-primary font-medium text-zinc-300">0 - 100,000</td>
                    <td className="px-8 py-6 text-sm font-primary font-bold text-white">0.2000%</td>
                    <td className="px-8 py-6 text-sm font-primary font-bold text-white">0.3500%</td>
                    <td className="px-8 py-6 text-sm font-primary font-bold text-white text-right">10,000,000</td>
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
          {['Overview', 'Spot', 'Fees', 'Funding history'].map((tab) => (
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
        {activeTab === 'Deposit' && renderDeposit()}
        {activeTab === 'Funding history' && renderHistory()}
        {activeTab === 'Fees' && renderFees()}
        
        {!['Overview', 'Deposit', 'Fees', 'Funding history'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700">
             <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7-7-7M5 12h14"/></svg>
             </div>
             <h3 className="text-2xl font-bold mb-2">{activeTab}</h3>
             <p className="text-zinc-500 text-sm max-w-xs">This section is currently under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assets;
