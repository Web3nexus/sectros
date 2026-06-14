import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Search, ChevronRight, Book, Code, Component, Zap, Loader2} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import centralApi from '../../services/centralApi';

export default function DocumentationPage() {
    const [docs, setDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [settings, setSettings] = useState({});

    useEffect(() => {
        fetchDocs();
        fetchSettings();
    }, []);

    const fetchDocs = async () => {
        try {
            const res = await centralApi.get('public/docs');
            setDocs(res.data);
            if (res.data.length > 0) {
                setSelectedDoc(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch docs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await centralApi.get('saas/settings');
            setSettings(res.data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    // Grouping docs by category
    const categories = docs.reduce((acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
    }, {});

    const filteredDocs = docs.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">Preparing Product Manuals...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col md:flex-row min-h-screen bg-background pt-20">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-80 shrink-0 border-r border-border p-6 md:p-8 h-auto md:h-[calc(100vh-80px)] md:sticky md:top-20 overflow-y-auto hidden md:block">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Product Guides</h2>
                    <p className="text-sm text-muted-foreground">Official Sectros Support Documentation</p>
                </div>
                
                <div className="space-y-8">
                    {Object.entries(categories).map(([category, items], i) => (
                        <div key={category}>
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Book className="w-4 h-4" /> {category}
                            </h3>
                            <ul className="space-y-2">
                                {items.map((doc) => (
                                    <li key={doc.id}>
                                        <button 
                                            onClick={() => setSelectedDoc(doc)}
                                            className={`w-full text-left text-sm font-bold transition-all flex items-center gap-2 px-3 py-2 rounded-lg ${
                                                selectedDoc?.id === doc.id 
                                                    ? 'bg-blue-500/10 text-blue-400' 
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {doc.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Mobile Nav */}
            <div className="md:hidden p-6 border-b border-border bg-card/50">
                <select 
                    className="w-full bg-background border border-border p-4 rounded-xl text-foreground font-bold outline-none ring-blue-500/20 focus:ring-4"
                    onChange={(e) => setSelectedDoc(docs.find(d => d.id === parseInt(e.target.value)))}
                    value={selectedDoc?.id}
                >
                    {docs.map(doc => (
                        <option key={doc.id} value={doc.id} className="bg-background text-foreground">{doc.title}</option>
                    ))}
                </select>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-16 lg:p-24 overflow-x-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="max-w-4xl relative z-10">
                    {/* Search Bar */}
                    <div className="relative mb-16 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="How can we help you today?..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card/60 backdrop-blur-xl border border-border rounded-3xl py-5 pl-16 pr-6 text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xl"
                        />
                        <AnimatePresence>
                            {searchQuery && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-4 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    {filteredDocs.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto">
                                            {filteredDocs.map(doc => (
                                                <button 
                                                    key={doc.id}
                                                    onClick={() => { setSelectedDoc(doc); setSearchQuery(''); }}
                                                    className="w-full text-left p-4 hover:bg-muted flex items-center justify-between group transition-colors"
                                                >
                                                    <div>
                                                        <div className="text-foreground font-bold text-sm">{doc.title}</div>
                                                        <div className="text-xs text-muted-foreground">{doc.category}</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground text-sm font-bold">No guides found for "{searchQuery}"</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        {selectedDoc ? (
                            <motion.div 
                                key={selectedDoc.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="prose prose-invert prose-blue max-w-none"
                            >
                                <div className="mb-12 border-b border-border pb-12">
                                    <span className="text-blue-400 font-black text-xs uppercase tracking-[0.2em] mb-4 block">{selectedDoc.category}</span>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                                        {selectedDoc.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-muted-foreground text-sm font-sans font-bold">
                                        <div className="flex items-center gap-1.5 border border-border px-2 py-1 rounded-full bg-card">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Guide
                                        </div>
                                        <span>Last updated: {new Date(selectedDoc.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                                        {selectedDoc.content}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <Book className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
                                <div className="space-y-1">
                                    <p className="text-foreground font-bold tracking-tight">No guides available yet</p>
                                    <p className="text-muted-foreground text-sm">Select a category from the sidebar or try a different search.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Footer Nav */}
                    <div className="mt-20 pt-12 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">© 2026 Sectros OS. Powering independent restaurants globally.</p>
                        <div className="flex gap-6">
                           <a href={settings.instagram_url || "#"} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
                           <a href={settings.whatsapp_channel_url || "#"} className="text-xs text-muted-foreground hover:text-foreground transition-colors">WhatsApp</a>
                           <a href={settings.community_url || "#"} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Community</a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Custom Markdown Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .markdown-body h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; color: var(--foreground); }
                .markdown-body h2 { font-size: 1.875rem; font-weight: 800; margin-top: 3rem; margin-bottom: 1.5rem; color: var(--foreground); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
                .markdown-body h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: var(--foreground); }
                .markdown-body p { margin-bottom: 1.5rem; line-height: 1.8; color: var(--muted-foreground); font-size: 1.1rem; }
                .markdown-body ul { margin-bottom: 1.5rem; padding-left: 1.5rem; list-style-type: disc; color: var(--muted-foreground); }
                .markdown-body li { margin-bottom: 0.5rem; }
                .markdown-body code { background: var(--muted); color: #60a5fa; padding: 0.2rem 0.4rem; rounded: 0.3rem; font-family: monospace; font-size: 0.875em; }
                .markdown-body pre { background: var(--card); padding: 1.5rem; border-radius: 1rem; border: 1px solid var(--border); overflow-x: auto; margin-bottom: 2rem; }
                .markdown-body pre code { background: none; color: var(--foreground); padding: 0; }
                .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                .markdown-body th { background: var(--muted); padding: 0.75rem 1rem; text-align: left; font-weight: 800; color: var(--foreground); border-bottom: 2px solid var(--border); }
                .markdown-body td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); color: var(--muted-foreground); }
                .markdown-body blockquote { border-left: 4px solid #3b82f6; background: rgba(59, 130, 246, 0.05); padding: 1.5rem; border-radius: 0 1rem 1rem 0; font-style: italic; color: #60a5fa; margin-bottom: 2rem; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--muted); }
            `}} />
        </div>
    );
}
