/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

/** @type {import("next").NextConfig} */
const config = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  // Output mode: only set "standalone" for Docker builds
  // Omit "output" key entirely for local dev so middleware, API routes, and SSR work
  ...(process.env.NEXT_OUTPUT_MODE === "standalone"
    ? { output: "standalone" }
    : {}),

  // Base path (only relevant for static hosting)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  // Disable image optimization
  images: {
    unoptimized: true,
  },

  // reactCompiler disabled: it runs as a babel subprocess inside Turbopack and
  // causes a timeout panic in Docker's resource-constrained build environment.
  // reactCompiler: true,

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
