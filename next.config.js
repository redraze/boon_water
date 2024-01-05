/** @type {import('next').NextConfig} */
const nextConfig = {
   // set output to 'standalone' when building with docker,
   // or set to 'export' when building and deploying to gihub pages
   output: 'standalone'
   // output: 'export'
}

module.exports = nextConfig
