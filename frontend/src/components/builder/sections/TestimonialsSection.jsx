import React from 'react';
import { Star, Quote, Play } from 'lucide-react';

export default function TestimonialsSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark', 
    title = 'Our Customer Feedbacks',
    reviews: externalReviews
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  const fallbackReviews = [
    { text: "Food was wonderful, great prices, and the waiters were very attentive. A great place to celebrate.", customer_name: "Mark Williams" },
    { text: "The atmosphere here is perfect for any occasion. Every visit feels like a celebration.", customer_name: "Sarah Jenkins" },
    { text: "Best coffee I've had in the city. The service is impeccable and the pastries are sublime.", customer_name: "Michael Chen" }
  ];

  const reviews = externalReviews?.length ? externalReviews : fallbackReviews;

  if (layout === 'coffee-house' && reviews[2]) {
    return (
      <section className="w-full bg-[#0A0807] py-24 px-6 md:px-12 border-t border-white/5" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div>
              <div className="flex text-[#A0988E] mb-6">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={24} fill="currentColor"/>)}</div>
               <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8 font-serif">{title}</h2>
               <p className="text-white/60 italic text-xl mb-4">"{reviews[2].text}"</p>
               <span className="text-[#A0988E] font-bold uppercase tracking-widest text-xs">{reviews[2].customer_name}</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
               <div className="h-48 bg-white/5 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544025162-8350dbde4ed5?auto=format&fit=crop&q=80')` }} />
               <div className="h-48 bg-white/5 rounded-2xl bg-cover bg-center mt-12" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80')` }} />
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'salon-elegance') {
    const rev = reviews[0] || fallbackReviews[0];
    return (
      <section className="w-full bg-[#FAF6F2] py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-4xl mx-auto text-center">
           <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-[#7A1E1E]">Client Love</h4>
           <h2 className="text-4xl md:text-5xl font-serif italic text-[#8B0000] leading-tight mb-16">{title}</h2>
           <div className="relative">
              <Quote size={60} className="text-[#F3DDCF] absolute -top-10 left-1/2 -translate-x-1/2 -z-10" />
              <div className="bg-white p-12 rounded-2xl shadow-xl shadow-[#E7BFA8]/20 border border-[#F3DDCF]">
                 <div className="flex justify-center text-[#8B0000] mb-6">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor"/>)}</div>
                 <p className="text-[#77706B] text-xl md:text-2xl italic leading-relaxed mb-8">"{rev.text}"</p>
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-cover bg-center mb-4 border-2 border-[#8B0000]" style={{ backgroundImage: `url('${rev.customer_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80'}')` }} />
                    <span className="font-bold text-[#7A1E1E] uppercase tracking-widest text-[11px]">- {rev.customer_name}</span>
                 </div>
              </div>
           </div>
           <div className="flex justify-center gap-4 mt-10">
              <button className="w-10 h-10 rounded-full border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white flex items-center justify-center transition-colors">←</button>
              <button className="w-10 h-10 rounded-full border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white flex items-center justify-center transition-colors">→</button>
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'hotel-boutique') {
    const guestReviews = reviews.length >= 3 ? reviews.slice(0, 3) : [
      { text: "An absolutely enchanting stay. The warm ambiance, impeccable service, and stunning views made this the most memorable trip of our lives.", customer_name: "James & Laura M.", location: "London, UK", customer_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" },
      { text: "The team went above and beyond to make our anniversary special. Every detail was perfected — from the room to the dining experience.", customer_name: "Sophie R.", location: "Paris, France", customer_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" },
      { text: "Boutique charm meets five-star luxury. Our favorite place to stay whenever we're in the city.", customer_name: "David C.", location: "New York, USA", customer_avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100" },
    ];

    return (
      <section className="w-full bg-[#FAF7F1] py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B9975B] mb-4 block">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#262626] leading-tight font-medium">{title}</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {guestReviews.map((rev, idx) => (
                <div key={idx} className="bg-white p-8 border border-[#EFE7DA] relative group hover:border-[#B9975B] transition-colors duration-300">
                   <div className="absolute top-0 left-0 w-full h-1 bg-[#EFE7DA] group-hover:bg-[#B9975B] transition-colors duration-300" />
                   <div className="flex text-[#B9975B] mb-6">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                   <p className="text-[#777777] text-sm leading-relaxed mb-8 italic font-sans">"{rev.text}"</p>
                   <div className="flex items-center gap-4 pt-4 border-t border-[#EFE7DA]">
                      <div className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-[#EFE7DA] flex-shrink-0" style={{ backgroundImage: `url(${rev.customer_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'})` }} />
                      <div>
                         <span className="block font-serif text-[#262626] font-medium text-sm">{rev.customer_name}</span>
                         <span className="text-[10px] uppercase tracking-widest text-[#B9975B] font-bold">{rev.location || ''}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  const rev = reviews[0] || fallbackReviews[0];
  return (
    <section className="w-full bg-[#111111] py-32 px-6 md:px-16" style={{ fontFamily }}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-32 items-center">
         <div className="w-full lg:w-1/2 relative h-[500px]">
            <div className="absolute top-0 right-10 w-2/3 h-4/5 rounded-4xl bg-slate-800 bg-cover bg-center border-4 border-[#111111] z-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80')` }} />
            <div className="absolute bottom-0 left-0 w-2/3 h-4/5 rounded-4xl bg-slate-700 bg-cover bg-center border-4 border-[#111111] z-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&q=80')` }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center z-30 cursor-pointer hover:scale-110 transition-transform">
               <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <Play size={16} className="text-[#F70A38] ml-1" />
               </div>
            </div>
         </div>
         <div className="w-full lg:w-1/2">
            <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Check Our Feedback</h4>
            <h2 className="text-4xl md:text-[3rem] font-black text-white leading-[1.05] mb-12 tracking-tight">{title}</h2>
            <div className="bg-[#1A1A1A] p-8 md:p-12 rounded-3xl border border-white/5 relative">
               <Quote size={40} className="text-[#FFC806]/20 absolute top-8 right-8" />
               <p className="text-white/80 text-lg mb-8 italic leading-relaxed">"{rev.text}"</p>
               <div className="flex items-center gap-4">
                  <div className="flex text-[#FFC806]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor"/>)}</div>
                  <span className="text-white font-bold">{rev.customer_name}</span>
               </div>
            </div>
            <div className="flex gap-4 mt-8">
               <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">←</button>
               <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">→</button>
            </div>
         </div>
      </div>
    </section>
  );
}
