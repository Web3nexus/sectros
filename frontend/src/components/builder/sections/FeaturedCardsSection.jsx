import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';

export default function FeaturedCardsSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark', 
    title = 'Featured Dishes'
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  if (layout === 'coffee-house') {
    return (
      <section className="w-full bg-[#120F0D] py-24 px-6 md:px-12" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
           <h2 className="text-3xl md:text-5xl font-black text-white text-center leading-tight mb-16 font-serif">
             {title}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
              {[
                { name: 'Costa Rica Packet', p: '$24', sold: '55', img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7' },
                { name: 'Sumatra Packet', p: '$18', sold: '42', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf' },
                { name: 'House Blend', p: '$15', sold: '120', img: 'https://images.unsplash.com/photo-1572442388796-11668aa44f26' },
                { name: 'Dark Roast', p: '$22', sold: '18', img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9' }
              ].map((item, idx) => (
                 <div key={idx} className="bg-[#0A0807] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center group hover:border-[#A0988E]/40 transition-colors">
                    <div className="w-full h-40 bg-white/5 rounded-xl mb-6 relative overflow-hidden">
                       <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${item.img}?auto=format&fit=crop&w=400&q=80)` }} />
                       <div className="absolute top-2 right-2 bg-[#A0988E] text-[#0A0807] text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.sold} Sold
                       </div>
                    </div>
                    <div className="flex text-[#A0988E] mb-2"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                    <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
                    <span className="text-[#A0988E] font-black text-xl mb-4">{item.p}</span>
                    <button className="w-full py-3 rounded border border-white/20 text-[#A0988E] font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors">
                       Add to Cart
                    </button>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'tastenest-light') {
    return (
      <section className="w-full bg-white py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
           <h4 className="text-[#F70A38] text-sm font-black uppercase tracking-widest mb-4">Top Deals</h4>
           <h2 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] mb-16 text-center">
             {title}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
              {[
                { name: 'Lunch Special', off: '20% OFF', p: '$14.99', img: 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5' },
                { name: 'Dinner For Two', off: '15% OFF', p: '$49.99', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4' }
              ].map((item, idx) => (
                 <div key={idx} className="bg-slate-50 border border-border rounded-3xl p-6 flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                    <div className="w-32 h-32 rounded-2xl relative overflow-hidden shrink-0">
                       <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${item.img}?auto=format&fit=crop&w=300&q=80)` }} />
                       <div className="absolute top-2 left-2 bg-[#F70A38] text-white text-[10px] font-black px-2 py-1 rounded">
                          {item.off}
                       </div>
                    </div>
                    <div className="pt-2">
                       <h3 className="text-xl font-black text-foreground mb-1">{item.name}</h3>
                       <p className="text-muted-foreground text-sm font-medium mb-4">{item.p}</p>
                       <button className="text-[10px] font-black text-[#F70A38] uppercase tracking-widest hover:text-foreground transition-colors flex items-center gap-2">
                          Grab Deal <span className="text-lg leading-none">→</span>
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  // TasteNest Dark
  return (
    <section className="w-full bg-[#f8f9fa] py-24 px-6 md:px-16" style={{ fontFamily }}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
         <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Gourmet Selection</h4>
         <h2 className="text-4xl md:text-[3rem] font-black text-foreground leading-[1.05] mb-16 tracking-tight text-center">
           {title}
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[
              { n: 'Grilled Steak', p: '$45.00', r: '(120 Reviews)', img: 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5' },
              { n: 'Premium Seafood', p: '$55.00', r: '(85 Reviews)', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b' },
              { n: 'Vegan Platters', p: '$32.00', r: '(205 Reviews)', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' }
            ].map((item, idx) => (
               <div key={idx} className="bg-white rounded-3xl border border-border p-6 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                  <div className="w-full h-56 rounded-2xl relative overflow-hidden mb-6">
                     <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${item.img}?auto=format&fit=crop&w=500&q=80)` }} />
                     {/* Yellow Price Badge */}
                     <div className="absolute top-4 left-4 bg-[#FFC806] text-foreground font-black px-4 py-2 rounded-xl text-lg shadow-lg">
                        {item.p}
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex text-[#FFC806]"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                     <span className="text-xs text-muted-foreground font-bold">{item.r}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black text-foreground">{item.n}</h3>
                     <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-muted-foreground hover:bg-[#F70A38] hover:text-white transition-colors">
                        <ShoppingCart size={16} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </section>
  );
}
