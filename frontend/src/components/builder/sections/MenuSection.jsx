import React, { useState } from 'react';

export default function MenuSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark',
    title = 'Discover Menu',
    categories: apiCategories
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  const fallbackItems = [
    { name: 'Americano Coffee', desc: 'Milk with vanilla flavored', price: '$20.65', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf' },
    { name: 'Redeye Coffee', desc: 'Milk with vanilla flavored', price: '$15.80', img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7' },
    { name: 'Macchiato Coffee', desc: 'Milk with vanilla flavored', price: '$22.00', img: 'https://images.unsplash.com/photo-1572442388796-11668aa44f26' },
    { name: 'Latte Coffee', desc: 'Milk with vanilla flavored', price: '$18.50', img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9' }
  ];

  const fallbackCatItems = [
    { n: 'Optic Big Breakfast', p: '$12', d: 'Bacon, Eggs, Spinach, Tomato' },
    { n: 'Cinnamon Pancakes', p: '$18', d: 'Honey, butter, strawberries' },
    { n: 'Avocado Toast', p: '$15', d: 'Smashed avocado on rye' },
    { n: 'French Croissant', p: '$14', d: 'Freshly baked with jam' }
  ];

  const categories = apiCategories?.length ? apiCategories : [];

  if (layout === 'coffee-house') {
    const items = categories.length ? categories.flatMap(c => c.items || []).slice(0, 4) : fallbackItems;

    return (
      <section className="w-full bg-[#120F0D] py-24 px-6 md:px-12" style={{ fontFamily }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">
           <div className="flex items-center gap-4 opacity-80 mb-4">
              <div className="w-8 h-px bg-[#A0988E]" />
              <span className="text-[#A0988E] text-[10px] uppercase tracking-[0.3em] font-bold">Pricing</span>
              <div className="w-8 h-px bg-[#A0988E]" />
           </div>
           
           <h2 className="text-3xl md:text-5xl font-black text-white text-center leading-tight mb-12 font-serif">
             {title}
           </h2>

           <div className="flex flex-wrap justify-center gap-2 mb-16">
              {['All', 'Coffee', 'Dessert', 'Snacks', 'Bread'].map((tab, idx) => (
                <button key={idx} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${idx === 1 ? 'bg-white text-black' : 'bg-transparent text-[#A0988E] border border-white/10 hover:border-white/30'}`}>
                   {tab}
                </button>
              ))}
           </div>

           <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {items.map((item, idx) => (
                 <div key={idx} className="flex gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-colors -m-4">
                    <div className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 border border-white/10" style={{ backgroundImage: `url(${(item.img || item.image_url) + '?auto=format&fit=crop&w=150&q=80'})` }} />
                    <div className="flex-1 pt-1">
                       <div className="flex justify-between items-baseline mb-1">
                          <h4 className="text-white font-bold text-lg">{item.name}</h4>
                          <span className="text-[#A0988E] font-black">{item.price}</span>
                       </div>
                       <p className="text-[#A0988E] text-sm">{item.desc || item.description}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'tastenest-light') {
    const cats = categories.length ? categories : [
      { name: 'Breakfast', items: fallbackCatItems },
      { name: 'Lunch', items: fallbackCatItems },
      { name: 'Dinner', items: fallbackCatItems }
    ];

    return (
      <section className="w-full bg-[#f4f7f6] py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
           <h4 className="text-[#F70A38] text-sm font-black uppercase tracking-widest mb-4">Pricing</h4>
           <h2 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] mb-16 text-center">
             {title}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {cats.map((cat, idx) => {
                const items = cat.items?.length ? cat.items.slice(0, 4) : fallbackCatItems;
                return (
                  <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-border">
                     <h3 className="text-xl font-black text-foreground mb-8 border-b border-border pb-4">{cat.name}</h3>
                     <div className="flex flex-col gap-6">
                        {items.map((item, i) => (
                          <div key={i} className="group">
                             <div className="flex justify-between items-end mb-1">
                                <h5 className="font-bold text-foreground leading-none bg-white relative z-10 pr-2">{item.n || item.name}</h5>
                                <div className="flex-1 border-b-2 border-dotted border-border mb-1 mx-2" />
                                <span className="font-black text-lg bg-white relative z-10 pl-2 text-[#F70A38]">{item.p || item.price}</span>
                             </div>
                             <p className="text-xs text-muted-foreground font-medium">{item.d || item.description}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      </section>
    );
  }

  const darkCats = categories.length ? categories.slice(0, 2) : [
    { name: 'Steaks & BBQ', image_url: 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5', items: fallbackCatItems },
    { name: 'Cocktails', image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', items: fallbackCatItems }
  ];

  return (
    <section className="relative w-full bg-[#111111] py-24 px-6 md:px-16 overflow-hidden" style={{ fontFamily }}>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F70A38] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 z-0" />
      
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
         <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Pricing</h4>
         <h2 className="text-4xl md:text-[3rem] font-black text-white leading-[1.05] mb-16 tracking-tight text-center">
           {title}
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
            {darkCats.map((menu, idx) => {
              const items = menu.items?.length ? menu.items.slice(0, 4) : fallbackCatItems;
              return (
                <div key={idx} className="relative rounded-3xl overflow-hidden bg-[#1A1A1A] border border-white/5 group">
                   <div className="h-48 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url(${menu.image_url || menu.bg || 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5'}?auto=format&fit=crop&w=800&q=80)` }} />
                      <div className="absolute inset-0 bg-black/50" />
                      <h3 className="absolute bottom-6 left-6 text-3xl font-black text-white italic">{menu.name || menu.cat}</h3>
                   </div>
                   <div className="p-8 flex flex-col gap-6">
                      {items.map((item, i) => (
                        <div key={i}>
                           <div className="flex justify-between items-end mb-1">
                              <h5 className="font-bold text-white leading-none relative z-10 pr-2">{item.n || item.name}</h5>
                              <div className="flex-1 border-b border-dotted border-white/20 mb-1 mx-2" />
                              <span className="font-black text-xl text-[#FFC806] leading-none">{item.p || item.price}</span>
                           </div>
                           <p className="text-xs text-gray-500 font-medium mt-2">{item.d || item.description}</p>
                        </div>
                      ))}
                   </div>
                </div>
              );
            })}
         </div>
      </div>
    </section>
  );
}
