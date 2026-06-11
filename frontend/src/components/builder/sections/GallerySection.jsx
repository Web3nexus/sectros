import React from 'react';

export default function GallerySection({ content, theme }) {
  const { 
    layout = 'tastenest-light', 
    title = 'A Glimpse of the Experience',
    images: apiImages
  } = content;

  const { fontFamily = 'Outfit' } = theme;

  const fallbackImages = [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'https://images.unsplash.com/photo-1550966842-28c057696113'
  ];

  const k = apiImages?.length ? apiImages.map(img => img.image_url || img) : fallbackImages;

  if (layout === 'coffee-house') {
    return (
      <section className="w-full bg-[#0A0807] py-24 px-6 md:px-12 border-t border-white/5" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
           <h4 className="text-[#A0988E] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Portfolio</h4>
           <h2 className="text-3xl md:text-5xl font-black text-white text-center leading-tight mb-16 font-serif">
             {title || 'Our Gallery'}
           </h2>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
              {k.slice(0, 6).map((img, idx) => (
                 <div key={idx} className="relative group overflow-hidden bg-white/5 rounded-2xl aspect-4/5 cursor-pointer">
                    <img 
                       src={`${img}${img?.includes('unsplash') ? '?auto=format&fit=crop&q=80&w=600' : ''}`} 
                       alt="Gallery" 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-[#0A0807]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-[#A0988E] text-4xl font-light scale-50 group-hover:scale-100 transition-transform">Instagram</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'salon-elegance') {
    const salonImgs = k.slice(0, 4);
    return (
      <section className="w-full bg-white py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center">
           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-[#7A1E1E]">Follow Us</h4>
           <h2 className="text-4xl md:text-5xl font-serif italic text-[#8B0000] leading-tight mb-2">
             {title}
           </h2>
           <p className="text-[#77706B] mb-12 font-light uppercase tracking-widest text-[11px]">{content.subtitle}</p>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {salonImgs.map((img, idx) => (
                 <div key={idx} className="relative group overflow-hidden bg-[#FAF6F2] aspect-square cursor-pointer">
                    <img 
                       src={`${img}${img?.includes('unsplash') ? '?auto=format&fit=crop&q=80&w=600' : ''}`} 
                       alt="Instagram" 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-[#8B0000]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-white text-3xl font-bold">@</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  const defaultK = k.slice(0, 3);
  return (
    <section className="w-full bg-[#f4f7f6] py-24 px-6 md:px-16" style={{ fontFamily }}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
         <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Showcase</h4>
         <h2 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] mb-16 text-center tracking-tight">
           {title}
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {defaultK.map((img, idx) => (
               <div key={idx} className="relative group overflow-hidden rounded-3xl bg-slate-100 aspect-square shadow-xl border border-white">
                  <img 
                     src={`${img}${img?.includes('unsplash') ? '?auto=format&fit=crop&q=80&w=600' : ''}`} 
                     alt="Gallery" 
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
            ))}
         </div>
      </div>
    </section>
  );
}
