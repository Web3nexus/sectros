import { Helmet } from 'react-helmet-async'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://sectros.com'

export function SEOHead({ title, description, path, ogType, ogImage, noIndex, schema, breadcrumbs }) {
  const fullTitle = title || 'Sectros — All-in-One Business Platform'
  const fullDescription = description || 'All-in-one business management platform for restaurants, salons, and hotels.'
  const canonical = `${SITE_URL}${path || window.location.pathname}`
  const image = ogImage || `${SITE_URL}/sectros_full_logo_dark.png`

  const jsonLd = schema || {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: fullTitle,
    description: fullDescription,
    url: canonical,
  }

  if (breadcrumbs) {
    jsonLd.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path}`,
      })),
    }
  }

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType || 'website'} />
      <meta property="og:site_name" content="Sectros" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
