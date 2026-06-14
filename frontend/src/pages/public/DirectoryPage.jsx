import React, { useState, useEffect } from 'react';
import {Search, MapPin, Briefcase, Filter, ArrowRight, Utensils, Scissors, Coffee, BedDouble, Stethoscope, ChevronRight, Loader2} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CATEGORY_ICONS = {
  Utensils: <Utensils size={24} />,
  Scissors: <Scissors size={24} />,
  Coffee: <Coffee size={24} />,
  Briefcase: <Briefcase size={24} />,
  BedDouble: <BedDouble size={24} />,
  Stethoscope: <Stethoscope size={24} />,
};

export default function DirectoryPage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, listRes] = await Promise.all([
        axios.get(`${API_URL}/public/directory/categories`),
        axios.get(`${API_URL}/public/directory/listings`, {
          params: {
            category: activeCategory,
            search: search
          }
        })
      ]);
      setCategories(catRes.data);
      setListings(listRes.data.data);
    } catch (err) {
      console.error('Directory Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 uppercase">
              Discover <span className="text-primary">Premium</span> Services
            </h1>
            <p className="text-lg text-slate-600 mb-10 font-medium">
              The global marketplace for restaurants, salons, hotels, and more. Book your next experience in seconds.
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 mb-12">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <Search size={20} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, city, or cuisine..." 
                  className="bg-transparent border-none focus:ring-0 w-full font-semibold text-slate-700"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 min-w-[200px]">
                <MapPin size={20} className="text-slate-400" />
                <span className="font-semibold text-slate-700">Near me</span>
              </div>
              <button type="submit" className="bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all border-2 active:scale-95 ${
                  activeCategory === cat.slug 
                    ? 'bg-primary border-primary text-white shadow-xl shadow-blue-500/30' 
                    : 'bg-white border-transparent text-slate-600 hover:border-slate-200 hover:shadow-lg'
                }`}
              >
                <div className={`mb-4 p-3 rounded-2xl ${activeCategory === cat.slug ? 'bg-white/20' : 'bg-slate-50'}`}>
                  {CATEGORY_ICONS[cat.icon] || <ArrowRight size={24} />}
                </div>
                <span className="font-black uppercase tracking-widest text-[10px]">{cat.name}</span>
                <span className={`text-[8px] font-bold mt-1 uppercase ${activeCategory === cat.slug ? 'text-white/70' : 'text-slate-400'}`}>
                  {cat.listings_count} listings
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {activeCategory ? `${activeCategory} Listings` : 'Recommended for You'}
            </h2>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest hover:text-primary transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <Loader2 size={48} className="animate-spin mb-4 text-primary" />
              <p className="font-black uppercase tracking-widest text-xs">Syncing Global Directory...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {listings.map((item) => (
                <div key={item.id} className="group bg-white rounded-[32px] border border-slate-200 overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.cover_image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={item.name}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5 shadow-sm">
                        {CATEGORY_ICONS[item.category?.icon] || <Utensils size={10} />} {item.business_type}
                      </span>
                    </div>
                    {item.is_featured && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Briefcase 
                          key={i} 
                          size={12} 
                          fill={i < Math.floor(item.rating_avg) ? '#3b82f6' : 'none'} 
                          className={i < Math.floor(item.rating_avg) ? 'text-primary' : 'text-slate-200'}
                        />
                      ))}
                      <span className="text-[10px] font-black text-slate-900 ml-1 mt-0.5">{item.rating_avg}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">({item.review_count})</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1 uppercase">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                      <MapPin size={12} className="text-primary" /> {item.city}, {item.country}
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <span key={i} className={`text-sm font-black ${i < item.price_range ? 'text-slate-900' : 'text-slate-200'}`}>$</span>
                        ))}
                      </div>
                      <Link 
                        to={`/directory/${item.slug}`}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary hover:shadow-blue-500/20 transition-all active:scale-95 group/btn"
                      >
                        Book Now
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
               <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                    <Search size={48} strokeWidth={1} />
                  </div>
               </div>
               <p className="font-black text-slate-400 uppercase tracking-widest text-sm italic">No businesses found matching your criteria.</p>
               <button 
                onClick={() => {setSearch(''); setActiveCategory(null); fetchData();}}
                className="mt-6 text-primary font-black uppercase text-[10px] tracking-widest hover:underline transition-all"
               >
                 Clear all filters
               </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
