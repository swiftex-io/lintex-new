
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useExchangeStore } from '../store';

const TradeChart: React.FC = () => {
  const { balances } = useExchangeStore();
  const btcPrice = balances.find(b => b.symbol === 'BTC')?.price || 65000;

  // Generisanje istorijskih podataka na osnovu trenutne cene
  const chartData = useMemo(() => {
    const points = 20;
    const data = [];
    let tempPrice = btcPrice * 0.98;
    
    for (let i = 0; i < points; i++) {
      const time = new Date();
      time.setMinutes(time.getMinutes() - (points - i) * 15);
      
      const volatility = 0.005;
      const progress = i / (points - 1);
      const targetPrice = btcPrice;
      
      tempPrice = (tempPrice * (1 - progress)) + (targetPrice * progress) + (Math.random() - 0.5) * btcPrice * volatility;
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: tempPrice
      });
    }
    data[data.length - 1].price = btcPrice;
    return data;
  }, [btcPrice]);

  return (
    <div className="w-full h-full p-4 flex flex-col bg-zinc-950/50">
       <div className="flex justify-between items-center mb-4">
         <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
           {['1m', '5m', '15m', '1h', '4h', '1D'].map(t => (
             <button key={t} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${t === '15m' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
               {t}
             </button>
           ))}
         </div>
         <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> MA(5): { (btcPrice * 0.999).toFixed(2) }</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> MA(10): { (btcPrice * 0.997).toFixed(2) }</span>
         </div>
       </div>
       
       <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#444', fontSize: 9, fontWeight: 700}} 
              interval={4}
            />
            <YAxis 
              orientation="right"
              domain={['dataMin - 100', 'dataMax + 100']} 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#444', fontSize: 9, fontWeight: 700}}
              tickFormatter={(val) => `$${val.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold'}}
              itemStyle={{color: '#10b981'}}
              cursor={{ stroke: '#333', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2} 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
       </div>
    </div>
  );
};

export default TradeChart;
