import React from 'react';

export default function StatsSection({ content, theme }) {
  const { items = [] } = content;
  const { primaryColor = '#18A0FB', fontFamily = 'Inter' } = theme;

  const defaultItems = [
    { label: 'Happy Customers', value: '150k+' },
    { label: 'Exquisite Dishes', value: '250+' },
    { label: 'Master Chefs', value: '12' },
    { label: 'Global Awards', value: '45' },
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  return (
    <section className="w-full bg-[#f8f8f8] py-24 px-10" style={{ fontFamily }}>
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-12">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 min-w-[150px] text-center">
            <span className="text-6xl font-black italic tracking-tighter mb-4" style={{ color: primaryColor }}>
              {item.value}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
               {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
