export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://themonkeytype.com/sitemap.xml',
  }
}