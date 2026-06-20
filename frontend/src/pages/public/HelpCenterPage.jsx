import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Search, ChevronRight, HelpCircle, Utensils, CreditCard, LayoutDashboard, Settings, Loader2, BookOpen, MessageSquare, ExternalLink, Send, CheckCircle2, AlertCircle} from 'lucide-react';
import { Link } from 'react-router-dom';
import centralApi from '../../services/centralApi';

export default function HelpCenterPage() {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [ticketForm, setTicketForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [ticketStatus, setTicketStatus] = useState('idle');
    const [ticketError, setTicketError] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const submitTicket = async (e) => {
        e.preventDefault();
        setTicketStatus('loading');
        setTicketError('');
        try {
            await centralApi.post('public/support-tickets', ticketForm);
            setTicketStatus('success');
            setTicketForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setTicketStatus('error');
            setTicketError(err.response?.data?.message || 'Failed to submit. Please try again.');
        }
    };

    const fetchArticles = async () => {
        try {
            const res = await centralApi.get('public/help');
            setArticles(res.data);
        } catch (error) {
            console.error('Failed to fetch help articles', error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = articles.reduce((acc, art) => {
        if (!acc[art.category]) acc[art.category] = [];
        acc[art.category].push(art);
        return acc;
    }, {});

    const filteredArticles = articles.filter(art => 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categoryMeta = {
        'Getting Started': { icon: LayoutDashboard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        'Menu Management': { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        'Billing & Payments': { icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        'Account Settings': { icon: Settings, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">Syncing Support Hub...</p>
            </div>
        );
    }

    return (
        <div className="w-full relative px-6 py-20 md:py-32 overflow-hidden bg-background min-h-screen">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header & Search */}
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-20 h-20 bg-card border border-border rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-3xl">
                        <HelpCircle className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-foreground tracking-tight mb-8"
                    >
                        How can we help?
                    </motion.h1>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-3xl mx-auto group"
                    >
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search for articles, guides, or keywords..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card/60 backdrop-blur-2xl border border-border rounded-full py-6 pl-20 pr-10 text-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-3xl shadow-emerald-950/5"
                        />
                        
                        <AnimatePresence>
                            {searchQuery && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-6 bg-card border border-border rounded-[2rem] shadow-4xl z-50 overflow-hidden"
                                >
                                    {filteredArticles.length > 0 ? (
                                        <div className="max-h-[500px] overflow-y-auto p-2">
                                            {filteredArticles.map(art => (
                                                <button 
                                                    key={art.id}
                                                    onClick={() => { setSelectedArticle(art); setSearchQuery(''); }}
                                                    className="w-full text-left p-6 hover:bg-muted rounded-2xl flex items-center justify-between group transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-emerald-400">
                                                            <BookOpen size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-foreground font-bold text-lg">{art.title}</div>
                                                            <div className="text-sm text-muted-foreground font-medium">{art.category}</div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-16 text-center text-muted-foreground text-lg font-bold">We couldn't find anything matching "{searchQuery}"</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Article View Modal */}
                <AnimatePresence>
                    {selectedArticle && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setSelectedArticle(null)} />
                             <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-card border border-border rounded-[3rem] shadow-4xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative z-[101]"
                            >
                                <div className="p-10 border-b border-border flex items-start justify-between bg-card/50">
                                    <div className="flex-1">
                                        <span className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4 block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">{selectedArticle.category}</span>
                                        <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight">{selectedArticle.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedArticle(null)} className="p-4 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-all">
                                        <ChevronRight className="w-8 h-8 rotate-90" />
                                    </button>
                                </div>
                                <div className="p-12 overflow-y-auto flex-1 prose prose-invert prose-emerald max-w-none">
                                    <div className="text-xl text-muted-foreground leading-relaxed font-medium mb-10 pb-10 border-b border-border/50 italic">
                                        {selectedArticle.excerpt}
                                    </div>
                                    <div className="text-foreground/80 whitespace-pre-wrap text-lg leading-loose">
                                        {selectedArticle.content}
                                    </div>
                                    <div className="mt-20 p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex flex-col items-center text-center">
                                         <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                            <HelpCircle size={24} />
                                        </div>
                                        <h4 className="text-xl font-bold text-foreground mb-2">Was this article helpful?</h4>
                                        <div className="flex gap-4 mt-4">
                                            <button className="px-8 py-3 bg-foreground text-background rounded-full font-bold transition-all hover:opacity-90">Yes, thanks!</button>
                                            <button className="px-8 py-3 border border-border hover:bg-muted text-muted-foreground rounded-full font-bold transition-all">Not quite</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Categories Grid */}
                <motion.div 
                    variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                    initial="initial" animate="animate"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"
                >
                    {Object.entries(categories).map(([category, items], i) => {
                        const meta = categoryMeta[category] || { icon: BookOpen, color: 'text-muted-foreground', bg: 'bg-slate-500/10' };
                        return (
                            <motion.div 
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 bg-card border border-border rounded-[2.5rem] hover:border-emerald-500/50 transition-all group cursor-pointer"
                                onClick={() => setSearchQuery(category)}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${meta.bg}`}>
                                    <meta.icon className={`w-8 h-8 ${meta.color}`} />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-4 flex items-center justify-between">
                                    {category}
                                    <span className="text-xs bg-muted px-2 py-1 rounded-lg text-muted-foreground font-bold">{items.length}</span>
                                </h3>
                                <p className="text-muted-foreground text-base leading-relaxed mb-8 font-medium">
                                    Explore all sub-articles related to {category.toLowerCase()} within the Sectros ecosystem.
                                </p>
                                <div className="flex items-center gap-3 text-emerald-400 font-bold group-hover:gap-4 transition-all">
                                    View Articles <ChevronRight size={20} />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Support Hub Section */}
                <div className="bg-muted/30 border border-border rounded-[3rem] p-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                            <MessageSquare size={32} />
                        </div>
                        <h2 className="text-4xl font-black text-foreground mb-4">Can't find an answer?</h2>
                        <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">Our human operators and technical staff are standing by globally to ensure your restaurant operations never skip a beat.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button onClick={() => setShowTicketForm(!showTicketForm)} className="px-10 py-5 bg-foreground text-background text-lg font-black rounded-2xl hover:opacity-90 transition-all flex items-center gap-3 group">
                                {showTicketForm ? 'Close Form' : 'Open Priority Ticket'}
                                <MessageSquare size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                            <a href="mailto:hq@sectros.com" className="px-10 py-5 bg-muted border border-border text-foreground text-lg font-black rounded-2xl hover:bg-muted/80 transition-all">
                                Email Staff
                            </a>
                        </div>

                        {showTicketForm && ticketStatus !== 'success' && (
                            <form onSubmit={submitTicket} className="mt-12 max-w-xl mx-auto text-left space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Your Name</label>
                                        <input type="text" required value={ticketForm.name} onChange={e => setTicketForm(p => ({...p, name: e.target.value}))} placeholder="John Doe" className="w-full bg-muted border border-border rounded-2xl px-5 py-3.5 font-bold text-foreground focus:border-emerald-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Email</label>
                                        <input type="email" required value={ticketForm.email} onChange={e => setTicketForm(p => ({...p, email: e.target.value}))} placeholder="john@example.com" className="w-full bg-muted border border-border rounded-2xl px-5 py-3.5 font-bold text-foreground focus:border-emerald-500 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Subject</label>
                                    <input type="text" required value={ticketForm.subject} onChange={e => setTicketForm(p => ({...p, subject: e.target.value}))} placeholder="Brief title of your issue" className="w-full bg-muted border border-border rounded-2xl px-5 py-3.5 font-bold text-foreground focus:border-emerald-500 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Message</label>
                                    <textarea rows={4} required value={ticketForm.message} onChange={e => setTicketForm(p => ({...p, message: e.target.value}))} placeholder="Describe your issue in detail..." className="w-full bg-muted border border-border rounded-2xl px-5 py-3.5 font-bold text-foreground focus:border-emerald-500 transition-all resize-none" />
                                </div>
                                {ticketStatus === 'error' && (
                                    <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-500/20">
                                        <AlertCircle size={14} /> {ticketError}
                                    </div>
                                )}
                                <button type="submit" disabled={ticketStatus === 'loading'} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-emerald-500/20">
                                    {ticketStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    Submit Ticket
                                </button>
                            </form>
                        )}

                        {showTicketForm && ticketStatus === 'success' && (
                            <div className="mt-12 max-w-md mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 text-center">
                                <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                                <h4 className="text-xl font-black text-foreground mb-2">Ticket Submitted!</h4>
                                <p className="text-muted-foreground text-sm">Our support team will respond within 24 hours.</p>
                                <button onClick={() => { setShowTicketForm(false); setTicketStatus('idle'); }} className="mt-6 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">
                                    Submit Another
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-24 text-center border-t border-border pt-12">
                    <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">© 2026 Sectros Global Operations • Privacy & Security Enabled</p>
                </div>
            </div>
        </div>
    );
}
