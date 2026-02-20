
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useExchangeStore, TIER_DATA, ReferralTier } from '../store';

interface ReferralProps {
  isAffiliate?: boolean;
}

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export default function Referral({ isAffiliate = false }: ReferralProps) {
  const { referralCode, referralCount, referralVolume, earnings, getTier, balances } = useExchangeStore();
  const currentTier = getTier();
  
  // Hero cards exclude Rookie as it's the default starting state
  const tiers: ReferralTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const goalsRef = useRef<HTMLDivElement>(null);

  // My Invites Tab State
  const [invitesTab, setInvitesTab] = useState('Invitation Overview');
  const [commissionFilter, setCommissionFilter] = useState('All');

  // Brand Gradient style
  const brandGradient = 'linear-gradient(90deg, #605cf4, #a855f7, #ec4899)';
  const numberGradientStyle = {
    background: brandGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  // Logic for next tier goals
  const nextTierData = useMemo(() => {
    const currentIndex = tiers.indexOf(currentTier === 'Rookie' ? 'Bronze' : currentTier);
    
    // Special case for Rookie -> Bronze
    if (currentTier === 'Rookie') {
      const nextTier = 'Bronze';
      const data = TIER_DATA[nextTier];
      const refsNeeded = Math.max(0, data.requirement - referralCount);
      const volNeeded = Math.max(0, data.volRequirement - referralVolume);
      const goalsCount = (refsNeeded > 0 ? 1 : 0) + (volNeeded > 0 ? 1 : 0);
      return { name: nextTier, refsNeeded, volNeeded, totalRefs: data.requirement, totalVol: data.volRequirement, currentRefs: referralCount, currentVol: referralVolume, goalsCount };
    }

    const tierList: ReferralTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const actualIdx = tierList.indexOf(currentTier);
    if (actualIdx === -1 || actualIdx >= tierList.length - 1) return null;
    
    const nextTier = tierList[actualIdx + 1];
    const data = TIER_DATA[nextTier];
    const refsNeeded = Math.max(0, data.requirement - referralCount);
    const volNeeded = Math.max(0, data.volRequirement - referralVolume);
    const goalsCount = (refsNeeded > 0 ? 1 : 0) + (volNeeded > 0 ? 1 : 0);

    return { name: nextTier, refsNeeded, volNeeded, totalRefs: data.requirement, totalVol: data.volRequirement, currentRefs: referralCount, currentVol: referralVolume, goalsCount };
  }, [currentTier, referralCount, referralVolume]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied!`);
  };

  const fullRefLink = `https://lintex.exchange/ref/${referralCode}`;

  const faqItems: FAQItem[] = [
    {
      question: "What's in it for my friends?",
      answer: <span>Your friends will be in for the chance to earn up to 200 USD in <span className="underline underline-offset-4 cursor-pointer hover:text-white transition-colors">welcome rewards</span> once they complete their tasks.</span>
    },
    {
      question: "When will I receive my reward?",
      answer: "Once your friends complete their tasks, your rewards will be deposited into your account and put on hold. You'll be able to use, trade, and withdraw your rewards after your friends maintain a daily average portfolio balance of 200 USD for any 30 days out of a 90-day period."
    },
    {
      question: "How is my reward amount determined?",
      answer: "Your reward amount refreshes every two weeks. Reward amounts are adjusted based on market conditions and can differ between inviters."
    },
    {
      question: "Where can I view my reward amount?",
      answer: "You can view your reward amount in your invite history."
    },
    {
      question: "Why haven't I received my reward?",
      answer: "You can only earn 10 referral rewards every two weeks. If you've invited more than 10 friends, you won't receive additional rewards. If you invited a friend and they engaged in dishonest or abusive behavior, you may not get your reward."
    },
    {
      question: "What do my friends need to do for me to get rewarded?",
      answer: (
        <div className="space-y-4">
          <p className="mb-4">Your friends need to complete their specified task for you to be eligible to receive your rewards.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <div className="font-bold text-[14px] text-white mb-2">Deposit</div>
                <div className="text-xs text-zinc-500 leading-relaxed">Cumulative net deposit of at least 100 USDT.</div>
             </div>
             <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <div className="font-bold text-[14px] text-white mb-2">Trade</div>
                <div className="text-xs text-zinc-500 leading-relaxed">Complete at least one Spot or Futures trade.</div>
             </div>
          </div>
        </div>
      )
    }
  ];

  // Table rendering helpers
  const renderHistoryTable = () => (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left min-w-[1000px]">
        <thead>
          <tr className="text-zinc-500 text-[12px] font-bold tracking-tight border-b border-white/5">
            <th className="px-6 py-4 font-medium">Friend's Account</th>
            <th className="px-6 py-4 font-medium">Friend's UID</th>
            <th className="px-6 py-4 font-medium">Invitation Time</th>
            <th className="px-6 py-4 font-medium">Referral Days</th>
            <th className="px-6 py-4 font-medium">Total (USDT)</th>
            <th className="px-6 py-4 font-medium">Spot (USDT)</th>
            <th className="px-6 py-4 font-medium">Futures (USDT)</th>
            <th className="px-6 py-4 font-medium">DEX+ Commission (USDT)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          <tr className="hover:bg-white/[0.02] transition-colors">
            <td className="px-6 py-5 text-sm font-bold text-zinc-200">qu****3@**.me</td>
            <td className="px-6 py-5 text-sm font-bold text-zinc-400">16023231</td>
            <td className="px-6 py-5 text-sm font-bold text-zinc-400">2026-02-18 11:32:36</td>
            <td className="px-6 py-5 text-sm font-bold text-zinc-500">--</td>
            <td className="px-6 py-5 text-sm font-black text-white tabular-nums">0</td>
            <td className="px-6 py-5 text-sm font-black text-white tabular-nums">0</td>
            <td className="px-6 py-5 text-sm font-black text-white tabular-nums">0</td>
            <td className="px-6 py-5 text-sm font-black text-white tabular-nums">0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderCommissionTable = () => (
    <div className="w-full flex flex-col">
      {/* Sub filters */}
      <div className="flex gap-2 mb-6 px-6">
        {['All', 'Spot', 'Futures', 'DEX+'].map(f => (
          <button
            key={f}
            onClick={() => setCommissionFilter(f)}
            className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all ${commissionFilter === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {f}
          </button>
        ))}
      </div>
      
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="text-zinc-500 text-[12px] font-bold tracking-tight border-b border-white/5">
              <th className="px-6 py-4 font-medium">Friend's Account</th>
              <th className="px-6 py-4 font-medium">Friend's UID</th>
              <th className="px-6 py-4 font-medium">Trading Date</th>
              <th className="px-6 py-4 font-medium">Commission Time</th>
              <th className="px-6 py-4 font-medium">Account Type</th>
              <th className="px-6 py-4 font-medium">Commission Rate</th>
              <th className="px-6 py-4 font-medium">Commission Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="py-24 text-center">
                 <div className="flex flex-col items-center justify-center opacity-40">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span className="text-xs font-bold uppercase tracking-widest">No data</span>
                 </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-16">
        
        {/* Centralized High-Impact Header Dashboard */}
        <div className="flex flex-col items-center text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg" style={{ backgroundColor: TIER_DATA[currentTier].color, color: '#000' }}>
              {isAffiliate ? 'PARTNER' : currentTier} STATUS
            </span>
            
            <div className="relative" ref={goalsRef} onMouseEnter={() => setIsGoalsOpen(true)} onMouseLeave={() => setIsGoalsOpen(false)}>
              {nextTierData ? (
                <>
                  <div className="text-zinc-400 hover:text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-help py-1">
                    Clear {nextTierData.goalsCount} goal(s) to level up
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className={`transition-transform duration-300 ${isGoalsOpen ? 'rotate-90' : ''}`}><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                  
                  {/* Goals Progress Tooltip - Precisely Centered Below Trigger Text */}
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] transition-all duration-300 ${isGoalsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                    <div className="bg-[#1a1c22] border border-zinc-800 rounded-2xl w-[320px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)] text-left relative">
                      {/* Triangle Pointer at the top */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#1a1c22] border-l border-t border-zinc-800"></div>
                      
                      <h4 className="text-white text-[15px] font-bold tracking-tight mb-5 leading-tight">
                        Clear {nextTierData.goalsCount} goal(s) to unlock {nextTierData.name}
                      </h4>

                      <div className="space-y-6">
                        {/* Invite Goal */}
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-[13px] font-medium text-zinc-400">
                             <div className="flex items-center gap-1.5">
                               Invite <span className="text-white font-bold tabular-nums">{nextTierData.currentRefs} / {nextTierData.totalRefs}</span> eligible referrals
                               <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 flex items-center justify-center text-[8px] text-zinc-500 font-bold cursor-help">i</span>
                             </div>
                           </div>
                           <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                               style={{ width: `${Math.min(100, (nextTierData.currentRefs / nextTierData.totalRefs) * 100)}%` }}
                             ></div>
                           </div>
                        </div>

                        {/* Dashed Connector with "And" */}
                        <div className="relative flex items-center justify-center h-4">
                           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-zinc-800"></div></div>
                           <span className="relative px-3 bg-[#1a1c22] text-[10px] font-bold text-zinc-600 uppercase tracking-widest">And</span>
                        </div>

                        {/* Trading Goal */}
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-[13px] font-medium text-zinc-400">
                             <div>
                               Friends trade <span className="text-white font-bold tabular-nums">{nextTierData.currentVol} / {nextTierData.totalVol}</span> USDT
                             </div>
                           </div>
                           <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                               style={{ width: `${Math.min(100, (nextTierData.currentVol / nextTierData.totalVol) * 100)}%` }}
                             ></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Maximum Tier Reached</span>
              )}
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-none text-white">
            Hey, Ambassador
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-150">
            <div className="flex-1 bg-[#0d0d0d] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-all shadow-xl">
              <div className="text-left">
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Referral ID</div>
                <div className="text-sm font-mono text-zinc-300 group-hover:text-white transition-colors">{referralCode}</div>
              </div>
              <button onClick={() => copyToClipboard(referralCode, 'Referral ID')} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
            <div className="flex-[2] bg-[#0d0d0d] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-all shadow-xl">
              <div className="text-left overflow-hidden">
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Invitation Link</div>
                <div className="text-sm font-mono text-zinc-300 group-hover:text-white transition-colors truncate pr-4">{fullRefLink}</div>
              </div>
              <button onClick={() => copyToClipboard(fullRefLink, 'Referral Link')} className="px-4 py-2 bg-white text-black text-[11px] font-black uppercase rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2 shrink-0 shadow-lg active:scale-95">
                Copy
              </button>
            </div>
          </div>

          {/* Tier Cards Block - Rookie is excluded from hero list per request */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {tiers.map((t, index) => {
              const data = TIER_DATA[t];
              const isCurrent = currentTier === t;
              return (
                <div key={t} className={`relative overflow-hidden rounded-3xl border transition-all duration-700 p-8 flex flex-col h-full group ${isCurrent ? 'border-white/40 ring-1 ring-white/10' : 'border-white/5 hover:border-white/10'} bg-[#050505] text-left`} style={{ background: `linear-gradient(90deg, ${data.color}25 0%, ${data.color}05 50%, transparent 100%)` }}>
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-700 opacity-60 group-hover:opacity-100" style={{ backgroundColor: data.color, boxShadow: `0 0 25px ${data.color}A0, 0 0 10px ${data.color}` }}></div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`text-6xl font-black tracking-tighter transition-all duration-700 ${isCurrent ? 'opacity-50 scale-110' : 'opacity-10 group-hover:opacity-25'}`} style={{ color: data.color }}>{(index + 1).toString().padStart(2, '0')}</div>
                    {isCurrent && <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl animate-pulse">Current Rank</span>}
                  </div>
                  <div className="flex-1 relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40">Tier Rank</div>
                    <div className="text-3xl font-black mb-6 tracking-tight text-white group-hover:translate-x-1 transition-transform duration-700">{t}</div>
                    <div className="mb-8">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40">Monthly Projection</div>
                      <div className="text-4xl font-black tracking-tighter text-white">{data.avgEarn}</div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                    <div className={`flex items-center justify-between text-[11px] font-bold ${referralCount >= data.requirement ? 'text-green-400' : 'text-zinc-600'}`}>
                      <span className="uppercase tracking-wider">Required Refs</span>
                      <span className="font-mono">{data.requirement}+</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                      <span className="uppercase tracking-wider">Commission Boost</span>
                      <span className="font-mono text-white">{t === 'Platinum' ? 'Up to 75%' : `${data.commission}%`}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: Steps */}
        <div className="mb-24">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-center mb-16">What you need to do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="bg-[#0d0d0d] border border-white/5 rounded-[32px] p-12 relative group hover:border-white/10 transition-all flex flex-col items-start text-left">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black" style={numberGradientStyle}>1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Invite friends</h3>
              <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-[340px]">Share your invite link or code with your friends.</p>
            </div>
            <div className="bg-[#0d0d0d] border border-white/5 rounded-[32px] p-12 relative group hover:border-white/10 transition-all flex flex-col items-start text-left">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black" style={numberGradientStyle}>2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Get rewarded</h3>
              <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-[340px]">Once your friend completes their steps, you'll receive your reward.</p>
            </div>
          </div>
        </div>

        {/* Task Grid - Updated with 3 columns and larger text */}
        <div className="mb-24">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-center mb-16">Steps for your friends</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[
              { id: '1', title: 'Sign up', desc: 'They have to use your referral link or code.' },
              { id: '2', title: 'Deposit', desc: 'Deposit $100 or more worth of cash or crypto.' },
              { id: '3', title: 'Trade', desc: 'Buy $100 or more worth of crypto on Spot.' }
            ].map(task => (
              <div key={task.id} className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-10 group hover:border-white/10 transition-all flex flex-col items-start text-left min-h-[300px]">
                <div className="w-14 h-14 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-10">
                  <span className="text-2xl font-black" style={numberGradientStyle}>{task.id}</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">{task.title}</h3>
                <p className="text-zinc-500 text-lg font-medium leading-relaxed">{task.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* UPDATED SECTION: My Invites Dashboard */}
        <div className="mb-24 animate-in fade-in slide-in-from-bottom-6 duration-1000">
           <div className="text-center mb-12">
             <h2 className="text-4xl font-black tracking-tighter">My Invites</h2>
           </div>

           <div className="bg-[#0d0d0d] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
              {/* Dashboard Nav */}
              <div className="px-8 pt-8 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-8">
                  {['Invitation Overview', 'Referral History', 'Commission'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setInvitesTab(tab)}
                      className={`pb-4 text-sm font-bold tracking-tight transition-all relative ${invitesTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {tab}
                      {invitesTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>}
                      {tab !== 'Invitation Overview' && <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-zinc-700 text-[8px] text-zinc-500">i</span>}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 pb-4">
                   <div className="flex items-center bg-zinc-900/50 border border-white/10 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:bg-zinc-800 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span className="text-[11px] font-bold text-zinc-300">All</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                   <button className="w-8 h-8 rounded-lg bg-zinc-900/50 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                   </button>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-0">
                {invitesTab === 'Invitation Overview' ? (
                  <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                    {/* Left Panel: Earnings */}
                    <div className="space-y-12 text-left">
                        <div>
                          <div className="text-zinc-500 text-[13px] font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider">Total (USDT) ≈</div>
                          <div className="text-6xl font-black tracking-tighter tabular-nums">{earnings.toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                          <div className="space-y-4">
                              <div className="h-[1px] bg-zinc-800 w-full"></div>
                              <div>
                                <div className="text-xs text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> Spot (USDT) <span className="text-[10px] inline-flex items-center justify-center w-3 h-3 rounded-full border border-zinc-700 text-zinc-500">i</span>
                                </div>
                                <div className="text-2xl font-black mb-1">0</div>
                                <div className="text-[10px] text-zinc-600 font-black uppercase tracking-tight">Commission {TIER_DATA[currentTier].commission}%</div>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div className="h-[1px] bg-zinc-800 w-full"></div>
                              <div>
                                <div className="text-xs text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> Futures (USDT)
                                </div>
                                <div className="text-2xl font-black mb-1">0</div>
                                <div className="text-[10px] text-zinc-600 font-black uppercase tracking-tight">Commission {TIER_DATA[currentTier].commission}%</div>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div className="h-[1px] bg-zinc-800 w-full"></div>
                              <div>
                                <div className="text-xs text-zinc-500 font-bold mb-2 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> DEX+ (USDT)
                                </div>
                                <div className="text-2xl font-black mb-1">0</div>
                                <div className="text-[10px] text-zinc-600 font-black uppercase tracking-tight">Commission {TIER_DATA[currentTier].commission}%</div>
                              </div>
                          </div>
                        </div>
                    </div>

                    {/* Right Panel: Referral Progress */}
                    <div className="lg:border-l lg:border-white/5 lg:pl-12 flex flex-col justify-between text-left">
                        <div>
                          <div className="text-zinc-500 text-[13px] font-bold mb-2 uppercase tracking-wider">Total Referrals</div>
                          <div className="text-6xl font-black tracking-tighter tabular-nums">{referralCount}</div>
                        </div>

                        <div className="mt-12 bg-black/40 border border-white/5 rounded-2xl p-6 flex items-center gap-6 group hover:border-white/10 transition-all">
                          <div className="w-20 h-20 shrink-0 relative flex items-center justify-center">
                              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f1c40f" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
                              <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] font-black px-1.5 rounded-full uppercase tracking-tighter">$</div>
                          </div>
                          <div className="flex-1">
                              <p className="text-[12px] text-zinc-400 font-medium leading-relaxed mb-4">Copy your referral link to invite friends and earn more commissions.</p>
                              <button 
                                onClick={() => copyToClipboard(fullRefLink, 'Referral Link')}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-full transition-all active:scale-95 shadow-lg"
                              >
                                Copy & Invite
                              </button>
                          </div>
                        </div>
                    </div>
                  </div>
                ) : invitesTab === 'Referral History' ? (
                  <div className="p-4 animate-in fade-in duration-500">
                    {renderHistoryTable()}
                  </div>
                ) : (
                  <div className="py-10 animate-in fade-in duration-500">
                    {renderCommissionTable()}
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* FAQ SECTION - Heading size matched with other sections */}
        <div className="max-w-[1400px] mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-center mb-16 leading-none">Questions? We’ve got answers.</h2>
          
          <div className="space-y-0 border-t border-zinc-800">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-zinc-800 overflow-hidden text-left">
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full py-8 md:py-10 flex items-center justify-between text-left group transition-colors"
                >
                  <span className={`text-lg md:text-[22px] font-bold tracking-tight pr-8 transition-colors ${openFaqIndex === index ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>{item.question}</span>
                  <div className={`transition-transform duration-300 text-zinc-600 group-hover:text-zinc-400 ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </button>
                
                <div className={`grid transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'grid-rows-[1fr] opacity-100 pb-12' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="text-zinc-400 text-[16px] md:text-[18px] font-medium leading-relaxed max-w-[90%] md:max-w-[85%]">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
