/** @type {import('next').NextConfitg } */
const nextConfig = {
  transpilePackages: ["react-tweet"],
  swcMinify: true,
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
