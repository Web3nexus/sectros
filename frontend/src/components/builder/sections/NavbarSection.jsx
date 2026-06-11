import React from 'react';
import { ShoppingBag, Menu, Search } from 'lucide-react';

export default function NavbarSection({ content, theme }) {
  const { layout = 'tastenest-dark', logo = 'SECTROS', buttonText = 'Book Now', phone = '' } = content;
  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  if (layout === 'coffee-house') {
    return (
      <nav className="w-full bg-[#120F0D] border-b border-white/5 flex items-center justify-between px-12 py-6 relative z-1000" style={{ fontFamily }}>
        {/* Left Links */}
        <div className="hidden md:flex items-center gap-8 text-[#A0988E] uppercase text-[10px] tracking-widest font-bold">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Shop</a>
          <a href="#" className="hover:text-white transition-colors">Menu</a>
        </div>

        {/* Center Ribbon Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 w-40 h-24 flex items-center justify-center text-center">
             <div className="absolute inset-0 bg-[#120F0D] border-b-4 border-[#3A2D23] rounded-b-3xl shadow-2xl" />
             <span className="relative z-10 text-xl font-black uppercase text-white tracking-widest px-4">{logo}</span>
        </div>

        {/* Right Links & Actions */}
        <div className="hidden md:flex items-center gap-8 text-[#A0988E] uppercase text-[10px] tracking-widest font-bold">
          <a href="#" className="hover:text-white transition-colors">Blog</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <Search size={16} className="cursor-pointer hover:text-white transition-colors" />
            <ShoppingBag size={16} className="cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </nav>
    );
  }

  if (layout === 'salon-elegance') {
    return (
      <header className="w-full relative z-1000" style={{ fontFamily }}>
        {/* Top Announcement Bar */}
        <div className="w-full text-white py-2 px-4 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold" style={{ backgroundColor: primaryColor }}>
          <span className="hidden md:block">Welcome to our premium beauty salon</span>
          <div className="flex items-center gap-6">
             <span className="flex items-center gap-2">Contact: {phone || '1-800-SALON'}</span>
             <a href="#" className="hover:opacity-80 transition-opacity">Book Appointment</a>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="w-full flex items-center justify-between px-6 lg:px-16 py-6 bg-[#FAF6F2] shadow-sm border-b border-[#F3DDCF]">
          <div className="flex items-center gap-8">
            <span className="text-3xl font-serif italic text-[#7A1E1E] tracking-tight">{logo}</span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Home', 'Services', 'About Us', 'Gallery', 'Contact'].map((link, idx) => (
              <a key={idx} href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-[12px] font-bold uppercase tracking-widest text-[#77706B] hover:text-[#8B0000] transition-colors relative group">
                {link}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-px bg-[#8B0000] transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <button className="px-8 py-3.5 border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold">
                {buttonText}
             </button>
             <button className="lg:hidden text-[#7A1E1E]">
                <Menu size={24} />
             </button>
          </div>
        </nav>
      </header>
    );
  }

  if (layout === 'hotel-boutique') {
    return (
      <header className="w-full bg-white relative z-1000 border-b border-[#EFE7DA]" style={{ fontFamily }}>
        <nav className="w-full flex items-center justify-between px-6 lg:px-16 py-6 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-serif tracking-tight text-[#262626] font-medium">{logo}</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-10">
            {['Home', 'Explore', 'Rooms', 'About', 'Contact'].map((link, idx) => (
              <a key={idx} href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-[13px] font-sans tracking-wide text-[#777777] hover:text-[#7C6A43] transition-colors uppercase">
                {link}
              </a>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-4">
             <button className="px-8 py-3.5 bg-[#7C6A43] text-white hover:bg-[#5F5132] transition-colors text-[11px] uppercase tracking-widest font-bold">
                {buttonText || 'Book Now'}
             </button>
             <button className="lg:hidden text-[#262626]">
                <Menu size={24} />
             </button>
          </div>
        </nav>
      </header>
    );
  }

  // TasteNest Dark & Light (same generic structure for nav)
  return (
    <nav className="w-full bg-white flex items-center justify-between px-4 lg:px-12 py-5 sticky top-0 z-1000 shadow-sm" style={{ fontFamily }}>
      {/* Logo Area */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor, color: 'white' }}>
           <span className="font-black italic text-lg leading-none">T</span>
        </div>
        <span className="text-2xl font-black tracking-tight text-foreground">
          {logo}
        </span>
      </div>

      {/* Main Links */}
      <div className="hidden lg:flex items-center gap-8">
        {['Home', 'About Us', 'Shop', 'Blog', 'Pages', 'Contact'].map((link, idx) => (
          <a key={idx} href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-[13px] font-bold text-slate-700 hover:text-black hover:-translate-y-0.5 transition-all flex items-center gap-1">
            {link} {['Home', 'Shop', 'Blog', 'Pages'].includes(link) && <span className="text-[8px] opacity-50">▼</span>}
          </a>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer hidden sm:block">
           <ShoppingBag size={20} className="text-slate-700" />
           <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-md shadow-green-500/30 bg-green-500">2</div>
        </div>
        <button 
          className="px-6 py-2.5 rounded text-[11px] font-black uppercase tracking-widest text-[#1E1E1E] transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
          style={{ backgroundColor: secondaryColor }}
        >
          {buttonText}
        </button>
        <button className="p-2 hidden lg:flex text-slate-700 hover:text-black hover:bg-slate-50 rounded-lg">
           <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
