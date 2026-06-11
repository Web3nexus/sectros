import React from 'react';

export default function TeamSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark', 
    title = 'Meet Our Experts',
    team: apiTeam
  } = content;

  const { fontFamily = 'Outfit' } = theme;

  const defaultTeam = [
    { name: 'Willimas James', role: 'Director and Chief Operations Officer', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90' },
    { name: 'John Doe', role: 'Executive Chef', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c' },
    { name: 'Jane Smith', role: 'Head Sommelier', img: 'https://images.unsplash.com/photo-1560087637-bf797bc7796a' }
  ];

  const team = apiTeam?.length ? apiTeam.map(m => ({
    name: m.name,
    role: m.role,
    img: m.image_url || defaultTeam[0].img
  })) : defaultTeam;

  if (layout === 'tastenest-dark') {
    return (
      <section className="w-full bg-[#1A1A1A] py-24 px-6 md:px-16 overflow-hidden" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
           
           <div className="w-full lg:w-1/3">
              <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Dedicated Team</h4>
              <h2 className="text-4xl md:text-[3rem] font-black text-white leading-[1.05] mb-8 tracking-tight">
                {title}
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <button className="px-8 py-3 rounded-full border border-white/20 text-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-colors">
                View All Team
              </button>
           </div>

           <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.slice(0, 3).map((member, idx) => (
                 <div key={idx} className="flex flex-col items-center group relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-48 h-64 border border-white/5 rounded-t-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500 origin-bottom" />
                    
                    <img 
                       src={`${member.img}?auto=format&fit=crop&w=300&q=80`} 
                       alt={member.name}
                       className="w-48 h-48 rounded-full border-4 border-[#1A1A1A] shadow-xl relative z-10 mb-6 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="text-center relative z-10">
                       <h4 className="text-xl font-black text-white mb-2">{member.name}</h4>
                       <p className="text-[10px] text-[#FFC806] uppercase tracking-widest font-bold">{member.role}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  return null;
}
