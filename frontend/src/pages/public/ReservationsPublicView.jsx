import React, { useState, useEffect } from 'react';
import {Loader2, ArrowLeft} from 'lucide-react';
import api from '../../services/api';
import ReservationFormSection from '../../components/builder/sections/ReservationFormSection';

export default function ReservationsPublicView() {
  const [branding, setBranding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('branding');
        setBranding(res.data);
      } catch (e) {
        console.error("Failed to fetch branding:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranding();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Reservation Portal...</p>
      </div>
    );
  }

  // Use fallback if branding fails
  const businessName = branding?.business_name || 'Our Restaurant';
  const logoUrl = branding?.logo_url;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Focused Header */}
      <header className="w-full h-24 bg-card border-b border-border flex items-center justify-between px-8 md:px-16 shrink-0">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="h-10 w-auto object-contain" />
          ) : (
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black text-xl">
              {businessName.charAt(0)}
            </div>
          )}
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-foreground hidden sm:block">
            {businessName}
          </h1>
        </div>
        
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </header>

      {/* Main Reservation Suite */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-7xl">
           <ReservationFormSection 
             businessType={branding?.business_type}
             content={{
               title: branding?.business_type === 'salon' ? `Book an Appointment at ${businessName}` : 
                      branding?.business_type === 'hotel' ? `Book Your Stay at ${businessName}` : 
                      `Reserve Your Table at ${businessName}`,
               subtitle: branding?.business_type === 'salon' ? "Expert beauty services tailored to your needs. Select your stylist and schedule below." :
                         branding?.business_type === 'hotel' ? "Experience luxury and comfort. Choose your room and dates below." :
                         "Experience our seasonal menu in an atmosphere designed for excellence. Please select your preferred date and time below.",
             }} 
             theme={{
               primaryColor: 'var(--primary)', // Use theme variable
               fontFamily: 'Inter'
             }} 
           />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center bg-card border-t border-border">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
           Powered by Sectros &copy; {new Date().getFullYear()}
         </p>
      </footer>
    </div>
  );
}
