import React from 'react';
import {Facebook, Twitter, Instagram, Send, Briefcase} from 'lucide-react';

const YoutubeIcon = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/>
  </svg>
);

const TikTokIcon = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

export default function FooterSection({ content, theme, socialLinks }) {
  const { 
    layout = 'tastenest-dark', 
    title = 'SECTROS', 
    subtitle = 'Mastering the art of hospitality.',
    phone = '+1 (555) 012-3456'
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  const socialItems = [
    { key: 'facebook', url: socialLinks?.facebook_url || socialLinks?.social_facebook || '', icon: Facebook, label: 'Facebook' },
    { key: 'twitter', url: socialLinks?.twitter_url || socialLinks?.social_twitter || '', icon: Twitter, label: 'Twitter' },
    { key: 'instagram', url: socialLinks?.instagram_url || socialLinks?.social_instagram || '', icon: Instagram, label: 'Instagram' },
    { key: 'youtube', url: socialLinks?.youtube_url || socialLinks?.social_youtube || '', icon: YoutubeIcon, label: 'YouTube' },
    { key: 'tiktok', url: socialLinks?.tiktok_url || socialLinks?.social_tiktok || '', icon: TikTokIcon, label: 'TikTok' },
  ].filter(s => s.url);

  if (layout === 'coffee-house') {
    return (
      <footer className="w-full bg-[#120F0D] pt-24 pb-8 px-6 md:px-12 border-t border-white/5" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 justify-between mb-24">
           {/* Left */}
           <div className="w-full md:w-1/3">
              <h2 className="text-3xl font-black text-white mb-6 font-serif">{title}</h2>
              <p className="text-[#A0988E] mb-8 text-sm leading-relaxed">{subtitle}</p>
               <div className="flex gap-4">
                  {socialItems.map(s => {
                    const Icon = s.icon;
                    return <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#A0988E] hover:bg-white hover:text-black transition-colors"><Icon size={16}/></a>;
                  })}
               </div>
           </div>
           
           {/* Center */}
           <div className="w-full md:w-1/4">
              <h3 className="text-white font-bold mb-6 text-lg">Contact Us</h3>
              <p className="text-[#A0988E] mb-4 text-sm">{subtitle}</p>
              <p className="text-[#A0988E] font-black">{phone}</p>
              <p className="text-[#A0988E] text-sm mt-4">support@sectros.com</p>
           </div>

           {/* Right */}
           <div className="w-full md:w-1/3">
              <h3 className="text-white font-bold mb-6 text-lg">Newsletter</h3>
              <p className="text-[#A0988E] mb-4 text-sm">Subscribe our newsletter to get more updates.</p>
              <div className="flex bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                 <input type="email" placeholder="Email Address" className="w-full bg-transparent px-4 outline-none text-[#A0988E] text-sm" />
                 <button className="bg-[#A0988E] text-[#0A0807] px-4 py-2 rounded-full hover:bg-white transition-colors">
                    <Send size={16} />
                 </button>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[#A0988E] text-xs font-bold uppercase tracking-widest gap-4">
           <span>Copyright © {new Date().getFullYear()} {localStorage.getItem('platform_name') || 'Sectros'}</span>
           <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
           </div>
        </div>
      </footer>
    );
  }

  if (layout === 'salon-elegance') {
    return (
      <footer className="w-full bg-[#FAF6F2] py-20 px-6 md:px-16 border-t border-[#F3DDCF]" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
           <h2 className="text-4xl font-serif italic text-[#7A1E1E] tracking-tight mb-4">{title}</h2>
           <p className="text-[#77706B] max-w-sm mx-auto mb-10 font-light">{subtitle}</p>

           <ul className="flex flex-wrap justify-center gap-8 mb-12">
              {['Home', 'Services', 'About Us', 'Contact'].map(l => (
                 <li key={l}><a href="#" className="text-[11px] uppercase tracking-widest font-bold text-[#7A1E1E] hover:text-[#8B0000] transition-colors">{l}</a></li>
              ))}
           </ul>

           <div className="flex gap-6 mb-16">
              {socialItems.map(s => {
                const Icon = s.icon;
                return <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#E7BFA8] flex items-center justify-center text-[#7A1E1E] hover:bg-[#8B0000] hover:text-white hover:border-transparent transition-all"><Icon size={16}/></a>;
              })}
           </div>
        </div>
        
        <div className="max-w-6xl mx-auto border-t border-[#E7BFA8] pt-8 flex flex-col md:flex-row justify-between items-center text-[#77706B] text-[10px] font-bold uppercase tracking-[0.2em] gap-4">
           <span>© {new Date().getFullYear()} {title}. All rights reserved.</span>
           <div className="flex gap-8">
              <a href="#" className="hover:text-[#8B0000] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#8B0000] transition-colors">Terms</a>
           </div>
        </div>
      </footer>
    );
  }

  if (layout === 'hotel-boutique') {
    return (
      <footer className="w-full bg-[#7C6A43] pt-20 pb-8 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
           {/* Brand Column */}
           <div className="lg:col-span-1">
              <h2 className="text-3xl font-serif text-white font-medium mb-4">{title}</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8 font-sans">{subtitle}</p>
              <div className="flex gap-3">
                  {socialItems.map(s => {
                    const Icon = s.icon;
                    return <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:bg-white hover:text-[#7C6A43] transition-all"><Icon size={15}/></a>;
                  })}
               </div>
           </div>

           {/* Quick Links */}
           <div>
              <h3 className="text-white font-bold uppercase tracking-widest text-[11px] mb-6">Quick Links</h3>
              <ul className="space-y-3">
                 {['Home', 'Explore', 'Rooms', 'About Us', 'Contact'].map(l => (
                   <li key={l}><a href="#" className="text-white/60 text-sm hover:text-[#EFE7DA] transition-colors font-sans">{l}</a></li>
                 ))}
              </ul>
           </div>

           {/* Room Links */}
           <div>
              <h3 className="text-white font-bold uppercase tracking-widest text-[11px] mb-6">Our Rooms</h3>
              <ul className="space-y-3">
                 {['The Royal Suite', 'Deluxe Double', 'Standard Suite', 'Family Room', 'Executive Room'].map(l => (
                   <li key={l}><a href="#" className="text-white/60 text-sm hover:text-[#EFE7DA] transition-colors font-sans">{l}</a></li>
                 ))}
              </ul>
           </div>

           {/* Newsletter */}
           <div>
              <h3 className="text-white font-bold uppercase tracking-widest text-[11px] mb-6">Newsletter</h3>
              <p className="text-white/60 text-sm mb-6 font-sans">Subscribe for exclusive offers and travel inspiration.</p>
              <div className="flex flex-col gap-3">
                 <input type="email" placeholder="Your email address" className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white text-sm outline-none placeholder:text-white/30 focus:bg-white/15 transition-colors" />
                 <button className="w-full py-3 bg-[#B9975B] text-white uppercase text-[10px] font-bold tracking-widest hover:bg-[#5F5132] transition-colors flex items-center justify-center gap-2">
                    <Send size={13} /> Subscribe
                 </button>
              </div>
           </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs font-sans">
           <p>© {new Date().getFullYear()} {title}. All rights reserved.</p>
           <div className="flex gap-6">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms of Use</a>
           </div>
        </div>
      </footer>
    );
  }

  if (layout === 'tastenest-light') {
    return (
      <footer className="w-full bg-card py-16 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center border-b border-white/10 pb-16">
           <h2 className="text-4xl font-black text-white mb-10 tracking-tighter">{title}</h2>
           
           <ul className="flex flex-wrap justify-center gap-8 md:gap-16 mb-10">
              {['Home', 'About Us', 'Services', 'Menu', 'Contact Us'].map(l => (
                 <li key={l}><a href="#" className="text-white hover:text-[#F70A38] font-bold transition-colors">{l}</a></li>
              ))}
           </ul>

           <div className="flex gap-6">
              {socialItems.map(s => {
                const Icon = s.icon;
                return <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#F70A38] hover:border-transparent transition-colors"><Icon size={18}/></a>;
              })}
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 text-center text-white/50 text-sm font-medium">
           <p>© 2024 {title}. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  // TasteNest Dark
  return (
    <footer className="w-full bg-[#111111] overflow-hidden" style={{ fontFamily }}>
      {/* Top Banner */}
      <div className="bg-[#F70A38] w-full py-6 flex overflow-hidden whitespace-nowrap">
         <div className="animate-[slideRight_30s_linear_infinite] flex items-center gap-12 font-black text-white text-3xl uppercase tracking-tighter">
            <span>Let's Eat Meat?</span> <Briefcase fill="currentColor" />
            <span>Let's Eat Meat?</span> <Briefcase fill="currentColor" />
            <span>Let's Eat Meat?</span> <Briefcase fill="currentColor" />
            <span>Let's Eat Meat?</span> <Briefcase fill="currentColor" />
            <span>Let's Eat Meat?</span> <Briefcase fill="currentColor" />
            <span>Let's Eat Meat?</span> <Briefcase fill="currentColor" />
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
         {/* About */}
         <div className="lg:col-span-1">
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">{title}</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">{subtitle}</p>
            <div className="space-y-2 text-white/80 font-bold text-sm">
               <p>Monday - Friday: <span className="text-[#FFC806]">8am - 4pm</span></p>
               <p>Saturday: <span className="text-[#FFC806]">8am - 12am</span></p>
            </div>
         </div>

         {/* Links */}
         <div>
            <h3 className="text-xl font-black text-white mb-6">Support</h3>
            <ul className="space-y-4">
               {['About Us', 'Contact Us', 'Our Menu', 'Delivery', 'Return Policy'].map(l => (
                 <li key={l}><a href="#" className="text-white/50 hover:text-[#FFC806] text-sm font-bold transition-colors">{l}</a></li>
               ))}
            </ul>
         </div>

         {/* Links */}
         <div>
            <h3 className="text-xl font-black text-white mb-6">Legal</h3>
            <ul className="space-y-4">
               {['Terms & Conditions', 'Privacy Policy', 'Cookie Policy', 'Disclaimer', 'FAQ'].map(l => (
                 <li key={l}><a href="#" className="text-white/50 hover:text-[#FFC806] text-sm font-bold transition-colors">{l}</a></li>
               ))}
            </ul>
         </div>

         {/* Newsletter */}
         <div>
            <h3 className="text-xl font-black text-white mb-6">Newsletter</h3>
            <p className="text-white/50 text-sm mb-6">Subscribe our newsletter to get our latest update & news</p>
            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1 mb-6">
               <input type="email" placeholder="Your email address" className="w-full bg-transparent px-4 outline-none text-white text-sm" />
               <button className="bg-[#FFC806] text-[#111] p-3 rounded-lg hover:bg-white transition-colors">
                  <Send size={16} />
               </button>
            </div>
            <div className="flex gap-4">
                {socialItems.map(s => {
                  const Icon = s.icon;
                  return <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#F70A38] hover:border-transparent transition-colors"><Icon size={14}/></a>;
                })}
            </div>
         </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
         <style>{`@keyframes slideRight { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }`}</style>
         <p>© 2024 {title}. MADE BY SECTROS</p>
      </div>
    </footer>
  );
}
