const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    LINKURATOR_APP_ENV: process.env.LINKURATOR_APP_ENV,
  },
};
 
module.exports = withNextIntl(nextConfig);
