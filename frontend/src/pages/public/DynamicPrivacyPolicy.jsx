import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Globe, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function DynamicPrivacyPolicy() {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await api.get('branding');
        setBranding(data);
      } catch (error) {
        console.error("Failed to load restaurant branding for policy:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, []);

  const businessName = branding?.business_name || 'Our Restaurant';
  const businessAddress = branding?.business_address || 'TBD';
  const businessEmail = branding?.business_email || 'contact@example.com';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const sections = [
    {
      title: "Data Collection",
      content: `At ${businessName}, we collect information that you provides directly to us, such as when you make a reservation, sign up for our newsletter, or contact us. This may include your name, email, phone number, and dining preferences.`,
      icon: Eye,
      color: "text-primary",
      bg: "bg-blue-50"
    },
    {
      title: "Use of Information",
      content: `We use your information to manage reservations, provide customer support, and, with your permission, send you promotional offers about ${businessName}.`,
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Security",
      content: "We implement robust security measures to protect your personal information against unauthorized access, alteration, or disclosure.",
      icon: Lock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-bold mb-6">
            <Shield className="w-4 h-4" /> Legal & Transparency
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tight mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            This policy outlines how <span className="text-slate-950 font-bold">{businessName}</span> handles your personal information.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-white border border-border shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl ${section.bg} flex items-center justify-center mb-6`}>
                <section.icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-3">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-border rounded-[2.5rem] p-8 md:p-12 shadow-sm"
        >
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-black text-slate-950 mb-8">Detailed Policy</h2>
            <div className="space-y-8 text-slate-600 text-sm leading-relaxed">
              <section>
                <h4 className="text-slate-950 font-bold mb-2 uppercase tracking-wider text-xs">1. Scope</h4>
                <p>This policy applies to all visitors of our website and guests of {businessName}.</p>
              </section>
              <section>
                <h4 className="text-slate-950 font-bold mb-2 uppercase tracking-wider text-xs">2. Contact Us</h4>
                <p>If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this website, please contact us at:</p>
                <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-border">
                  <p className="font-bold text-slate-950">{businessName}</p>
                  <p>{businessAddress}</p>
                  <p className="text-primary font-bold mt-2">{businessEmail}</p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
