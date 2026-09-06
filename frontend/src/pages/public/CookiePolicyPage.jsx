import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Shield, Settings, AlertCircle, CheckCircle } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const TOC_ITEMS = [
  { id: 'what-are-cookies',        label: 'What Are Cookies' },
  { id: 'how-we-use-cookies',      label: 'How We Use Cookies' },
  { id: 'types-of-cookies',        label: 'Types of Cookies We Use' },
  { id: 'third-party-services',    label: 'Third-Party Services' },
  { id: 'managing-preferences',    label: 'Managing Cookie Preferences' },
  { id: 'changes-to-policy',       label: 'Changes to This Policy' },
  { id: 'contact',                 label: 'Contact' },
];

const COOKIE_TABLE = [
  { name: '_session',             category: 'Essential',    purpose: 'User authentication and security',                            duration: 'Session' },
  { name: 'sectros_consent',      category: 'Preferences',  purpose: 'Stores your cookie consent preferences',                      duration: '1 year' },
  { name: '_ga, _gid',            category: 'Analytics',    purpose: 'Google Analytics — helps us understand site usage',            duration: '2 years / 24h' },
  { name: '_fbp',                 category: 'Marketing',    purpose: 'Facebook Pixel — ad attribution and retargeting',              duration: '3 months' },
  { name: 'intercom-session-*',   category: 'Functional',   purpose: 'Customer support chat widget',                                 duration: '7 days' },
];

const CATEGORY_COLORS = {
  Essential:   'bg-indigo-50 text-indigo-700',
  Preferences: 'bg-violet-50 text-violet-700',
  Analytics:   'bg-sky-50 text-sky-700',
  Marketing:   'bg-rose-50 text-rose-700',
  Functional:  'bg-emerald-50 text-emerald-700',
};

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
        <Icon size={18} />
      </span>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">{children}</h2>
    </div>
  );
}

