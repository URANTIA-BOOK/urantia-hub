// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3e482dce99f521fbb29aeda8001efd2a@o4506857923739648.ingest.us.sentry.io/4506857924984832",

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

  // Symbols that exist in no bundle we ship, plus well-known browser noise.
  ignoreErrors: [
    /READER_LANGS is not defined/,
    /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/,
    /Non-Error promise rejection captured/,
    /^Java(script)? exception/i,
    /window\.webkit\.messageHandlers/,
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
