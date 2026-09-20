// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only a Vercel deployment reports. Local runs and forks of this public repo
  // set no VERCEL_ENV, so their errors never reach this project. The client
  // needs the NEXT_PUBLIC_ copy: Next.js inlines only those into browser code,
  // so the bare VERCEL_ENV reads as undefined here and disables reporting.
  enabled: !!process.env.NEXT_PUBLIC_VERCEL_ENV,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Browser extensions inject scripts into the page. Our global error handler
  // catches their failures and reports them as ours. Drop them at the source.
  denyUrls: [
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-web-extension:\/\//i,
    /^safari-extension:\/\//i,
    /^chrome:\/\//i,
    /^webkit-masked-url:/i,
    /extensions\//i,
  ],

  // Well-known browser noise.
  ignoreErrors: [
    /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/,
    /Non-Error promise rejection captured/,
    /^Java(script)? exception/i,
    /window\.webkit\.messageHandlers/,
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
