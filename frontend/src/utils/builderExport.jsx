import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import NavbarSection from '../components/builder/sections/NavbarSection';
import HeroSection from '../components/builder/sections/HeroSection';
import ReservationFormSection from '../components/builder/sections/ReservationFormSection';
import ServicesSection from '../components/builder/sections/ServicesSection';
import FeaturedCardsSection from '../components/builder/sections/FeaturedCardsSection';
import AboutSection from '../components/builder/sections/AboutSection';
import StatsSection from '../components/builder/sections/StatsSection';
import MenuSection from '../components/builder/sections/MenuSection';
import GallerySection from '../components/builder/sections/GallerySection';
import TestimonialsSection from '../components/builder/sections/TestimonialsSection';
import CTABannerSection from '../components/builder/sections/CTABannerSection';
import BlogSection from '../components/builder/sections/BlogSection';
import FooterSection from '../components/builder/sections/FooterSection';
import TeamSection from '../components/builder/sections/TeamSection';

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
  Team: TeamSection,
};

export function exportToHtml(sections, theme, branding = null) {
  // Ensure sections is an array (handle JSON string input from API)
  const parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;

  let markup = parsedSections
    .filter(s => s.visible !== false)
    .map(section => {
      const Component = SECTION_COMPONENTS[section.type];
      if (!Component) return '';

      // ... existing processing logic ...
      let processedContent = { ...section.content };
      if (branding) {
        const processString = (str) => {
          if (typeof str !== 'string') return str;
          return str
            .replace(/{{restaurant_name}}/g, branding.business_name || '')
            .replace(/{{business_phone}}/g, branding.business_phone || '')
            .replace(/{{business_address}}/g, branding.business_address || '')
            .replace(/{{establishment_year}}/g, branding.establishment_year || '');
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
        processedContent = traverse(processedContent);
      }

      return renderToStaticMarkup(<Component content={processedContent} theme={theme} />);
    })
    .join('');

  // Inject Cookie Consent Banner if enabled
  if (theme.cookieConsentEnabled) {
    const bannerHtml = `
      <div id="cookie-consent-banner" style="position: fixed; bottom: 24px; left: 24px; right: 24px; z-index: 9999; display: none; font-family: sans-serif; pointer-events: none;">
        <div style="background: #0a0c10; border: 1px solid rgba(255, 255, 255, 0.1); padding: 24px; border-radius: 32px; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5); max-width: 400px; margin-left: auto; pointer-events: auto; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: rgba(59, 130, 246, 0.15); border-radius: 50%; filter: blur(30px); pointer-events: none;"></div>
          <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; position: relative; z-index: 10;">
            <div style="width: 44px; height: 44px; background: #2563eb; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <h4 style="margin: 0 0 4px 0; color: #ffffff; font-size: 16px; font-weight: 900; letter-spacing: -0.01em;">Compliance & Privacy</h4>
              <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5; font-weight: 500;">We use cookies to enhance your experience and analyze traffic. Your privacy is our priority.</p>
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-bottom: 16px; position: relative; z-index: 10;">
            <button id="accept-cookies" style="flex: 1; padding: 12px 20px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; transition: transform 0.2s;">Accept All</button>
            <button id="decline-cookies" style="flex: none; padding: 12px 20px; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer;">Decline</button>
          </div>
          <div style="text-align: center; font-size: 9px; color: #475569; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; position: relative; z-index: 10;">Powered by {localStorage.getItem('platform_name') || 'Sectros'} Trust Framework</div>
        </div>
      </div>
      <script>
        (function() {
          const banner = document.getElementById('cookie-consent-banner');
          const accepted = localStorage.getItem('sectros_cookie_consent');
          if (!accepted) {
            setTimeout(() => {
              banner.style.display = 'block';
              banner.style.opacity = '0';
              banner.style.transform = 'translateY(20px)';
              banner.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
              requestAnimationFrame(() => {
                banner.style.opacity = '1';
                banner.style.transform = 'translateY(0)';
              });
            }, 1500);
          }
          document.getElementById('accept-cookies').onclick = () => {
            localStorage.setItem('sectros_cookie_consent', 'accepted');
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(20px)';
            setTimeout(() => banner.style.display = 'none', 500);
          };
          document.getElementById('decline-cookies').onclick = () => {
            localStorage.setItem('sectros_cookie_consent', 'declined');
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(20px)';
            setTimeout(() => banner.style.display = 'none', 500);
          };
        })();
      </script>
    `;
    markup += bannerHtml;
  }

  return markup;
}

export function exportToCss(theme) {
  return `
    body { 
      font-family: '${theme.fontFamily}', sans-serif; 
      margin: 0;
      padding: 0;
    }
  `;
}
