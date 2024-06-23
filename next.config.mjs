/** @type {import('next').NextConfig} */
const nextConfig = {
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
  