/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    assetPrefix: process.env.NODE_ENV === 'production' ? 'https://admin.legendmotorsuae.com' : '',
    basePath: process.env.NODE_ENV === 'production' ? '' : '',
};

module.exports = nextConfig;
