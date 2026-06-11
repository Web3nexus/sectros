import React from 'react';
import { Smartphone, Download } from 'lucide-react';

export default function CTABannerSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark', 
    title = '', 
    subtitle = '' 
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  if (layout === 'tastenest-light') {
    return (
      <section className="w-full bg-[#F70A38] py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8">
              {title}
            </h2>
            <button className="px-8 py-4 rounded-xl text-[#F70A38] bg-white font-black uppercase text-xs tracking-widest shadow-lg hover:scale-105 transition-transform">
               Discover More
            </button>
        </div>
      </section>
    );
  }

  // TasteNest Dark
  return (
    <section className="w-full bg-[#111111] py-24 px-6 md:px-16 overflow-hidden" style={{ fontFamily }}>
      <div className="max-w-7xl mx-auto rounded-[3rem] bg-[#1A1A1A] border border-white/5 overflow-hidden flex flex-col md:flex-row relative">
         {/* Decorative Element */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F70A38] rounded-full mix-blend-multiply filter blur-[200px] opacity-20 pointer-events-none" />

         <div className="w-full md:w-1/2 p-12 lg:p-20 flex flex-col justify-center z-10">
            <h4 className="text-[#FFC806] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Download App</h4>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-white leading-[1.05] mb-8 tracking-tight">
              {title}
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-md">
              {subtitle}
            </p>

            <div className="flex gap-4">
               {/* App Store Button */}
               <button className="flex items-center gap-3 bg-white text-foreground px-6 py-3 rounded-2xl hover:bg-slate-200 transition-colors">
                  <Download size={24} className="text-foreground" />
                  <div className="text-left">
                     <p className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">Download on the</p>
                     <p className="text-sm font-black leading-none">App Store</p>
                  </div>
               </button>
               {/* Google Play Button */}
               <button className="flex items-center gap-3 bg-transparent border border-white/20 text-white px-6 py-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <Smartphone size={24} className="text-white" />
                  <div className="text-left">
                     <p className="text-[8px] uppercase font-bold tracking-widest text-white/50">Get it on</p>
                     <p className="text-sm font-black leading-none">Google Play</p>
                  </div>
               </button>
            </div>
         </div>

         {/* Right Phone Mockup - Simple CSS visual */}
         <div className="w-full md:w-1/2 relative min-h-[400px] flex items-end justify-center z-10">
            <div className="w-[280px] h-[500px] bg-[#0A0A0A] rounded-t-[3rem] border-12 border-[#2A2A2A] border-b-0 relative shadow-2xl flex flex-col overflow-hidden translate-y-10 group cursor-pointer hover:-translate-y-4 transition-transform duration-500">
               {/* Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#2A2A2A] rounded-b-xl z-20" />
               <div className="flex-1 bg-linear-to-br from-[#111] to-[#F70A38] bg-cover bg-center p-6 flex flex-col justify-end" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544025162-8350dbde4ed5?auto=format&fit=crop&w=400&q=80')` }}>
                  <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl shadow-2xl">
                     <h5 className="font-bold text-white mb-1">Order Summary</h5>
                     <p className="text-xs text-white/60">Your delicious food is on the way!</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </section>
  );
}
