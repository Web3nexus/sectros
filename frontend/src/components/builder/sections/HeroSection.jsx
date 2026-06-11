import React from 'react';
import { Play, ArrowRight, Star, Video } from 'lucide-react';

export default function HeroSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark',
    title = '', 
    subtitle = '', 
    imageUrl = '', 
    buttonText = '',
    highlightCard = null
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  const renderStars = () => (
     <div className="flex text-[#FFC806] mt-1"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div>
  );

  if (layout === 'coffee-house') {
    return (
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden" style={{ fontFamily }}>
        {/* Dark Background */}
        <div className="absolute inset-0 bg-[#0A0807]">
           <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: `url(${imageUrl})` }} />
           <div className="absolute inset-0 bg-linear-to-t from-[#0A0807] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-6">
           {/* Decorative Ribbon above text */}
           <div className="mb-6 flex items-center gap-4 opacity-80">
              <div className="w-16 h-px bg-[#A0988E]" />
              <img src="/api/placeholder/40/40" alt="coffee icon" className="w-8 h-8 opacity-70 filter invert" />
              <div className="w-16 h-px bg-[#A0988E]" />
           </div>
           
           <h1 className="text-6xl md:text-[8rem] font-black tracking-widest uppercase text-white mb-6 drop-shadow-2xl">
             {title}
           </h1>
           <p className="text-[#A0988E] text-lg max-w-xl mx-auto mb-10 tracking-widest italic font-light">
             {subtitle}
           </p>

           <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 rounded-full border border-white/10 w-full max-w-md">
              <input type="text" placeholder="Search product..." className="bg-transparent border-none outline-none text-white px-4 py-2 w-full placeholder:text-[#A0988E]" />
              <button className="bg-white text-black px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#A0988E] hover:text-white transition-colors">
                {buttonText}
              </button>
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'tastenest-light') {
    return (
      <section className="relative w-full min-h-[90vh] bg-[#F8F9FA] flex items-center overflow-hidden px-6 lg:px-16" style={{ fontFamily }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-7xl mx-auto relative z-10">
           {/* Left Content */}
           <div className="flex flex-col justify-center pt-20">
              <h1 className="text-5xl md:text-[5.5rem] font-black text-foreground leading-[1.1] mb-6 tracking-tight">
                 Best Food for <span className="relative inline-block"><span className="relative z-10">Best Restaurants</span><div className="absolute inset-y-2 -inset-x-2 bg-yellow-300 z-0 opacity-40 rounded-lg skew-x-12" /></span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-md mb-10 leading-relaxed">
                {subtitle}
              </p>
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 max-w-lg mb-8 border border-border">
                  <input type="text" placeholder="Date" className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 outline-none text-sm font-bold" />
                  <input type="text" placeholder="Time" className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 outline-none text-sm font-bold" />
                  <button className="px-8 py-3 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-transform" style={{ backgroundColor: primaryColor }}>
                    Reserve
                  </button>
              </div>
           </div>
        </div>

        {/* Right Massive Decorative Circle */}
        <div className="absolute top-0 right-0 w-[55vw] h-full translate-x-[15%] rounded-l-full shadow-2xl overflow-visible z-0" style={{ backgroundColor: primaryColor }}>
            <div className="absolute top-10 -left-20 w-[400px] h-[400px] rounded-full border-8 border-white bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544025162-8350dbde4ed5?auto=format&fit=crop&q=80')` }} />
            <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full border-8 border-white bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80')` }} />

            {/* Overlapping feature card */}
            <div className="absolute top-[40%] -left-32 bg-white rounded-3xl p-6 shadow-2xl border border-border max-w-xs flex gap-4 items-center">
               <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center font-black text-xs text-center leading-tight">20%<br/>OFF</div>
               <div>
                 <h4 className="font-black text-foreground leading-none mb-1">Good Food Steak</h4>
                 <p className="text-[10px] uppercase font-bold text-muted-foreground">& Great Restaurant</p>
               </div>
            </div>
        </div>
      </section>
    );
  }

  if (layout === 'salon-elegance') {
    return (
      <section className="relative w-full min-h-[85vh] bg-[#FAF6F2] flex items-center justify-center overflow-hidden px-6 lg:px-20 py-20" style={{ fontFamily }}>
        <div className="absolute inset-0 z-0 flex justify-center">
            <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-[#E7BFA8]/20 blur-[100px] absolute top-10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-7xl mx-auto relative z-10 items-center">
           {/* Left Content */}
           <div className="flex flex-col justify-center text-center lg:text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: primaryColor }}>Premium Salon Experience</h4>
              <h1 className="text-5xl md:text-7xl font-serif italic text-[#7A1E1E] leading-[1.1] mb-8 tracking-tight">
                {title}
              </h1>
              <p className="text-[#77706B] text-lg max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
                {subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                 <button className="px-10 py-4 text-white uppercase text-[10px] font-bold tracking-widest hover:bg-[#7A1E1E] transition-colors shadow-xl" style={{ backgroundColor: primaryColor }}>
                   {buttonText}
                 </button>
                 <button className="flex items-center gap-3 text-[#77706B] uppercase text-[10px] font-bold tracking-widest hover:text-[#7A1E1E] transition-colors">
                    <div className="w-12 h-12 rounded-full border border-[#F3DDCF] flex items-center justify-center">
                       <Play size={12} fill="currentColor" />
                    </div>
                    Watch Video
                 </button>
              </div>

              {/* Category Cards inside Hero */}
              {content.categories && (
                <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {content.categories.map((cat, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-sm border border-[#F3DDCF] rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-[#FAF6F2] flex items-center justify-center mb-3 group-hover:bg-[#F3DDCF] transition-colors">
                        <Star size={14} className="text-[#8B0000]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A1E1E]">{cat}</span>
                    </div>
                  ))}
                </div>
              )}
           </div>

           {/* Right Image */}
           <div className="relative flex justify-center lg:justify-end mt-10 lg:mt-0">
               <div className="relative w-full max-w-[500px] aspect-[3/4] rounded-t-full overflow-hidden shadow-2xl border-8 border-white bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#8B0000]/20 to-transparent mix-blend-overlay" />
               </div>
               
               {/* Decorative Element */}
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full p-2 shadow-2xl border border-[#F3DDCF] hidden md:block">
                  <div className="w-full h-full rounded-full border border-dashed border-[#E7BFA8] flex items-center justify-center text-center p-4">
                     <div>
                        <span className="block text-2xl font-serif text-[#8B0000] italic">10+</span>
                        <span className="text-[8px] uppercase font-bold tracking-widest text-[#77706B]">Years Experience</span>
                     </div>
                  </div>
               </div>
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'hotel-boutique') {
    return (
      <section className="relative w-full bg-[#FAF7F1] pt-20 pb-32 px-6 lg:px-16" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           {/* Left Content */}
           <div className="flex flex-col justify-center text-center lg:text-left z-10">
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] mb-6 text-[#B9975B]">Welcome to Boutique Haven</span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#262626] leading-[1.1] mb-8 font-medium">
                {title}
              </h1>
              <p className="text-[#777777] text-lg lg:text-xl font-sans max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                {subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                 <button className="px-10 py-4 bg-[#7C6A43] text-white uppercase text-[11px] font-bold tracking-widest hover:bg-[#5F5132] transition-colors w-full sm:w-auto">
                   {content.buttonTextPrimary || 'Book Now'}
                 </button>
                 <button className="px-10 py-4 bg-transparent border border-[#7C6A43] text-[#7C6A43] uppercase text-[11px] font-bold tracking-widest hover:bg-[#EFE7DA] transition-colors w-full sm:w-auto">
                   {buttonText || 'Explore'}
                 </button>
              </div>
           </div>

           {/* Right Image */}
           <div className="relative w-full h-[600px] lg:h-[700px] z-0">
               <div className="absolute inset-0 rounded-t-[200px] rounded-b-lg overflow-hidden shadow-2xl">
                  <img src={imageUrl} alt="Hero" className="w-full h-full object-cover" />
               </div>
               {/* Decorative badge */}
               <div className="absolute top-10 right-0 lg:-right-8 w-32 h-32 bg-[#EFE7DA] rounded-full flex flex-col items-center justify-center p-4 shadow-xl text-center border-4 border-white animate-pulse">
                  <Star size={20} className="text-[#B9975B] mb-1" fill="currentColor" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5132]">5-Star</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#5F5132]">Luxury</span>
               </div>
           </div>
        </div>

        {/* Quick Booking Bar */}
        <div className="max-w-6xl mx-auto -mt-20 relative z-20 hidden md:block">
           <div className="bg-white p-4 shadow-2xl rounded-2xl border border-[#EFE7DA]">
              <form className="flex items-center gap-2">
                 <div className="flex-1 px-4 py-2 border-r border-[#EFE7DA]">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777777] mb-1">Check In</label>
                    <input type="date" className="w-full text-sm outline-none bg-transparent font-medium text-[#262626]" />
                 </div>
                 <div className="flex-1 px-4 py-2 border-r border-[#EFE7DA]">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777777] mb-1">Check Out</label>
                    <input type="date" className="w-full text-sm outline-none bg-transparent font-medium text-[#262626]" />
                 </div>
                 <div className="flex-1 px-4 py-2 border-r border-[#EFE7DA]">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777777] mb-1">Guests</label>
                    <select className="w-full text-sm outline-none bg-transparent font-medium text-[#262626]">
                       <option>2 Adults, 0 Children</option>
                       <option>1 Adult</option>
                       <option>2 Adults, 1 Child</option>
                    </select>
                 </div>
                 <div className="flex-1 px-4 py-2">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#777777] mb-1">Room Type</label>
                    <select className="w-full text-sm outline-none bg-transparent font-medium text-[#262626]">
                       <option>All Rooms</option>
                       <option>Standard</option>
                       <option>Suite</option>
                    </select>
                 </div>
                 <button type="button" className="px-8 py-5 bg-[#7C6A43] text-white uppercase text-[11px] font-bold tracking-widest hover:bg-[#5F5132] transition-colors rounded-xl h-full flex items-center justify-center min-w-[160px]">
                    Check Availability
                 </button>
              </form>
           </div>
        </div>
      </section>
    );
  }

  // TasteNest Dark (Home-1.png)
  return (
    <section className="relative w-full h-[90vh] bg-[#111111] flex items-center overflow-hidden px-6 lg:px-20" style={{ fontFamily }}>
      {/* Background Setup */}
      <div className="absolute right-0 top-0 w-1/2 h-full">
          <div className="absolute inset-0 bg-linear-to-r from-[#111111] via-[#111111]/80 to-transparent z-10" />
         <div className="absolute inset-0 bg-cover bg-center z-0 opacity-80" style={{ backgroundImage: `url(${imageUrl})` }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-7xl mx-auto relative z-20">
        {/* Left Content */}
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl md:text-[5rem] font-black text-white leading-[1.05] mb-6 tracking-tight">
            {title.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mb-10 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex items-center gap-6">
            <button 
              className="px-8 py-4 rounded-full text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              {buttonText}
            </button>
            <button className="flex items-center gap-3 text-white font-black uppercase text-xs tracking-widest group">
               <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-white transition-colors">
                  <Play size={14} fill="currentColor" />
               </div>
               Video
            </button>
          </div>
        </div>

        {/* Right Content / Highlight Card */}
        <div className="hidden lg:flex items-end justify-center pb-20 relative">
          {highlightCard && (
            <div className="absolute bottom-10 right-0 bg-[#1A1A1A] rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-4 animate-bounce-slow">
               <div className="absolute -top-3 right-4 bg-[#F70A38] text-white text-[8px] font-black uppercase px-2 py-1 rounded-full tracking-widest shadow-sm">
                  {highlightCard.label}
               </div>

               <div>
                 <span className="text-[#FFC806] font-black text-xl leading-none">{highlightCard.price}</span>
                 <h4 className="text-white font-black text-sm tracking-tight">{highlightCard.title}</h4>
                 {renderStars()}
               </div>

               {highlightCard.image && (
                 <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${highlightCard.image})` }} />
               )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

