import React, { useState, useEffect } from 'react';
import {Save, Loader2, ChevronDown, ChevronRight, FileText, Home, DollarSign, Grid3X3, Building2, Puzzle, Users, Phone, BookOpen} from 'lucide-react';
import api from '../../services/centralApi';
import { CMS_DEFAULTS } from '../../data/cmsDefaults';
import StatusModal from '../../components/common/StatusModal';

const PAGE_ICONS = { home: Home, pricing: DollarSign, features: Grid3X3, solutions: Building2, integrations: Puzzle, about: Users, contact: Phone, blog: BookOpen };

const PAGE_LABELS = {
  home: 'Home Page', pricing: 'Pricing', features: 'Features', solutions: 'Solutions',
  integrations: 'Integrations', about: 'About', contact: 'Contact', blog: 'Blog',
};

function SectionField({ label, value, onChange, multiline, placeholder }) {
  if (multiline) {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
      />
    </div>
  );
}

function CardEditor({ label, cards, setCards, cardFields }) {
  const addCard = () => setCards([...cards, {}]);
  const removeCard = (i) => setCards(cards.filter((_, idx) => idx !== i));
  const updateCard = (i, field, val) => {
    const next = [...cards];
    next[i] = { ...next[i], [field]: val };
    setCards(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300">{label}</label>
        <button onClick={addCard} className="text-xs text-primary hover:underline font-semibold">+ Add item</button>
      </div>
      {cards.map((card, i) => (
        <div key={i} className="p-3 bg-muted/30 border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Item {i + 1}</span>
            <button onClick={() => removeCard(i)} className="text-[10px] text-red-400 hover:text-red-300 font-semibold">Remove</button>
          </div>
          {cardFields.map(field => (
            <SectionField
              key={field.key}
              label={field.label}
              value={card[field.key] || ''}
              onChange={v => updateCard(i, field.key, v)}
              multiline={field.multiline}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SectionAccordion({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <span className="text-sm font-bold text-foreground">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 space-y-4 border-t border-border">{children}</div>}
    </div>
  );
}

function PageEditor({ pageKey, data, onChange }) {
  const defaults = CMS_DEFAULTS[pageKey] || {};

  const set = (path, value) => {
    const parts = path.split('.');
    if (parts.some(p => p === '__proto__' || p === 'constructor' || p === 'prototype')) return;
    const newData = { ...data };
    let obj = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    onChange(newData);
  };

  const get = (path) => {
    const parts = path.split('.');
    let val = data;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) val = val[p];
      else return defaults && getDefault(defaults, path) || '';
    }
    return typeof val === 'string' ? val : '';
  };

  const getCards = (path) => {
    const parts = path.split('.');
    let val = data;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) val = val[p];
      else return getDefault(defaults, path) || [];
    }
    return Array.isArray(val) ? val : [];
  };

  const renderSection = (title, fields, defaultOpen) => (
    <SectionAccordion title={title} defaultOpen={defaultOpen}>
      {fields.map(f => {
        if (f.type === 'card') {
          return (
            <CardEditor
              key={f.path}
              label={f.label}
              cards={getCards(f.path)}
              setCards={v => onChange(deepSet(data, f.path, v))}
              cardFields={f.fields}
            />
          );
        }
        return (
          <SectionField
            key={f.path}
            label={f.label}
            value={get(f.path)}
            onChange={v => set(f.path, v)}
            multiline={f.multiline}
            placeholder={f.placeholder || getDefault(defaults, f.path)}
          />
        );
      })}
    </SectionAccordion>
  );

  return (
    <div className="space-y-4">
      {getPageSections(pageKey, renderSection)}
    </div>
  );
}

function getDefault(obj, path) {
  const parts = path.split('.');
  let val = obj;
  for (const p of parts) {
    if (val && typeof val === 'object' && p in val) val = val[p];
    else return '';
  }
  return typeof val === 'string' ? val : Array.isArray(val) ? val : '';
}

function deepSet(obj, path, value) {
  const parts = path.split('.');
  if (parts.some(p => p === '__proto__' || p === 'constructor' || p === 'prototype')) return obj;
  const result = { ...obj };
  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') current[parts[i]] = {};
    current[parts[i]] = { ...current[parts[i]] };
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return result;
}

function getPageSections(pageKey, renderSection) {
  switch (pageKey) {
    case 'home':
      return (
        <>
          {renderSection('Hero', [
            { path: 'hero.badge', label: 'Badge' },
            { path: 'hero.heading', label: 'Heading' },
            { path: 'hero.subheading', label: 'Subheading', multiline: true },
            { path: 'hero.cta_primary', label: 'Primary CTA' },
            { path: 'hero.cta_secondary', label: 'Secondary CTA' },
            { path: 'hero.tagline', label: 'Tagline' },
            { path: 'hero.industries', label: 'Animated industries (comma separated)' },
          ], true)}
          {renderSection('Trust Bar', [
            { path: 'trustBar.label', label: 'Label' },
            { path: 'trustBar.brands', label: 'Brands (comma separated)' },
          ])}
          {renderSection('Product Showcase', [
            { path: 'productShowcase.badge', label: 'Badge' },
            { path: 'productShowcase.heading', label: 'Heading' },
            { path: 'productShowcase.paragraph', label: 'Paragraph', multiline: true },
            { path: 'productShowcase.cards', label: 'Cards', type: 'card', fields: [
              { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', multiline: true },
            ]},
          ])}
          {renderSection('Feature Cluster', [
            { path: 'featureCluster.items', label: 'Feature Cards', type: 'card', fields: [
              { key: 'heading', label: 'Heading', multiline: true }, { key: 'description', label: 'Description', multiline: true },
            ]},
          ])}
          {renderSection('Pain Point Strip', [
            { path: 'painPoint.heading', label: 'Heading', multiline: true },
            { path: 'painPoint.pills', label: 'Pills (comma separated)' },
          ])}
          {renderSection('Reservations', [
            { path: 'reservations.badge', label: 'Badge' },
            { path: 'reservations.heading', label: 'Heading' },
            { path: 'reservations.paragraph', label: 'Paragraph', multiline: true },
            { path: 'reservations.bullets', label: 'Bullet points (one per line)', multiline: true },
          ])}
          {renderSection('Floor Plan', [
            { path: 'floorPlan.badge', label: 'Badge' },
            { path: 'floorPlan.heading', label: 'Heading' },
            { path: 'floorPlan.paragraph', label: 'Paragraph', multiline: true },
            { path: 'floorPlan.bullets', label: 'Bullet points (one per line)', multiline: true },
          ])}
          {renderSection('Guest CRM', [
            { path: 'guestCrm.badge', label: 'Badge' },
            { path: 'guestCrm.heading', label: 'Heading' },
            { path: 'guestCrm.paragraph', label: 'Paragraph', multiline: true },
            { path: 'guestCrm.bullets', label: 'Bullet points (one per line)', multiline: true },
          ])}
          {renderSection('Automation', [
            { path: 'automation.badge', label: 'Badge' },
            { path: 'automation.heading', label: 'Heading' },
            { path: 'automation.paragraph', label: 'Paragraph', multiline: true },
            { path: 'automation.bullets', label: 'Bullet points (one per line)', multiline: true },
          ])}
          {renderSection('Analytics', [
            { path: 'analytics.badge', label: 'Badge' },
            { path: 'analytics.heading', label: 'Heading' },
            { path: 'analytics.paragraph', label: 'Paragraph', multiline: true },
            { path: 'analytics.bullets', label: 'Bullet points (one per line)', multiline: true },
          ])}
          {renderSection('Mobile App', [
            { path: 'mobileApp.badge', label: 'Badge' },
            { path: 'mobileApp.heading', label: 'Heading' },
            { path: 'mobileApp.paragraph', label: 'Paragraph', multiline: true },
            { path: 'mobileApp.bullets', label: 'Bullet points (one per line)', multiline: true },
            { path: 'mobileApp.phone1_label', label: 'Phone 1 label' },
            { path: 'mobileApp.phone2_label', label: 'Phone 2 label' },
            { path: 'mobileApp.app_store_text', label: 'App Store prefix text' },
            { path: 'mobileApp.app_store_label', label: 'App Store label' },
            { path: 'mobileApp.google_play_text', label: 'Google Play prefix text' },
            { path: 'mobileApp.google_play_label', label: 'Google Play label' },
          ])}
          {renderSection('Integrations', [
            { path: 'integrations.heading', label: 'Heading' },
            { path: 'integrations.paragraph', label: 'Paragraph', multiline: true },
            { path: 'integrations.labels', label: 'Integration labels (comma separated)' },
          ])}
          {renderSection('Testimonials', [
            { path: 'testimonials.heading', label: 'Heading' },
            { path: 'testimonials.items', label: 'Testimonials', type: 'card', fields: [
              { key: 'quote', label: 'Quote', multiline: true },
              { key: 'author', label: 'Author' },
              { key: 'role', label: 'Role' },
            ]},
            { path: 'testimonials.stats', label: 'Stats', type: 'card', fields: [
              { key: 'value', label: 'Value' },
              { key: 'label', label: 'Label' },
            ]},
          ])}
          {renderSection('CTA Strip', [
            { path: 'ctaStrip.heading', label: 'Heading', multiline: true },
            { path: 'ctaStrip.button', label: 'Button text' },
          ])}
          {renderSection('Pricing Preview', [
            { path: 'pricingPreview.heading', label: 'Heading' },
            { path: 'pricingPreview.subheading', label: 'Subheading', multiline: true },
          ])}
          {renderSection('Beyond Booking', [
            { path: 'beyondBooking.heading', label: 'Heading' },
            { path: 'beyondBooking.paragraph', label: 'Paragraph', multiline: true },
            { path: 'beyondBooking.cards', label: 'Cards', type: 'card', fields: [
              { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', multiline: true },
            ]},
          ])}
          {renderSection('Partners', [
            { path: 'partners.label', label: 'Label' },
            { path: 'partners.names', label: 'Names (comma separated)' },
          ])}
          {renderSection('FAQ', [
            { path: 'faq.heading', label: 'Heading' },
          ])}
          {renderSection('Final CTA', [
            { path: 'finalCta.heading', label: 'Heading' },
            { path: 'finalCta.paragraph', label: 'Paragraph', multiline: true },
            { path: 'finalCta.cta_primary', label: 'Primary CTA' },
            { path: 'finalCta.cta_secondary', label: 'Secondary CTA' },
            { path: 'finalCta.caption', label: 'Caption' },
          ])}
        </>
      );
    case 'pricing':
      return (
        <>
          {renderSection('Hero', [
            { path: 'hero.badge', label: 'Badge' }, { path: 'hero.heading', label: 'Heading' }, { path: 'hero.paragraph', label: 'Paragraph', multiline: true },
          ], true)}
          {renderSection('Toggle', [
            { path: 'toggle.monthly', label: 'Monthly label' }, { path: 'toggle.yearly', label: 'Yearly label' }, { path: 'toggle.badge', label: 'Badge' },
          ])}
          {renderSection('Add-ons', [
            { path: 'addons.heading', label: 'Heading' }, { path: 'addons.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Compare Plans', [{ path: 'compare.heading', label: 'Heading' }])}
          {renderSection('Custom Plan CTA', [
            { path: 'customCta.heading', label: 'Heading' }, { path: 'customCta.paragraph', label: 'Paragraph', multiline: true }, { path: 'customCta.button', label: 'Button' },
          ])}
          {renderSection('FAQ', [{ path: 'faq.heading', label: 'Heading' }])}
          {renderSection('Final CTA', [
            { path: 'finalCta.heading', label: 'Heading' }, { path: 'finalCta.paragraph', label: 'Paragraph', multiline: true }, { path: 'finalCta.button', label: 'Button' },
          ])}
        </>
      );
    case 'features':
      return (
        <>
          {renderSection('Hero', [
            { path: 'hero.badge', label: 'Badge' }, { path: 'hero.heading', label: 'Heading' }, { path: 'hero.paragraph', label: 'Paragraph', multiline: true },
            { path: 'hero.cta_primary', label: 'Primary CTA' }, { path: 'hero.cta_secondary', label: 'Secondary CTA' },
            { path: 'hero.industries', label: 'Animated industries (comma separated)' },
          ], true)}
          {renderSection('Tabs', [{ path: 'tabs.labels', label: 'Tab labels (comma separated)' }])}
          {renderSection('Security & Reliability', [
            { path: 'security.badge', label: 'Badge' }, { path: 'security.heading', label: 'Heading' }, { path: 'security.paragraph', label: 'Paragraph', multiline: true },
            { path: 'security.cards', label: 'Cards', type: 'card', fields: [
              { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', multiline: true },
            ]},
          ])}
          {renderSection('CTA', [
            { path: 'cta.heading', label: 'Heading' }, { path: 'cta.paragraph', label: 'Paragraph', multiline: true },
            { path: 'cta.cta_primary', label: 'Primary CTA' }, { path: 'cta.cta_secondary', label: 'Secondary CTA' },
          ])}
          {renderSection('Tab: Reservations', [
            { path: 'tabContent.reservations.badge', label: 'Badge' }, { path: 'tabContent.reservations.heading', label: 'Heading' }, { path: 'tabContent.reservations.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Tab: Floor Plan', [
            { path: 'tabContent.floorPlan.badge', label: 'Badge' }, { path: 'tabContent.floorPlan.heading', label: 'Heading' }, { path: 'tabContent.floorPlan.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Tab: Guest CRM', [
            { path: 'tabContent.crm.badge', label: 'Badge' }, { path: 'tabContent.crm.heading', label: 'Heading' }, { path: 'tabContent.crm.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Tab: Automation', [
            { path: 'tabContent.automation.badge', label: 'Badge' }, { path: 'tabContent.automation.heading', label: 'Heading' }, { path: 'tabContent.automation.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Tab: Analytics', [
            { path: 'tabContent.analytics.badge', label: 'Badge' }, { path: 'tabContent.analytics.heading', label: 'Heading' }, { path: 'tabContent.analytics.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Tab: Integrations', [
            { path: 'tabContent.integrations.badge', label: 'Badge' }, { path: 'tabContent.integrations.heading', label: 'Heading' }, { path: 'tabContent.integrations.paragraph', label: 'Paragraph', multiline: true },
          ])}
        </>
      );
    case 'solutions':
      return (
        <>
          {renderSection('Hero', [
            { path: 'hero.heading', label: 'Heading' }, { path: 'hero.paragraph', label: 'Paragraph', multiline: true },
            { path: 'hero.cta_primary', label: 'Primary CTA' }, { path: 'hero.cta_secondary', label: 'Secondary CTA' },
          ], true)}
          {renderSection('Stats', [{ path: 'stats.heading', label: 'Heading' }])}
          {renderSection('Video', [
            { path: 'video.heading', label: 'Heading' }, { path: 'video.paragraph', label: 'Paragraph', multiline: true }, { path: 'video.button', label: 'Button' },
          ])}
          {renderSection('Testimonials', [{ path: 'testimonials.heading', label: 'Heading' }])}
          {renderSection('FAQ', [{ path: 'faq.heading', label: 'Heading' }])}
          {renderSection('Final CTA', [
            { path: 'finalCta.heading', label: 'Heading' }, { path: 'finalCta.paragraph', label: 'Paragraph', multiline: true },
            { path: 'finalCta.cta_primary', label: 'Primary CTA' }, { path: 'finalCta.cta_secondary', label: 'Secondary CTA' },
          ])}
        </>
      );
    case 'integrations':
      return (
        <>
          {renderSection('Hero', [
            { path: 'hero.heading', label: 'Heading' }, { path: 'hero.paragraph', label: 'Paragraph', multiline: true },
          ], true)}
          {renderSection('Ecosystem', [
            { path: 'ecosystem.heading', label: 'Heading' }, { path: 'ecosystem.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Featured', [
            { path: 'featured.heading', label: 'Heading' }, { path: 'featured.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('API', [
            { path: 'api.heading', label: 'Heading' }, { path: 'api.paragraph', label: 'Paragraph', multiline: true }, { path: 'api.button', label: 'Button' },
          ])}
          {renderSection('Request', [
            { path: 'request.heading', label: 'Heading' }, { path: 'request.paragraph', label: 'Paragraph', multiline: true }, { path: 'request.button', label: 'Button' },
          ])}
          {renderSection('FAQ', [{ path: 'faq.heading', label: 'Heading' }])}
        </>
      );
    case 'about':
      return (
        <>
          {renderSection('Hero', [
            { path: 'hero.heading', label: 'Heading', multiline: true }, { path: 'hero.paragraph', label: 'Paragraph', multiline: true },
          ], true)}
          {renderSection('Mission', [
            { path: 'mission.heading', label: 'Heading', multiline: true }, { path: 'mission.body1', label: 'Body 1', multiline: true }, { path: 'mission.body2', label: 'Body 2', multiline: true },
          ])}
          {renderSection('Philosophy', [
            { path: 'philosophy.heading', label: 'Heading' }, { path: 'philosophy.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Team', [
            { path: 'team.heading', label: 'Heading' }, { path: 'team.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Values', [
            { path: 'values.heading', label: 'Heading' }, { path: 'values.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Join CTA', [
            { path: 'joinCta.heading', label: 'Heading' }, { path: 'joinCta.paragraph', label: 'Paragraph', multiline: true },
            { path: 'joinCta.cta_primary', label: 'Primary CTA' }, { path: 'joinCta.cta_secondary', label: 'Secondary CTA' },
          ])}
        </>
      );
    case 'contact':
      return (
        <>
          {renderSection('Hero / Form Side', [
            { path: 'hero.heading', label: 'Heading' }, { path: 'hero.paragraph', label: 'Paragraph', multiline: true },
          ], true)}
          {renderSection('Right Panel', [
            { path: 'rightPanel.heading', label: 'Heading' },
            { path: 'rightPanel.bullets', label: 'Bullets (one per line)', multiline: true },
            { path: 'rightPanel.testimonial_quote', label: 'Testimonial quote', multiline: true },
            { path: 'rightPanel.testimonial_author', label: 'Testimonial author' },
          ])}
          {renderSection('Steps', [
            { path: 'steps.heading', label: 'Heading' }, { path: 'steps.paragraph', label: 'Paragraph', multiline: true },
          ])}
          {renderSection('Testimonial Block', [
            { path: 'testimonial.quote', label: 'Quote', multiline: true }, { path: 'testimonial.author', label: 'Author' },
          ])}
          {renderSection('FAQ', [{ path: 'faq.heading', label: 'Heading' }])}
          {renderSection('Final CTA', [
            { path: 'finalCta.heading', label: 'Heading' }, { path: 'finalCta.paragraph', label: 'Paragraph', multiline: true }, { path: 'finalCta.button', label: 'Button' },
          ])}
          {renderSection('Thank You', [
            { path: 'thankYou.heading', label: 'Heading' }, { path: 'thankYou.paragraph', label: 'Paragraph', multiline: true },
          ])}
        </>
      );
    case 'blog':
      return (
        <>
          {renderSection('Hero', [
            { path: 'hero.heading', label: 'Heading' }, { path: 'hero.paragraph', label: 'Paragraph', multiline: true }, { path: 'hero.search_placeholder', label: 'Search placeholder' },
          ], true)}
          {renderSection('Featured Article', [
            { path: 'featured.heading', label: 'Heading' }, { path: 'featured.category', label: 'Category' }, { path: 'featured.title', label: 'Title' },
            { path: 'featured.excerpt', label: 'Excerpt', multiline: true }, { path: 'featured.author', label: 'Author' },
            { path: 'featured.date', label: 'Date' }, { path: 'featured.read_time', label: 'Read time' }, { path: 'featured.link_text', label: 'Link text' },
          ])}
          {renderSection('Newsletter', [
            { path: 'newsletter.heading', label: 'Heading' }, { path: 'newsletter.paragraph', label: 'Paragraph', multiline: true },
            { path: 'newsletter.input_placeholder', label: 'Input placeholder' }, { path: 'newsletter.button', label: 'Button' }, { path: 'newsletter.caption', label: 'Caption' },
          ])}
        </>
      );
    default:
      return <p className="text-sm text-muted-foreground">No CMS sections defined for this page.</p>;
  }
}

export default function CMSContentManager({ settings, onSettingsChange }) {
  const [activePage, setActivePage] = useState('home');
  const [pageData, setPageData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    const parsed = {};
    for (const key of Object.keys(CMS_DEFAULTS)) {
      try {
        parsed[key] = settings[`cms_${key}`] ? JSON.parse(settings[`cms_${key}`]) : {};
      } catch {
        parsed[key] = {};
      }
    }
    setPageData(parsed);
    setLoading(false);
  }, [settings]);

  const handleChange = (pageKey, newData) => {
    setPageData(prev => ({ ...prev, [pageKey]: newData }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      for (const key of Object.keys(pageData)) {
        payload[`cms_${key}`] = JSON.stringify(pageData[key]);
      }
      await api.post('saas/settings', payload);
      onSettingsChange(payload);
      setModal({ isOpen: true, title: 'Content Saved', message: 'Website content has been updated successfully.', type: 'success' });
    } catch (err) {
      setModal({ isOpen: true, title: 'Save Failed', message: err.response?.data?.message || 'Failed to save CMS content.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin w-4 h-4" /> Loading CMS content...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-1">Content CMS</h3>
        <p className="text-sm text-muted-foreground">Edit all text content for the modern business OS theme. Changes are saved separately per page.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {Object.keys(PAGE_LABELS).map(key => {
          const Icon = PAGE_ICONS[key];
          return (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePage === key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {PAGE_LABELS[key]}
            </button>
          );
        })}
      </div>

      <PageEditor
        key={activePage}
        pageKey={activePage}
        data={pageData[activePage] || {}}
        onChange={d => handleChange(activePage, d)}
      />

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save CMS Content'}
        </button>
      </div>

      <StatusModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
