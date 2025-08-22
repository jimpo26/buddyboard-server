/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["@auth/core"],
    transpilePackages: ["@activity-tracker/shared"], // if using shared package
    eslint: {
        ignoreDuringBuilds: true
    }
};

module.exports = nextConfig;