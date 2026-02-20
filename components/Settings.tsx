import React, { useState } from 'react';
import { useExchangeStore } from '../store';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const { user, balances } = useExchangeStore();

  const tabs = [
    'Overview', 'Profile', 'Security', 'Verification', 'Preferences'
  ];

  const maskedEmail = user?.email ? `${user.email.split('@')[0].slice(0, 3)}***@${user.email.split('@')[1]}` : 'vir***@proton.me';
  const displayUid = user?.id?.slice(0, 16) || '805418618808070350';

  const renderOverview = () => (
    <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top User Info Bar */}
      <div className="bg-[#111] border border-zinc-900 rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUid}`} alt="avatar" />
          </div>
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-xl font-bold">{maskedEmail}</span>
              <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 mt-1">
                {displayUid} <button className="hover:text-white transition-colors"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-bold tracking-tight mb-1">Email</span>
              <span className="text-sm font-semibold">{user?.email || 'vir***@proton.me'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-bold tracking-tight mb-1 flex items-center gap-1">Identity verification <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m9 5 7 7-7 7"/></svg></span>
              <button className="text-[11px] font-bold px-2 py-0.5 border border-zinc-700 rounded hover:border-white transition-colors w-fit">Verify now</button>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-bold tracking-tight mb-1 flex items-center gap-1">Country/Region <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m9 5 7 7-7 7"/></svg></span>
              <span className="text-sm font-semibold">United States</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-bold tracking-tight mb-1 flex items-center gap-1">Trading fee tier <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m9 5 7 7-7 7"/></svg></span>
              <span className="text-[11px] font-bold px-2 py-0.5 border border-zinc-700 rounded w-fit">Regular user</span>
            </div>
          </div>
        </div>
        <button onClick={() => setActiveTab('Profile')} className="text-xs font-bold px-4 py-2 border border-zinc-700 rounded-lg hover:border-white transition-all">View profile</button>
      </div>

      <div className="grid grid-cols-12 gap-6 pb-12">
        <div className="col-span-8 space-y-6">
          {/* Highlighted Security Banner */}
          <div className="bg-gradient-to-br from-amber-400/10 via-[#111] to-[#111] border border-amber-500/20 rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full -mr-10 -mt-10"></div>
            <div className="p-8 relative z-10">
              <h3 className="text-2xl font-bold mb-2">Help us secure your account</h3>
              <p className="text-zinc-500 text-sm mb-8">Verify your identity now</p>
              
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 shadow-inner">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2M12 8v4M9 11v1M15 11v1M9 15c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold">Verify your identity</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Complete verification for enhanced security</div>
                  </div>
                </div>
                <div className="text-amber-500 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Verify now <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m9 5 7 7-7 7"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/30 py-3 flex justify-center border-t border-zinc-900 cursor-pointer hover:bg-zinc-900/50 transition-all">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <div className="bg-black border border-zinc-900 rounded-xl overflow-hidden">
             <div className="p-6">
                <h3 className="text-xl font-bold mb-6">Today's crypto prices</h3>
                <div className="flex gap-6 border-b border-zinc-900 mb-4">
                   {['Favorites', 'Top', 'Hot', 'Gainers', 'New'].map((t, i) => (
                     <button key={t} className={`text-xs font-bold pb-4 border-b-2 transition-all ${i === 1 ? 'border-white text-white' : 'border-transparent text-zinc-500'}`}>{t}</button>
                   ))}
                </div>
                <table className="w-full text-sm">
                   <thead>
                     <tr className="text-[10px] text-zinc-600 font-black uppercase tracking-widest border-b border-zinc-900">
                       <th className="text-left py-3 font-normal">Name</th>
                       <th className="text-right py-3 font-normal">Price</th>
                       <th className="text-right py-3 font-normal">Change</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-900">
                     {balances.slice(0, 6).map(asset => (
                       <tr key={asset.symbol} className="hover:bg-zinc-900/30 cursor-pointer group">
                         <td className="py-4 flex items-center gap-3">
                           <img src={`https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`} className="w-7 h-7 rounded-full" alt="" />
                           <span className="font-bold">{asset.symbol}</span>
                         </td>
                         <td className="text-right py-4 font-mono font-bold">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                         <td className={`text-right py-4 font-mono font-bold ${asset.change24h >= 0 ? 'text-[#00d18e]' : 'text-[#ff4d4f]'}`}>{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-[#111] border border-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[15px] font-bold">Announcements</h4>
              <button className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">More <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m9 5 7 7-7 7"/></svg></button>
            </div>
            <div className="space-y-6">
               {[
                 { date: '01/30/2026', title: 'Lintex to list ZAMA (Zama) for spot trading and convert pre-market futures to standard perpetual futures' },
                 { date: '01/30/2026', title: 'Lintex to support Sei network mainnet upgrade' },
                 { date: '01/29/2026', title: 'Lintex to support Story Network Mainnet Upgrade' },
                 { date: '01/27/2026', title: 'Lintex will launch USAT/USD for spot trading' }
               ].map((ann, i) => (
                 <div key={i} className="cursor-pointer group">
                    <div className="text-[10px] text-zinc-600 font-bold mb-1">{ann.date}</div>
                    <div className="text-xs font-medium group-hover:text-zinc-300 leading-snug">{ann.title}</div>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-[#111] border border-zinc-900 rounded-xl p-6 relative">
            <button className="absolute top-4 right-4 text-zinc-500 hover:text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M18 6 6 18M6 6l12 12"/></svg></button>
            <div className="flex gap-4">
              <div className="bg-white p-2 rounded-lg w-20 h-20 shrink-0">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LINTEX-APP" alt="QR" className="w-full h-full" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="font-bold text-sm mb-1">Download app and trade on the go</div>
                <div className="text-xs text-zinc-500">Scan to download</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <div className="flex items-center gap-6 pb-10 border-b border-zinc-900">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-700 shadow-xl">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUid}`} alt="avatar" />
          </div>
          <div>
             <h2 className="text-3xl font-bold mb-1 tracking-tight">Hi, {maskedEmail}</h2>
             <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                {displayUid} <button className="hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
             </div>
          </div>
       </div>

       <div className="space-y-4">
          <h3 className="text-xl font-bold">Personal details</h3>
          <div className="bg-[#111] border border-zinc-900 rounded-xl divide-y divide-zinc-900">
             {[
               { label: 'Nickname', value: maskedEmail, action: 'Change' },
               { label: 'Email address', value: maskedEmail, action: 'Manage' },
               { label: 'Phone number', value: '****975', action: 'Manage' }
             ].map((row, i) => (
               <div key={i} className="flex justify-between items-center p-6">
                  <div>
                    <div className="text-sm font-bold mb-0.5">{row.label}</div>
                    <div className="text-xs text-zinc-500 font-medium">{row.value}</div>
                  </div>
                  <button className="text-xs font-bold px-4 py-1.5 border border-zinc-800 rounded-lg hover:bg-white hover:text-black transition-all">{row.action}</button>
               </div>
             ))}
          </div>
       </div>

       <div className="space-y-4 pb-12">
          <h3 className="text-xl font-bold">Identity verification</h3>
          <div className="bg-[#111] border border-zinc-900 rounded-xl divide-y divide-zinc-900">
             <div className="flex justify-between items-center p-6">
                <div>
                  <div className="text-sm font-bold mb-0.5">Status</div>
                  <div className="text-xs text-[#ff4d4f] font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Unverified
                  </div>
                </div>
                <button className="text-xs font-bold px-4 py-1.5 border border-zinc-800 rounded-lg hover:bg-white hover:text-black transition-all">Verify now</button>
             </div>
             <div className="flex justify-between items-center p-6">
                <div>
                  <div className="text-sm font-bold mb-0.5">Country/Region</div>
                  <div className="text-xs text-zinc-500 font-medium">United States</div>
                </div>
                <button className="text-xs font-bold px-4 py-1.5 border border-zinc-800 rounded-lg hover:bg-white hover:text-black transition-all">View details</button>
             </div>
          </div>
       </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-10 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <div className="flex items-center gap-12 py-6">
          <div className="relative w-32 h-32 shrink-0">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="282" strokeDashoffset="169" strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold">2<span className="text-zinc-500 text-sm font-medium">/5</span></span>
             </div>
          </div>
          <div>
             <h2 className="text-3xl font-bold mb-1 tracking-tight">Security level: <span className="text-orange-500">Moderate</span></h2>
             <p className="text-zinc-500 text-sm mb-4">Strengthen your security now to protect your assets.</p>
             <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-all">Improve security</button>
          </div>
       </div>

       <div className="space-y-4 pb-12">
          <h3 className="text-xl font-bold">Authentication methods</h3>
          <div className="bg-[#111] border border-zinc-900 rounded-xl divide-y divide-zinc-900">
             {[
               { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><path d="M12 11V8"/></svg>, label: 'Passkeys', badge: 'Recommended', desc: 'Use your biometrics or USB security key to log in or verify transactions.', action: 'Set up' },
               { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12V7H4v14h11"/><path d="M18 11V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/><path d="m21 16 2 2-2 2"/></svg>, label: 'Authenticator app', desc: 'Link an authenticator app to receive one-time codes.', action: 'Set up' },
               { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>, label: 'Phone number', desc: '****975', action: 'Manage' },
               { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>, label: 'Email address', desc: 'vir***@proton.me', action: 'Manage' },
               { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'Password', desc: 'Set a strong password to use for account logins.', action: 'Change' }
             ].map((row, i) => (
               <div key={i} className="flex justify-between items-center p-6 gap-6">
                  <div className="flex gap-4">
                     <div className="text-zinc-500 mt-1 shrink-0">{row.icon}</div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-sm font-bold">{row.label}</span>
                           {row.badge && <span className="bg-lime-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-tighter">{row.badge}</span>}
                        </div>
                        <div className="text-xs text-zinc-500 font-medium leading-relaxed max-w-md">{row.desc}</div>
                     </div>
                  </div>
                  <button className="text-xs font-bold px-4 py-1.5 border border-zinc-800 rounded-lg hover:bg-white hover:text-black transition-all shrink-0">{row.action}</button>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  const renderVerification = () => (
    <div className="grid grid-cols-12 gap-10 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
       <div className="col-span-8 space-y-10">
          <h2 className="text-4xl font-black tracking-tight">Let's verify your account</h2>
          <div className="space-y-4">
             <div className="bg-black border-2 border-white rounded-2xl p-10 cursor-pointer hover:bg-zinc-900/50 transition-all flex items-center gap-8 group">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                   <h4 className="text-xl font-bold mb-1">Individual verification</h4>
                   <p className="text-zinc-500 text-sm">For users who want to trade, send, receive, and manage crypto for themselves</p>
                </div>
             </div>
             <div className="bg-[#111] border border-zinc-900 rounded-2xl p-10 cursor-pointer hover:border-zinc-700 transition-all flex items-center gap-8 group">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7"/><path d="M19 21V7H5v14"/></svg>
                </div>
                <div>
                   <h4 className="text-xl font-bold mb-1">Institutional verification</h4>
                   <p className="text-zinc-500 text-sm">For institutions who want to save, invest, receive, pay, and manage crypto on behalf of others</p>
                </div>
             </div>
          </div>
          <button className="w-full py-4 bg-white text-black font-black rounded-full text-sm uppercase tracking-tighter hover:bg-zinc-200 transition-all">Verify identity</button>
       </div>

       <div className="col-span-4 space-y-8">
          <h4 className="text-xl font-bold">FAQ</h4>
          <div className="space-y-4 border-t border-zinc-900">
             {[
               { q: 'Can I verify both an individual account and an institutional account?', a: 'No, you can only verify one type of account. Choose the option that best suits your needs.' },
               { q: 'What’s the difference between individual verification and institutional verification?', a: 'As an individual, you need to provide your personal identity information... As an institution, you need to provide valid legal documents...' }
             ].map((faq, i) => (
               <div key={i} className="py-6 border-b border-zinc-900 group">
                  <div className="flex justify-between items-center cursor-pointer mb-4">
                    <span className="text-[15px] font-bold leading-tight group-hover:text-zinc-300 pr-4">{faq.q}</span>
                    <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m18 15-6-6-6 6"/></svg>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed font-medium">{faq.a}</p>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
       <h2 className="text-4xl font-black mb-8 tracking-tight">Preferences</h2>
       <div className="bg-[#111] border border-zinc-900 rounded-xl divide-y divide-zinc-900 overflow-hidden">
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, label: 'Language', value: 'English' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>, label: 'Currency', value: 'USD' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center p-8 group cursor-pointer hover:bg-zinc-900/30 transition-all">
               <div className="flex items-center gap-4">
                  <span className="text-zinc-500 group-hover:text-white transition-colors">{row.icon}</span>
                  <span className="text-sm font-bold">{row.label}</span>
               </div>
               <div className="flex items-center gap-2 text-sm font-bold">
                  {row.value} <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m6 9 6 6 6-6"/></svg>
               </div>
            </div>
          ))}

          {/* Color palette special row */}
          <div className="p-8 grid grid-cols-12 gap-8 items-center">
             <div className="col-span-4 flex items-center gap-4">
                <span className="text-zinc-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></span>
                <span className="text-sm font-bold">Color palette</span>
             </div>
             <div className="col-span-8 flex gap-4">
                <div className="bg-black border border-zinc-800 rounded-xl p-5 flex-1 cursor-pointer hover:border-zinc-500 transition-all flex flex-col justify-between min-h-[140px]">
                   <div className="text-xs font-bold text-zinc-400">Modern</div>
                   <div className="flex items-end gap-[2px] h-12">
                      {[30, 50, 20, 70, 40, 60, 30].map((h, i) => (
                        <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#ff4d4f]' : 'bg-[#00d18e]'} rounded-sm opacity-80`} style={{height: `${h}%`}}></div>
                      ))}
                   </div>
                </div>
                <div className="bg-black border-2 border-white rounded-xl p-5 flex-1 cursor-pointer flex flex-col justify-between min-h-[140px] shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                   <div className="text-xs font-bold text-white">Classic</div>
                   <div className="flex items-end gap-[2px] h-12">
                      {[30, 50, 20, 70, 40, 60, 30].map((h, i) => (
                        <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-red-500' : 'bg-green-500'} rounded-sm`} style={{height: `${h}%`}}></div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Price changes special row */}
          <div className="p-8 grid grid-cols-12 gap-8 items-center">
             <div className="col-span-4 flex items-center gap-4">
                <span className="text-zinc-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></span>
                <span className="text-sm font-bold">Price changes</span>
             </div>
             <div className="col-span-8 flex gap-4">
                <div className="bg-black border-2 border-white rounded-xl p-4 flex-1 cursor-pointer flex items-center justify-between">
                   <div className="text-xs font-bold leading-snug">Green up, red down</div>
                   <div className="flex items-center gap-1">
                      <svg width="20" height="20" className="text-[#00d18e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 7-7 7 7M12 5v14"/></svg>
                      <svg width="20" height="20" className="text-[#ff4d4f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m19 12-7 7-7-7M12 19V5"/></svg>
                   </div>
                </div>
                <div className="bg-black border border-zinc-800 rounded-xl p-4 flex-1 cursor-pointer hover:border-zinc-500 transition-all flex items-center justify-between">
                   <div className="text-xs font-bold leading-snug text-zinc-500">Red up, green down</div>
                   <div className="flex items-center gap-1 opacity-50">
                      <svg width="20" height="20" className="text-[#ff4d4f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 7-7 7 7M12 5v14"/></svg>
                      <svg width="20" height="20" className="text-[#00d18e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m19 12-7 7-7-7M12 19V5"/></svg>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center p-8 group cursor-pointer hover:bg-zinc-900/30 transition-all">
             <div className="flex items-center gap-4">
                <span className="text-zinc-500 group-hover:text-white transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
                <span className="text-sm font-bold">24h change & chart timezone</span>
             </div>
             <div className="flex items-center gap-2 text-sm font-bold">
                UTC <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/10 selection:text-white">
      {/* Settings Tab Navigation - Fiksiran na top-0 jer main kontejner počinje posle headera */}
      <div className="bg-[#0a0a0a] border-b border-zinc-900 px-8 sticky top-0 z-[45] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
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

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12">
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Profile' && renderProfile()}
        {activeTab === 'Security' && renderSecurity()}
        {activeTab === 'Verification' && renderVerification()}
        {activeTab === 'Preferences' && renderPreferences()}
        
        {/* Mock for other potential tabs */}
        {!['Overview', 'Profile', 'Security', 'Verification', 'Preferences'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in duration-700">
             <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7-7-7M5 12h14"/></svg>
             </div>
             <h3 className="text-2xl font-bold mb-2">{activeTab}</h3>
             <p className="text-zinc-500 text-sm max-w-xs">This section is currently under development as part of the Lintex Pro upgrade.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;