function Prose({ children }) {
  return <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>;
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 text-white">
                <Cookie size={22} />
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Cookie Policy</h1>
            </div>
            <p className="text-sm font-medium text-indigo-600 mb-3">Last updated: September 1, 2026</p>
            <p className="text-slate-600 max-w-2xl leading-relaxed">
              This Cookie Policy explains how Sectros uses cookies and similar tracking technologies
              when you visit our website or use our platform. We believe in full transparency about
              the data we collect and why — so you can make informed choices about your privacy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Body: TOC + Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="lg:flex lg:gap-14">

          {/* Sticky TOC Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">On this page</p>
              <nav className="space-y-1">
                {TOC_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-slate-500 hover:text-indigo-600 hover:pl-1 transition-all duration-150 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-3"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 max-w-2xl space-y-14">

            {/* 1. What Are Cookies */}
            <motion.section id="what-are-cookies" {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }}>
              <SectionHeading icon={Cookie}>What Are Cookies</SectionHeading>
              <Prose>
                <p>
                  Cookies are small text files placed on your device (computer, tablet, or phone) by
                  websites you visit. They are widely used to make websites work efficiently and to
                  provide information to site owners.
                </p>
                <p>
                  A cookie typically contains the name of the website it came from, how long the
                  cookie will exist on your device, and a value — usually a randomly generated unique
                  number. Cookies cannot run programs or deliver viruses to your computer.
                </p>
                <p>
                  Some cookies are set by us (<em>first-party cookies</em>), while others are set by
                  third-party services we use (<em>third-party cookies</em>). Both types are covered
                  by this policy.
                </p>
              </Prose>
            </motion.section>

            {/* 2. How We Use Cookies */}
            <motion.section id="how-we-use-cookies" {...fadeUp} transition={{ duration: 0.5, delay: 0.08 }}>
              <SectionHeading icon={Shield}>How We Use Cookies</SectionHeading>
              <Prose>
                <p>We use cookies for three core purposes:</p>
                <ul className="list-none space-y-3 mt-2">
                  {[
                    { label: 'Functional', desc: 'To keep you logged in, remember your preferences, and ensure core platform features work correctly.' },
                    { label: 'Analytics', desc: 'To understand how visitors interact with our site — which pages are popular, where people drop off, and how we can improve the experience.' },
                    { label: 'Marketing', desc: 'To show you relevant ads and measure the effectiveness of our campaigns on platforms like Google and Meta.' },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex gap-3">
                      <CheckCircle size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                      <span><strong className="text-slate-800">{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  We only activate analytics and marketing cookies once you have given your explicit
                  consent via our cookie consent banner.
                </p>
              </Prose>
            </motion.section>

            {/* 3. Types of Cookies We Use */}
            <motion.section id="types-of-cookies" {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <SectionHeading icon={AlertCircle}>Types of Cookies We Use</SectionHeading>
              <Prose>
                <p>The table below lists the specific cookies deployed on the Sectros platform.</p>
              </Prose>
              <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="text-left px-4 py-3 font-semibold">Name</th>
                      <th className="text-left px-4 py-3 font-semibold">Category</th>
                      <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Purpose</th>
                      <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_TABLE.map((row, i) => (
                      <tr key={row.name} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">{row.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[row.category]}`}>
                            {row.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{row.purpose}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>

            {/* 4. Third-Party Services */}
            <motion.section id="third-party-services" {...fadeUp} transition={{ duration: 0.5, delay: 0.12 }}>
              <SectionHeading icon={Shield}>Third-Party Services</SectionHeading>
              <Prose>
                <p>We integrate with the following third-party services, each of which may set their own cookies:</p>
                <ul className="list-none space-y-3 mt-2">
                  {[
                    { name: 'Google Analytics', desc: "Used to measure website traffic and user behaviour. Data is anonymised and aggregated. You can opt out via the Google Analytics Opt-out Browser Add-on." },
                    { name: 'Meta Pixel (Facebook)', desc: "Used for ad attribution and retargeting on Facebook and Instagram. Governed by Meta's Data Policy." },
                    { name: 'Intercom', desc: "Powers our in-app customer support chat widget. Intercom may set cookies to identify returning users and maintain chat sessions." },
                    { name: 'Stripe', desc: "Handles all payment processing. Stripe cookies are only active on payment-related pages and are strictly necessary for secure transactions. We never see or store your card details." },
                  ].map(({ name, desc }) => (
                    <li key={name} className="pl-4 border-l-2 border-indigo-200">
                      <strong className="text-slate-800">{name}:</strong> <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </Prose>
            </motion.section>

            {/* 5. Managing Cookie Preferences */}
            <motion.section id="managing-preferences" {...fadeUp} transition={{ duration: 0.5, delay: 0.14 }}>
              <SectionHeading icon={Settings}>Managing Cookie Preferences</SectionHeading>
              <Prose>
                <p>
                  You have full control over the cookies stored on your device. Here are your options:
                </p>
                <ul className="list-none space-y-3 mt-2">
                  {[
                    { label: 'Cookie Consent Banner', desc: "When you first visit Sectros you'll see our consent banner. You can accept all, reject non-essential, or customise your choices at any time by clicking \"Cookie Preferences\" in the site footer." },
                    { label: 'Browser Settings', desc: "Most browsers let you block or delete cookies via Settings → Privacy → Cookies. Note that blocking essential cookies may break core platform functionality." },
                    { label: 'Google Analytics Opt-out', desc: "Install the Google Analytics Opt-out Browser Add-on (tools.google.com/dlpage/gaoptout) to prevent data collection across all sites." },
                    { label: 'Meta Ad Preferences', desc: "Visit facebook.com/ads/preferences to manage interest-based advertising from Meta." },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex gap-3">
                      <CheckCircle size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                      <span><strong className="text-slate-800">{label}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </Prose>
            </motion.section>

            {/* 6. Changes to This Policy */}
            <motion.section id="changes-to-policy" {...fadeUp} transition={{ duration: 0.5, delay: 0.16 }}>
              <SectionHeading icon={AlertCircle}>Changes to This Policy</SectionHeading>
              <Prose>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our
                  practices, technology, or legal requirements. When we make material changes, we
                  will notify you by displaying a banner on the Sectros platform prompting you to
                  review and re-confirm your preferences.
                </p>
                <p>
                  The "Last updated" date at the top of this page always reflects when the policy
                  was most recently revised. We encourage you to review this page periodically.
                </p>
              </Prose>
            </motion.section>

            {/* 7. Contact */}
            <motion.section id="contact" {...fadeUp} transition={{ duration: 0.5, delay: 0.18 }}>
              <SectionHeading icon={CheckCircle}>Contact</SectionHeading>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-6">
                <p className="text-slate-700 leading-relaxed mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please
                  do not hesitate to get in touch with our privacy team.
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shrink-0">
                    <Cookie size={17} />
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Privacy Team</p>
                    <a
                      href="mailto:privacy@sectros.com"
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      privacy@sectros.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.section>

          </main>
        </div>
      </div>
    </div>
  );
}
