let userConfig = undefined;
try {
  // try to import ESM first
  userConfig = await import("./v0-user-next.config.mjs");
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack(config, { isServer }) {
    // Add support for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    // Mark onnxruntime-node as external to avoid bundling native binaries
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("onnxruntime-node");
      } else if (typeof config.externals === "function") {
        const originalExternals = config.externals;
        config.externals = async (context, request, callback) => {
          if (request === "onnxruntime-node") {
            return callback(null, "commonjs " + request);
          }
          return originalExternals(context, request, callback);
        };
      }
    }

    return config;
  },
};

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig;

  for (const key in config) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      };
    } else {
      nextConfig[key] = config[key];
    }
  }
}

export default nextConfig;
