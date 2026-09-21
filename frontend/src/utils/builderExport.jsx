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
      <div id="cookie-consent-banner" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; display: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; pointer-events: none; padding: 12px;">
        <div style="background: #1c1c1e; border: 1px solid rgba(255, 255, 255, 0.1); padding: 14px 16px; border-radius: 16px; box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.6); max-width: 340px; margin: 0 auto; pointer-events: auto;">
          <p style="margin: 0 0 12px 0; color: #f5f5f7; font-size: 13px; line-height: 1.45; font-weight: 500;">We use cookies to improve your experience &amp; keep our service secure.</p>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="accept-cookies" style="flex: 1; padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; transition: opacity 0.2s;">Accept All</button>
            <button id="decline-cookies" style="padding: 10px 12px; background: transparent; color: #8e8e93; border: none; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer;">Decline</button>
          </div>
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
              banner.style.transform = 'translateY(16px)';
              banner.style.transition = 'all 0.3s ease-out';
              requestAnimationFrame(() => {
                banner.style.opacity = '1';
                banner.style.transform = 'translateY(0)';
              });
            }, 1500);
          }
          document.getElementById('accept-cookies').onclick = () => {
            localStorage.setItem('sectros_cookie_consent', 'accepted');
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(16px)';
            setTimeout(() => banner.style.display = 'none', 500);
          };
          document.getElementById('decline-cookies').onclick = () => {
            localStorage.setItem('sectros_cookie_consent', 'declined');
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(16px)';
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
