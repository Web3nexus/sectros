import React from 'react';
import { Target, Shield, HeartHandshake } from 'lucide-react';

export default function AboutSection({ content, theme }) {
  const { 
    layout = 'tastenest-light', 
    title = 'Welcome To The TasteNest', 
    subtitle = 'A legacy of flavor and hospitality.', 
    text = 'Diam sit amet nisl suscipit adipiscing bibendum est ultricies integer. Dictumst quisque sagittis purus sit amet. Viverra justo nec ultrices dui sapien.', 
    imageUrl = 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80'
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  if (layout === 'coffee-house') {
    return (
      <section className="w-full bg-[#120F0D] py-24 px-6 md:px-12 border-t border-white/5" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
           
           <div className="w-full lg:w-1/2 flex gap-4">
              <div className="w-1/2 h-[450px] bg-white/5 rounded-3xl bg-cover bg-center mt-12" style={{ backgroundImage: `url(${imageUrl})` }} />
              <div className="w-1/2 h-[450px] bg-white/5 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80')` }} />
           </div>

           <div className="w-full lg:w-1/2">
              <div className="flex items-center gap-4 opacity-80 mb-4">
                <span className="text-[#A0988E] text-[10px] uppercase tracking-[0.3em] font-bold">About Us</span>
                <div className="flex-1 h-px bg-[#A0988E]" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8 font-serif">
                We Make The Best <br/> Coffee Process
              </h2>
              <p className="text-[#A0988E] text-lg leading-relaxed mb-8">
                {text}
              </p>
              
              <div className="flex flex-col gap-6 mb-10">
                 <div className="flex items-start gap-4">
                    <div className="w-4 h-4 mt-1 rounded-sm bg-[#A0988E] shrink-0" />
                    <p className="text-white font-bold">High Quality Coffee Beans</p>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-4 h-4 mt-1 rounded-sm bg-[#A0988E] shrink-0" />
                    <p className="text-white font-bold">Expert Baristas & Roasting</p>
                 </div>
              </div>

              <button className="px-10 py-4 bg-[#A0988E] text-[#0A0807] font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white transition-colors">
                 Read More
              </button>
           </div>
        </div>
      </section>
    );
  }

  // TasteNest Light
  return (
    <section className="w-full bg-[#f4f7f6] py-32 px-6 md:px-16 overflow-hidden" style={{ fontFamily }}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
        
        {/* Left Side: Overlapping Images */}
        <div className="w-full lg:w-1/2 relative h-[500px]">
           <div className="absolute top-0 right-10 w-[70%] h-[80%] rounded-[3rem] bg-white border-8 border-[#f4f7f6] shadow-xl overflow-hidden z-10">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Interior" />
           </div>
           <div className="absolute bottom-0 left-0 w-[55%] h-[60%] rounded-[3rem] bg-white border-8 border-[#f4f7f6] shadow-2xl overflow-hidden z-20">
              <img src="https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Food" />
           </div>
           
           {/* Floating Badge */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F70A38] text-white p-6 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg shadow-red-500/30 z-30 transform -rotate-12 animate-pulse">
              <span className="text-3xl font-black leading-none mb-1">15+</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-center">Years of<br/>Experience</span>
           </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full lg:w-1/2">
           <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">About Story</h4>
           <h2 className="text-4xl md:text-6xl font-black text-foreground leading-[1.05] mb-8 tracking-tight">
             {title}
           </h2>
           <p className="text-muted-foreground text-lg leading-relaxed mb-8">
             {text}
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                { i: <Target size={24} />, t: 'Fresh Ingredients' },
                { i: <Shield size={24} />, t: 'Expert Chefs' },
                { i: <HeartHandshake size={24} />, t: 'Best Service' }
              ].map((ft, idx) => (
                 <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
                    <div className="w-12 h-12 rounded-full bg-[#f4f7f6] flex items-center justify-center text-[#F70A38]">
                       {ft.i}
                    </div>
                    <span className="font-bold text-foreground">{ft.t}</span>
                 </div>
              ))}
           </div>

           <button className="px-10 py-5 bg-[#F70A38] text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-card transition-colors shadow-xl shadow-red-500/20">
              Discover More
           </button>
        </div>

      </div>
    </section>
  );
}
