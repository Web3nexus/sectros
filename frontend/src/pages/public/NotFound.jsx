import React from 'react';
import { Link } from 'react-router-dom';
import {Home, ArrowLeft, Search, UtensilsCrossed, Coffee, Scissors, Building} from 'lucide-react';

export default function NotFound() {
  const solutions = [
    { title: 'Restaurants', icon: UtensilsCrossed, path: '/solutions/restaurants', color: 'text-rose-400' },
    { title: 'Cafes', icon: Coffee, path: '/solutions/cafes', color: 'text-amber-400' },
    { title: 'Salons', icon: Scissors, path: '/solutions/salons', color: 'text-pink-400' },
    { title: 'Hospitality', icon: Building, path: '/solutions/hospitality', color: 'text-cyan-400' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated 404 number */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[100px] md:text-[150px] font-black text-foreground leading-none tracking-tighter opacity-10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-4xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 rotate-12 transition-transform hover:rotate-0 duration-500">
              <Search className="w-8 h-8 md:w-12 md:h-12 text-primary-foreground" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 italic uppercase">LOST IN THE CLOUD?</h2>
        <p className="text-muted-foreground mb-10 leading-relaxed text-lg max-w-md mx-auto">
          The page you are looking for has been moved to another dimension or never existed at all.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
          <Link
            to="/"
            className="w-full sm:w-auto px-10 py-5 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-10 py-5 bg-card hover:bg-muted text-foreground font-bold rounded-2xl transition-all border border-border flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Solutions Section */}
        <div className="pt-12 border-t border-border">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-8">Explore our Solutions</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {solutions.map((sol, i) => (
              <Link
                key={i}
                to={sol.path}
                className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-all group flex flex-col items-center gap-3"
              >
                <div className={`p-2 rounded-lg bg-slate-500/5 group-hover:scale-110 transition-transform ${sol.color}`}>
                  <sol.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-foreground">{sol.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <p className="text-muted-foreground text-sm font-medium">
            Need immediate assistance? <a href="/help" className="text-blue-500 hover:underline">Visit Help Center</a>
          </p>
        </div>
      </div>
    </div>
  );
}
