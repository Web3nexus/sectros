import React from 'react';
import {User, MessageSquare} from 'lucide-react';

export default function BlogSection({ content, theme }) {
  const { 
    layout = 'tastenest-dark', 
    title = 'Recent News',
    posts: apiPosts
  } = content;

  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  const defaultPosts = [
    { title: 'The Art of Sourcing Sustainably', date: 'April 12, 2024', author: 'Chef John', comments: 12, imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713' },
    { title: 'Mastering the Perfect Ribeye Steak', date: 'April 08, 2024', author: 'Admin', comments: 5, imageUrl: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef' },
    { title: 'New Seasonal Cocktails Released', date: 'April 02, 2024', author: 'Sarah', comments: 8, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87' },
  ];

  const posts = apiPosts?.length ? apiPosts.map(p => ({
    title: p.title,
    date: p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent',
    author: p.author || 'Admin',
    comments: 0,
    imageUrl: p.image_url || defaultPosts[0].imageUrl
  })) : defaultPosts;

  if (layout === 'coffee-house') {
    return (
      <section className="w-full bg-[#120F0D] py-24 px-6 md:px-12 border-t border-white/5" style={{ fontFamily }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
           <h4 className="text-[#A0988E] text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Read Our</h4>
           <h2 className="text-3xl md:text-5xl font-black text-white text-center leading-tight mb-16 font-serif">
             {title || 'Latest News and Blogs'}
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {posts.slice(0, 3).map((post, idx) => (
                 <div key={idx} className="bg-[#0A0807] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#A0988E]/40 transition-colors">
                    <div className="h-56 relative overflow-hidden">
                       <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${post.imageUrl}?auto=format&fit=crop&w=600&q=80)` }} />
                       <div className="absolute top-4 left-4 bg-[#120F0D] text-[#A0988E] text-[10px] font-bold px-3 py-1 rounded">Coffee</div>
                    </div>
                    <div className="p-6">
                       <h3 className="text-white font-bold text-xl mb-4 group-hover:text-[#A0988E] transition-colors">{post.title}</h3>
                       <div className="flex items-center gap-6 border-t border-white/10 pt-4 text-[#A0988E] text-xs font-bold uppercase tracking-widest">
                          <span>{post.date}</span>
                          <div className="flex items-center gap-2"><MessageSquare size={14} /> {post.comments}</div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#1A1A1A] py-24 px-6 md:px-16" style={{ fontFamily }}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
         <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4">News & Blog</h4>
         <h2 className="text-4xl md:text-[3rem] font-black text-white leading-[1.05] mb-16 tracking-tight text-center">
           {title}
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {posts.slice(0, 3).map((post, idx) => (
               <div key={idx} className="bg-[#111111] rounded-4xl border border-white/5 overflow-hidden group">
                  <div className="h-64 relative overflow-hidden">
                     <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${post.imageUrl}?auto=format&fit=crop&w=600&q=80)` }} />
                     
                     <div className="absolute bottom-4 left-4 bg-[#FFC806] text-foreground font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform">
                        {post.date}
                     </div>
                  </div>
                  
                  <div className="p-8">
                     <div className="flex items-center gap-3 text-[#F70A38] text-xs font-bold mb-4 uppercase tracking-widest">
                        <User size={14} /> <span>{post.author}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>Food</span>
                     </div>
                     <h3 className="text-2xl font-black text-white mb-6 group-hover:text-[#F70A38] transition-colors leading-tight">
                        {post.title}
                     </h3>
                     <button className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.2em] font-black group-hover:text-white transition-colors">
                        Read More <span>→</span>
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </section>
  );
}
