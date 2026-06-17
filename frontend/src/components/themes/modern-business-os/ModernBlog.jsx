import { motion } from 'framer-motion';
import { useCmsContent } from '../../../hooks/useCmsContent';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {Calendar, User, ArrowRight, Tag, Search, ChevronRight, Briefcase, Mail, BookOpen, Lightbulb, BarChart3, Building2, Quote, TrendingUp, } from 'lucide-react';

const categories = ['All', 'Product', 'Tips', 'Industry', 'Case Studies'];

const articles = [
  {
    category: 'Product',
    title: 'Introducing Smart Waitlist: Real-time capacity management',
    excerpt: 'Our new Smart Waitlist feature uses AI to predict table turnover times, reducing guest wait times by an average of 35%.',
    author: 'Priya Kapoor',
    date: 'May 15, 2025',
    readTime: '4 min read',
    imageLabel: 'Product launch',
  },
  {
    category: 'Tips',
    title: '10 ways to boost restaurant revenue during slow seasons',
    excerpt: 'Practical strategies hospitality operators use to maintain steady revenue during traditionally slower months.',
    author: 'Alexis Moreno',
    date: 'May 10, 2025',
    readTime: '6 min read',
    imageLabel: 'Revenue tips',
  },
  {
    category: 'Industry',
    title: '2025 hospitality technology trends every operator should know',
    excerpt: 'From AI-powered forecasting to contactless payments, here are the trends reshaping the hospitality industry.',
    author: 'James Okonkwo',
    date: 'May 5, 2025',
    readTime: '7 min read',
    imageLabel: 'Industry trends',
  },
  {
    category: 'Case Studies',
    title: 'How The Grand Bistro cut no-shows by 70% with automated reminders',
    excerpt: 'See how a busy downtown restaurant transformed its reservation management and dramatically reduced lost revenue.',
    author: 'David Chen',
    date: 'April 28, 2025',
    readTime: '5 min read',
    imageLabel: 'Case study',
  },
  {
    category: 'Tips',
    title: 'Building a better guest experience: A practical guide',
    excerpt: 'Hospitality is about more than great food. Learn how to create memorable experiences that keep guests coming back.',
    author: 'Priya Kapoor',
    date: 'April 20, 2025',
    readTime: '5 min read',
    imageLabel: 'Guest experience',
  },
  {
    category: 'Product',
    title: 'New integration: Sync your menu directly from Toast POS',
    excerpt: 'Our new Toast integration automatically syncs menu items, prices, and availability in real time.',
    author: 'David Chen',
    date: 'April 15, 2025',
    readTime: '3 min read',
    imageLabel: 'Integration',
  },
  {
    category: 'Industry',
    title: 'The state of multi-location hospitality management in 2025',
    excerpt: 'As hospitality groups expand, the challenges of managing multiple venues become more complex. Here\'s how technology is helping.',
    author: 'Alexis Moreno',
    date: 'April 8, 2025',
    readTime: '8 min read',
    imageLabel: 'Multi-location',
  },
];

const featured = {
  category: 'Case Studies',
  title: 'Rivera Hospitality Group: Scaling from one venue to five with Sectros',
  excerpt: 'When Rivera Hospitality Group expanded from a single restaurant to five distinct venues across the city, they needed a platform that could grow with them. Here\'s how Sectros helped them maintain consistency while scaling operations.',
  author: 'Priya Kapoor',
  date: 'May 20, 2025',
  readTime: '8 min read',
  imageLabel: 'Featured story',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ModernBlog() {
  const { get } = useCmsContent('blog');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? articles
    : articles.filter((a) => a.category === activeFilter);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-6 py-24 text-white sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {get('hero.heading')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            {get('hero.paragraph')}
          </p>
          <div className="relative mx-auto mt-10 max-w-md">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              placeholder={get('hero.search_placeholder')}
              className="w-full rounded-full border border-white/20 bg-white/10 px-12 py-3 text-sm text-white placeholder-blue-200 outline-none backdrop-blur transition focus:bg-white/20 focus:ring-2 focus:ring-white/30"
            />
          </div>
        </motion.div>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-3xl" />
      </section>

      <section className="px-6 py-16 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{get('featured.heading')}</h2>
          <motion.div
            whileHover={{ y: -4 }}
            className="group relative mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg sm:flex"
          >
            <div className="relative flex h-56 shrink-0 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 sm:h-auto sm:w-96">
              <div className="text-center text-white">
                <BookOpen size={40} className="mx-auto opacity-50" />
                <p className="mt-2 text-sm font-medium opacity-70">{featured.imageLabel}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {get('featured.category')}
              </span>
              <h3 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">{get('featured.title')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{get('featured.excerpt')}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <User size={14} /> {get('featured.author')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {get('featured.date')}
                </span>
                <span>{get('featured.read_time')}</span>
              </div>
              <Link
                to="/blog/rivera-hospitality-group"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
              >
                {get('featured.link_text')} <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-gray-50 px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  activeFilter === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((a) => (
              <motion.article
                key={a.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                  {a.category === 'Case Studies' && <Building2 size={36} className="opacity-40" />}
                  {a.category === 'Tips' && <Lightbulb size={36} className="opacity-40" />}
                  {a.category === 'Industry' && <BarChart3 size={36} className="opacity-40" />}
                  {a.category === 'Product' && <Briefcase size={36} className="opacity-40" />}
                  <span className="sr-only">{a.imageLabel}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {a.category}
                  </span>
                  <h3 className="mt-3 text-base font-bold leading-snug text-gray-900 group-hover:text-blue-600">
                    {a.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{a.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={13} /> {a.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {a.date}
                    </span>
                  </div>
                  <Link
                    to={`/blog/${a.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600"
                  >
                    Read more <ChevronRight size={15} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-14 text-center text-white shadow-xl sm:px-12"
        >
          <Briefcase size={36} className="mx-auto text-blue-200" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">{get('newsletter.heading')}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100">
            {get('newsletter.paragraph')}
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
              <input
                type="email"
                required
                placeholder={get('newsletter.input_placeholder')}
                className="w-full rounded-full border border-white/20 bg-white/10 px-11 py-3 text-sm text-white placeholder-blue-200 outline-none backdrop-blur transition focus:bg-white/20 focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              {get('newsletter.button')} <ArrowRight size={16} />
            </button>
          </form>
          <p className="mt-4 text-xs text-blue-200">{get('newsletter.caption')}</p>
        </motion.div>
      </section>
    </div>
  );
}
