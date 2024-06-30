/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: 'https://kilopi.net/pod/',
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'assets.coingecko.com',
          port: '',
          pathname: '/markets/images/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  