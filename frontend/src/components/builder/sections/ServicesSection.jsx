import React from 'react';
import { Star, Coffee, Utensils, GlassWater, Beef } from 'lucide-react';

export default function ServicesSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark',
    title = '', 
    subtitle = '', 
    author = '',
    authorRole = '',
    services: apiServices,
    rooms: apiRooms
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  const fallbackCoffeeItems = [
    { title: 'Best of the Day', sub: 'Special Brew', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf' },
    { title: 'Coffee Latte', sub: 'Artisanal', img: 'https://images.unsplash.com/photo-1572442388796-11668aa44f26' },
    { title: 'Black Coffee', sub: 'Strong & Pure', img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7' },
    { title: 'All Premium Tea', sub: 'Herbal Blend', img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9' }
  ];

  const coffeeServices = apiServices?.length ? apiServices.map(s => ({ title: s.name, sub: s.description?.substring(0, 30), img: s.image_url })) : fallbackCoffeeItems;

  if (layout === 'coffee-house') {
    return (
      <section className="w-full bg-[#0A0807] py-24 px-6 md:px-12 border-t border-white/5" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
           <h2 className="text-3xl md:text-5xl font-black text-white text-center leading-tight mb-16 max-w-3xl font-serif">
             {title}
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {coffeeServices.slice(0, 4).map((item, idx) => (
                 <div key={idx} className="group relative overflow-hidden rounded-2xl bg-[#120F0D] border border-white/5 p-4 hover:border-[#A0988E]/30 transition-all">
                    <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-[#A0988E] text-[10px] uppercase font-bold tracking-widest mb-4">{item.sub}</p>
                    <div className="w-full h-32 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${item.img || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf'}?auto=format&fit=crop&w=400&q=80)` }} />
                    <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#A0988E] group-hover:text-white transition-colors">
                      <span className="text-xl">+</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'tastenest-light') {
    return (
      <section className="w-full bg-[#F8F9FA] py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
             <h4 className="text-[#F70A38] text-sm font-black uppercase tracking-widest mb-4">Core Features</h4>
             <h2 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] mb-6">
                {title}
             </h2>
             <p className="text-muted-foreground font-medium leading-relaxed max-w-sm">Diam sit amet nisl suscipit adipiscing bibendum est ultricies integer.</p>
          </div>
          
          <div className="flex-2 grid grid-cols-2 md:grid-cols-4 gap-8">
             {[
               { t: 'After You Buy', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
               { t: 'Free Gift For You', icon: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' },
               { t: 'Discount 20%', icon: 'M11 11h2v2h-2zM11 15h2v2h-2zM15 11h2v2h-2zM15 15h2v2h-2zM7 11h2v2H7zM7 15h2v2H7z' },
               { t: 'Secure Payment', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }
             ].map((sf, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative overflow-hidden group hover:scale-110 transition-transform" style={{ backgroundColor: secondaryColor }}>
                      <div className="absolute inset-0 opacity-20 border-8 border-dashed border-white rounded-full animate-[spin_10s_linear_infinite]" />
                      <svg className="w-8 h-8 text-foreground relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d={sf.icon}/>
                      </svg>
                   </div>
                   <h4 className="font-black text-foreground mb-2">{sf.t}</h4>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Magna etiam</p>
                </div>
             ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'salon-elegance') {
    const svc = apiServices?.length ? apiServices : [];
    const cats = svc.length ? [{ name: svc.slice(0, Math.ceil(svc.length/2)).map(s => ({ n: s.name, p: `$${s.price || '0'}`, d: s.description?.substring(0, 40) })), catName: 'Our Services' }] : [];

    return (
      <section className="w-full bg-white py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-[#77706B]">— {title} —</h4>
              <h2 className="text-4xl md:text-5xl font-serif italic text-[#7A1E1E] leading-tight max-w-2xl mx-auto">
                 {subtitle}
              </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
              {svc.length ? (
                <>
                  <div>
                     <h3 className="text-2xl font-serif italic text-[#8B0000] border-b border-[#F3DDCF] pb-4 mb-6">Services</h3>
                     <div className="space-y-6">
                        {svc.slice(0, Math.ceil(svc.length/2)).map((item, idx) => (
                          <div key={idx} className="flex flex-col group">
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-[#7A1E1E] tracking-tight group-hover:text-[#8B0000] transition-colors">{item.name}</h4>
                                <div className="flex-1 border-b border-dashed border-[#E7BFA8] mx-4" />
                                <span className="font-serif italic text-[#8B0000] font-bold">${item.price || '0'}</span>
                             </div>
                             <p className="text-[11px] text-[#77706B] uppercase tracking-widest">{item.description?.substring(0, 50)}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-serif italic text-[#8B0000] border-b border-[#F3DDCF] pb-4 mb-6">More</h3>
                     <div className="space-y-6">
                        {svc.slice(Math.ceil(svc.length/2)).map((item, idx) => (
                          <div key={idx} className="flex flex-col group">
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-[#7A1E1E] tracking-tight group-hover:text-[#8B0000] transition-colors">{item.name}</h4>
                                <div className="flex-1 border-b border-dashed border-[#E7BFA8] mx-4" />
                                <span className="font-serif italic text-[#8B0000] font-bold">${item.price || '0'}</span>
                             </div>
                             <p className="text-[11px] text-[#77706B] uppercase tracking-widest">{item.description?.substring(0, 50)}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                     <h3 className="text-2xl font-serif italic text-[#8B0000] border-b border-[#F3DDCF] pb-4 mb-6">Make up</h3>
                     <div className="space-y-6">
                        {[{ n: 'Bridal Makeup', p: '$120.00', d: 'Full face with premium products' }, { n: 'Evening Glam', p: '$85.00', d: 'Bold and elegant look' }, { n: 'Natural Glow', p: '$60.00', d: 'Subtle everyday enhancement' }].map((item, idx) => (
                          <div key={idx} className="flex flex-col group">
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-[#7A1E1E] tracking-tight group-hover:text-[#8B0000] transition-colors">{item.n}</h4>
                                <div className="flex-1 border-b border-dashed border-[#E7BFA8] mx-4" />
                                <span className="font-serif italic text-[#8B0000] font-bold">{item.p}</span>
                             </div>
                             <p className="text-[11px] text-[#77706B] uppercase tracking-widest">{item.d}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-serif italic text-[#8B0000] border-b border-[#F3DDCF] pb-4 mb-6">Hair Styling</h3>
                     <div className="space-y-6">
                        {[{ n: "Women's Haircut", p: '$45.00', d: 'Includes wash and styling' }, { n: 'Balayage Color', p: '$150.00', d: 'Hand-painted highlights' }, { n: 'Keratin Treatment', p: '$200.00', d: 'Smooth and frizz-free finish' }].map((item, idx) => (
                          <div key={idx} className="flex flex-col group">
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-[#7A1E1E] tracking-tight group-hover:text-[#8B0000] transition-colors">{item.n}</h4>
                                <div className="flex-1 border-b border-dashed border-[#E7BFA8] mx-4" />
                                <span className="font-serif italic text-[#8B0000] font-bold">{item.p}</span>
                             </div>
                             <p className="text-[11px] text-[#77706B] uppercase tracking-widest">{item.d}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-serif italic text-[#8B0000] border-b border-[#F3DDCF] pb-4 mb-6">SPA Procedures</h3>
                     <div className="space-y-6">
                        {[{ n: 'Swedish Massage', p: '$90.00', d: '60 minutes relaxation' }, { n: 'Deep Tissue', p: '$110.00', d: 'Muscle tension relief' }, { n: 'Aromatherapy', p: '$95.00', d: 'Essential oils therapy' }].map((item, idx) => (
                          <div key={idx} className="flex flex-col group">
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-[#7A1E1E] tracking-tight group-hover:text-[#8B0000] transition-colors">{item.n}</h4>
                                <div className="flex-1 border-b border-dashed border-[#E7BFA8] mx-4" />
                                <span className="font-serif italic text-[#8B0000] font-bold">{item.p}</span>
                             </div>
                             <p className="text-[11px] text-[#77706B] uppercase tracking-widest">{item.d}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-serif italic text-[#8B0000] border-b border-[#F3DDCF] pb-4 mb-6">Nail Care</h3>
                     <div className="space-y-6">
                        {[{ n: 'Classic Manicure', p: '$30.00', d: 'Nail shaping and polish' }, { n: 'Spa Pedicure', p: '$45.00', d: 'Exfoliation and massage' }, { n: 'Gel Extensions', p: '$65.00', d: 'Long-lasting artificial nails' }].map((item, idx) => (
                          <div key={idx} className="flex flex-col group">
                             <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-[#7A1E1E] tracking-tight group-hover:text-[#8B0000] transition-colors">{item.n}</h4>
                                <div className="flex-1 border-b border-dashed border-[#E7BFA8] mx-4" />
                                <span className="font-serif italic text-[#8B0000] font-bold">{item.p}</span>
                             </div>
                             <p className="text-[11px] text-[#77706B] uppercase tracking-widest">{item.d}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                </>
              )}
           </div>

           <div className="mt-20 flex justify-center">
              <button className="px-12 py-4 border border-[#8B0000] text-[#8B0000] uppercase text-[10px] font-bold tracking-widest hover:bg-[#8B0000] hover:text-white transition-all">
                 View Full Price List
              </button>
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'hotel-boutique') {
    const rooms = apiRooms?.length ? apiRooms.map(r => ({ name: r.name, desc: r.description, price: `$${r.price_per_night || r.price}`, rating: 5, img: r.image_url || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39', amenities: r.amenities || [] })) : [
      { name: 'The Royal Suite', desc: 'Indulge in unmatched luxury with panoramic city views and butler service.', price: '$450', rating: 5, img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=600', amenities: ['King Bed', 'City View', 'Butler'] },
      { name: 'Deluxe Double Room', desc: 'Spacious and elegantly furnished with a cozy sitting area and en-suite bathroom.', price: '$220', rating: 5, img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600', amenities: ['Double Bed', 'Garden View', 'Spa Bath'] },
      { name: 'Standard Suite', desc: 'A perfect blend of comfort and style for the discerning traveler.', price: '$180', rating: 4, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=600', amenities: ['Queen Bed', 'Pool View', 'Mini Bar'] },
    ];

    return (
      <section className="w-full bg-white py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B9975B] mb-4 block">Our Accommodations</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#262626] leading-tight font-medium max-w-xl mx-auto">
                {title}
              </h2>
              <p className="text-[#777777] mt-4 font-sans">{subtitle}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rooms.slice(0, 3).map((room, idx) => (
                <div key={idx} className="group bg-white border border-[#EFE7DA] overflow-hidden hover:shadow-2xl hover:shadow-[#EFE7DA] transition-all duration-500">
                   <div className="relative overflow-hidden aspect-[4/3]">
                      <img src={room.img} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                         <span className="text-[#7C6A43] font-bold text-sm">{room.price}<span className="text-[#777777] font-normal text-xs">/night</span></span>
                      </div>
                   </div>
                   <div className="p-6">
                      <div className="flex text-[#B9975B] mb-3">
                         {Array.from({ length: room.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                      <h3 className="text-xl font-serif text-[#262626] font-medium mb-2">{room.name}</h3>
                      <p className="text-[#777777] text-sm leading-relaxed mb-4 font-sans">{room.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                         {(room.amenities || []).slice(0, 3).map((a, i) => (
                           <span key={i} className="text-[9px] uppercase tracking-widest font-bold text-[#7C6A43] bg-[#FAF7F1] px-3 py-1 border border-[#EFE7DA]">{a}</span>
                         ))}
                      </div>
                       <button className="w-full py-3.5 text-white uppercase text-[10px] font-bold tracking-widest transition-colors hover:opacity-80"
                          style={{ backgroundColor: primaryColor }}>
                          Book Now
                       </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="flex justify-center mt-12">
              <button className="px-12 py-4 border border-[#7C6A43] text-[#7C6A43] uppercase text-[10px] font-bold tracking-widest hover:bg-[#7C6A43] hover:text-white transition-colors">
                 View All Rooms
              </button>
           </div>
        </div>
      </section>
    );
  }

  const serviceCards = apiServices?.length ? apiServices.slice(0, 3).map(s => ({ t: s.name, img: s.image_url })) : [
    { t: 'Restaurant', img: 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5' },
    { t: 'Cocktail Bar', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', mt: 'md:mt-12' },
    { t: 'Private Dining', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', mt: 'md:mt-0' }
  ];

  return (
    <section className="w-full bg-white py-24 px-6 md:px-16" style={{ fontFamily }}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        <div className="w-full lg:w-1/3">
           <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">About The Food Restaurant</h4>
           <h2 className="text-4xl md:text-[3rem] font-black text-foreground leading-[1.05] mb-6 tracking-tight">
             {title}
           </h2>
           <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
             {subtitle}
           </p>
           
           {author && (
              <div className="flex items-center gap-4 border-t border-border pt-6">
                 <div className="w-12 h-12 rounded-full border-2 border-white shadow bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80')` }} />
                 <div>
                   <h5 className="font-black text-foreground">{author}</h5>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase">{authorRole}</p>
                 </div>
              </div>
           )}
        </div>

        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
           {serviceCards.map((card, idx) => (
             <div key={idx} className={`relative rounded-3xl overflow-hidden h-80 shadow-2xl border-4 border-slate-900 group ${card.mt || ''}`}>
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url(${card.img || 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5'}?auto=format&fit=crop&w=600&q=80)` }} />
                <div className="absolute inset-x-0 bottom-0 p-4">
                   <div className="bg-[#FFC806] rounded-2xl py-3 text-center transition-transform group-hover:-translate-y-2">
                     <span className="font-black text-foreground uppercase tracking-widest text-sm">{card.t}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-24 flex flex-wrap justify-center gap-6">
         {[
           { icon: <div className="w-6 h-6 border-2 border-current rounded-full" />, label: 'Dessert', active: true },
           { icon: <Beef size={24} />, label: 'Steak' },
           { icon: <Coffee size={24} />, label: 'Coffee' },
           { icon: <Utensils size={24} />, label: 'Burger' }
         ].map((cat, idx) => (
           <div key={idx} className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${cat.active ? 'bg-[#F70A38] text-white shadow-xl shadow-red-500/30 -translate-y-2' : 'bg-white text-muted-foreground border border-border hover:border-[#F70A38] hover:text-[#F70A38]'}`}>
              {cat.icon}
              <span className="font-black text-xs uppercase tracking-widest leading-none">{cat.label}</span>
           </div>
         ))}
      </div>
    </section>
  );
}
