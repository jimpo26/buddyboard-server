/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["@auth/core"],
    transpilePackages: ["@activity-tracker/shared"], // if using shared package
};

module.exports = nextConfig;