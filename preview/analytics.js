// Anonymous usage statistics for the published gallery: PostHog EU cloud, no cookies or browser storage,
// no autocapture, session recordings or surveys. Loads after the page is idle and only on the public site.
// Copied to preview/analytics.js by the build.
(() => {
  const host = 'https://eu.i.posthog.com';
  const key = 'phc_w3NPzv7FtQAzaGfXmv3NMhez4qtxpAyfYEMQHnuAReSg'; // Public project key, meant for browsers.
  let forced = false;
  try { forced = localStorage.getItem('passport-stamps-analytics') === 'on'; } catch {}
  if (location.hostname !== 'pignottiluciano.github.io' && !forced) {
    window.psTrack = () => {};
    return;
  }

  // Minimal snippet stub: calls queue here and replay once the library replaces window.posthog.
  const stub = window.posthog = [];
  stub.__SV = 1;
  stub.people = [];
  stub._i = [[key, {
    api_host: host,
    persistence: 'memory',
    person_profiles: 'identified_only',
    autocapture: false,
    capture_dead_clicks: false,
    capture_performance: false,
    // Project settings may enable extras remotely; never download extension scripts.
    disable_external_dependency_loading: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: true,
    disable_surveys: true,
    respect_dnt: true
  }]];
  stub.capture = (...args) => { stub.push(['capture', ...args]); };
  window.psTrack = (event, properties) => window.posthog.capture(event, properties);

  // Declarative events: data-track="svg_downloaded" data-track-id="ar" sends {id: 'ar'}.
  document.addEventListener('click', event => {
    const element = event.target.closest?.('[data-track]');
    if (!element) return;
    const properties = {};
    for (const [name, value] of Object.entries(element.dataset)) {
      if (name.startsWith('track') && name !== 'track') properties[name[5].toLowerCase() + name.slice(6)] = value;
    }
    window.psTrack(element.dataset.track, properties);
  });

  const load = () => {
    const script = document.createElement('script');
    script.src = host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.append(script);
  };
  const idle = () => (window.requestIdleCallback ?? setTimeout)(load, {timeout: 3000});
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, {once: true});
})();
