import React from 'react';
import NavbarSection from './sections/NavbarSection';
import HeroSection from './sections/HeroSection';
import ReservationFormSection from './sections/ReservationFormSection';
import ServicesSection from './sections/ServicesSection';
import FeaturedCardsSection from './sections/FeaturedCardsSection';
import AboutSection from './sections/AboutSection';
import StatsSection from './sections/StatsSection';
import MenuSection from './sections/MenuSection';
import GallerySection from './sections/GallerySection';
import TestimonialsSection from './sections/TestimonialsSection';
import CTABannerSection from './sections/CTABannerSection';
import BlogSection from './sections/BlogSection';
import FooterSection from './sections/FooterSection';

const SECTION_COMPONENTS = {
  Navbar: NavbarSection,
  Hero: HeroSection,
  ReservationForm: ReservationFormSection,
  Services: ServicesSection,
  FeaturedCards: FeaturedCardsSection,
  About: AboutSection,
  Stats: StatsSection,
  Menu: MenuSection,
  Gallery: GallerySection,
  Testimonials: TestimonialsSection,
  CTABanner: CTABannerSection,
  Blog: BlogSection,
  Footer: FooterSection,
};

const processTokens = (content, branding) => {
  const processString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/{{restaurant_name}}/g, branding?.business_name || '')
      .replace(/{{business_phone}}/g, branding?.business_phone || '')
      .replace(/{{business_address}}/g, branding?.business_address || '')
      .replace(/{{establishment_year}}/g, branding?.establishment_year || '');
  };

  const traverse = (obj) => {
    if (!obj) return obj;
    if (typeof obj === 'string') return processString(obj);
    if (Array.isArray(obj)) return obj.map(traverse);
    if (typeof obj === 'object') {
      const newObj = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = traverse(value);
      }
      return newObj;
    }
    return obj;
  };

  return traverse(content);
};

export default function SectionRenderer({ sections, theme, onSelectSection, selectedSectionId, accountData }) {
  const { branding, menus, navMenus, reviews, gallery, rooms, services, blogPosts, teamMembers } = accountData || {};

  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col items-center py-20 px-4 custom-figma-scroll">
      <div className="w-full max-w-[1280px] bg-white shadow-2xl relative min-h-screen">
        {sections.filter(s => s.visible !== false).map((section) => {
          const Component = SECTION_COMPONENTS[section.type];
          if (!Component) return null;

          let processedContent = { ...section.content };

          processedContent = processTokens(processedContent, branding);

          // Dynamic Source Binding for all content types
          if (section.type === 'Navbar' && section.sourceId) {
            const navMenu = navMenus?.find(m => m.id === parseInt(section.sourceId));
            if (navMenu) processedContent.links = navMenu.links;
          }

          if (section.type === 'Menu' && section.sourceId) {
            const category = menus?.find(m => m.id === parseInt(section.sourceId));
            if (category) processedContent.categories = [category];
          }

          // Inject data from content management APIs
          if (section.type === 'Testimonials') {
            processedContent.reviews = section.sourceId
              ? reviews?.filter(r => r.id === parseInt(section.sourceId))
              : reviews;
          }

          if (section.type === 'Gallery') {
            processedContent.images = section.sourceId
              ? gallery?.filter(g => g.id === parseInt(section.sourceId))
              : gallery;
          }

          if (section.type === 'Services') {
            processedContent.services = section.sourceId
              ? services?.filter(s => s.id === parseInt(section.sourceId))
              : services;
          }

          if (section.type === 'Rooms') {
            processedContent.rooms = section.sourceId
              ? rooms?.filter(r => r.id === parseInt(section.sourceId))
              : rooms;
          }

          if (section.type === 'Blog') {
            processedContent.posts = section.sourceId
              ? blogPosts?.filter(b => b.id === parseInt(section.sourceId))
              : blogPosts;
          }

          if (section.type === 'Team') {
            processedContent.team = section.sourceId
              ? teamMembers?.filter(t => t.id === parseInt(section.sourceId))
              : teamMembers;
          }

          if (section.type === 'Stats') {
            if (section.sourceId) {
              const selectedServices = services?.filter(s => s.id === parseInt(section.sourceId));
              if (selectedServices?.length) processedContent.items = selectedServices.map(s => ({ label: s.name, value: `$${s.price}` }));
            }
          }

          return (
            <div
              key={section.id}
              className={`relative group cursor-pointer border-2 transition-all ${selectedSectionId === section.id ? 'border-blue-500' : 'border-transparent hover:border-blue-500/30'}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSection(section.id);
              }}
            >
              {selectedSectionId === section.id && (
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-t-sm uppercase tracking-widest z-50">
                   {section.type}
                </div>
              )}

              <Component content={processedContent} theme={theme} socialLinks={branding} />

              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
