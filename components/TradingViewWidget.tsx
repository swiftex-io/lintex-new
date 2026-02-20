
import React, { useEffect, useRef } from 'react';
import { useExchangeStore } from '../store';

const TradingViewWidget: React.FC = () => {
  const { activePair } = useExchangeStore();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Standardizing the symbol for TradingView (usually BINANCE:XXXUSDT)
    const [base, quote] = activePair.split('/');
    const tvSymbol = `BINANCE:${base}${quote}`;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && container.current) {
        new (window as any).TradingView.widget({
          "autosize": true,
          "symbol": tvSymbol,
          "interval": "15",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#000000",
          "enable_publishing": false,
          "allow_symbol_change": false,
          "container_id": container.current.id,
          "hide_side_toolbar": true,
          "hide_legend": true, 
          "hide_top_toolbar": false, 
          "backgroundColor": "#000000",
          "gridColor": "#131722", 
          "save_image": false,
          "details": false,
          "hotlist": false,
          "calendar": false,
          "show_popup_button": false,
          "withdateranges": false, 
          "range": "1D",
          "enabled_features": [], // Isključen countdown i ostali napredni dodaci
          "studies": [
            "MASimple@tv-basicstudies", // SMA
            "MAExp@tv-basicstudies"    // EMA
          ],
          "studies_overrides": {
            "volume.show_last_value": false,
            "moving average.precision": 2,
            "moving average.styles.plot.color": "#00d18e", // Zelena za SMA
            "moving average exponential.precision": 2,
            "moving average exponential.styles.plot.color": "#ff4d4f" // Crvena za EMA
          },
          "overrides": {
            "paneProperties.background": "#000000",
            "paneProperties.vertGridProperties.color": "#131722",
            "paneProperties.horzGridProperties.color": "#131722",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#AAA",
            "scalesProperties.showCountdown": false, // Eksplicitno isključeno
            "scalesProperties.showSymbolLabels": true, 
            "scalesProperties.showStudyLastValue": false,
            "mainSeriesProperties.showCountdown": false, // Eksplicitno isključeno
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "paneProperties.legendProperties.showStudyArguments": false,
            "paneProperties.legendProperties.showStudyTitles": false,
            "paneProperties.legendProperties.showStudyValues": false
          }
        });
      }
    };
    
    if (container.current) {
      container.current.innerHTML = '';
    }
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
    };
  }, [activePair]);

  return (
    <div className="tradingview-widget-container w-full h-full bg-black">
      <div 
        id="tradingview_chart" 
        ref={container} 
        className="w-full h-full"
      />
    </div>
  );
};

export default TradingViewWidget;
