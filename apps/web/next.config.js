/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@plantropy/ui",
    "@plantropy/core-logic",
    "@plantropy/services",
    "@plantropy/store",
    "@plantropy/types",
    "@plantropy/utils"
  ]
};

module.exports = nextConfig;
