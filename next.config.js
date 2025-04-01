/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'placehold.co',
      'via.placeholder.com',
      'picsum.photos',
      'images.unsplash.com',
      'placekitten.com'
    ],
  },
};

module.exports = nextConfig; 