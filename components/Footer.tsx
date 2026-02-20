import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: "More about Lintex",
      links: ["About us", "Careers", "Contact us", "Terms of Service", "Privacy Notice", "Disclosures", "Whistleblower notice", "Law enforcement", "Lintex app", "Cookie preferences"]
    },
    {
      title: "Products",
      links: ["Buy crypto", "Convert", "Crypto calculator", "All cryptocurrencies"]
    },
    {
      title: "Services",
      links: ["API", "Historical market data", "CEX fee schedule", "Listing application"]
    },
    {
      title: "Support",
      links: ["Support center", "Channel verification", "Announcements"]
    },
    {
      title: "Buy crypto",
      links: ["Buy USDT", "Buy USDC", "Buy Bitcoin", "Buy Ethereum", "Buy Litecoin"]
    },
    {
      title: "Crypto calculator",
      links: ["BTC to USD", "ETH to USD", "USDT to USD"]
    },
    {
      title: "Trade",
      links: ["Bitcoin price", "Ethereum price"]
    }
  ];

  return (
    <footer className="bg-black text-white pt-20 pb-16 px-6 md:px-12 border-t border-zinc-900">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Section: Logo, Info, Language */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Logo className="h-6 text-white" />
              </div>
              <div className="text-[12px] text-zinc-500 leading-relaxed max-w-[280px]">
                ©2026 LINTEX.EXCHANGE. One Sansome Street, Suite 1400 PMB 6005, San Francisco, CA 94104.
                <br />
                NMLS #1767779
              </div>
            </div>

            <button className="flex items-center gap-3 px-4 py-2.5 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors group">
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="text-sm font-medium">English/USD</span>
              <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>

          {/* Middle Section: Links Grid */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-4">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="text-[15px] font-bold tracking-tight">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13px] text-zinc-500 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;