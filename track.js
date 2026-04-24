/**
 * Tenzi shared analytics tracker.
 * Served at https://tenzi.ai/track.js — loaded by tenzi.ai (marketing) and
 * resources.tenzi.ai (free data). Single source of truth for client-side events.
 *
 * Usage (any page, bottom of <body>):
 *   <script src="https://tenzi.ai/track.js"></script>
 *   <script>tenziTrack.init({ site: 'marketing' })</script>
 *   (or { site: 'resources' })
 *
 * Public API (tenziTrack.*):
 *   init({ site })         — fire page view, start dwell timer
 *   trackCta(action)       — fire (cta: action) beacon
 *   trackBeacon(event)     — fire beacon with arbitrary event string
 *   postForm(data)         — POST JSON to endpoint with site/page/ip/referrer/timestamp auto-added
 *   getVisitorIp()         — cached IP from api.ipify.org (best-effort, may be empty)
 *
 * Back-compat globals (defined at module load so inline onclick works immediately):
 *   window.trackCta
 *   window.trackBeacon
 *
 * Events land in the Apps Script Events sheet (column A=event, B=page, C=timestamp,
 * D=ip, E=referrer, F=site). Dwell time is captured on pagehide as "(dwell: N)"
 * where N = whole seconds the tab was visible (capped 3600, skipped below 2).
 */
(function(global) {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzO6crfhklS6kIOXOGNIBBSk9ZiIUdM1lESOw6hGkqfE7qxz9MbVz47_ydAitFyFQtW/exec';
  var DWELL_MAX_SECONDS = 3600;
  var DWELL_MIN_SECONDS = 2;

  var site = '';
  var visitorIp = '';
  var ipRequested = false;
  var dwellVisibleSince = null;
  var dwellAccumulatedMs = 0;
  var dwellFired = false;

  function ensureIp(cb) {
    if (visitorIp) { cb && cb(visitorIp); return; }
    if (ipRequested) { cb && cb(''); return; }
    ipRequested = true;
    fetch('https://api.ipify.org?format=json')
      .then(function(r) { return r.json(); })
      .then(function(d) { visitorIp = d.ip || ''; cb && cb(visitorIp); })
      .catch(function() { cb && cb(''); });
  }

  function buildGetUrl(eventName, ip) {
    var url = ENDPOINT
      + '?email=' + encodeURIComponent(eventName)
      + '&page=' + encodeURIComponent(document.title)
      + '&ref=' + encodeURIComponent(document.referrer);
    if (site) url += '&site=' + encodeURIComponent(site);
    if (ip) url += '&ip=' + encodeURIComponent(ip);
    return url;
  }

  function trackBeacon(eventName) {
    ensureIp(function(ip) {
      new Image().src = buildGetUrl(eventName, ip);
    });
  }

  function trackCta(action) {
    trackBeacon('(cta: ' + action + ')');
  }

  function postForm(data) {
    data = data || {};
    data.page = data.page || document.title;
    data.timestamp = data.timestamp || new Date().toISOString();
    if (data.referrer === undefined) data.referrer = document.referrer;
    data.site = data.site || site;
    data.ip = data.ip || visitorIp;
    return fetch(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
      mode: 'no-cors'
    }).catch(function(){});
  }

  function handleVisibility() {
    if (document.visibilityState === 'hidden') {
      if (dwellVisibleSince !== null) {
        dwellAccumulatedMs += Date.now() - dwellVisibleSince;
        dwellVisibleSince = null;
      }
    } else if (document.visibilityState === 'visible') {
      dwellVisibleSince = Date.now();
    }
  }

  function fireDwell() {
    if (dwellFired) return;
    dwellFired = true;
    if (dwellVisibleSince !== null) {
      dwellAccumulatedMs += Date.now() - dwellVisibleSince;
      dwellVisibleSince = null;
    }
    var seconds = Math.min(Math.round(dwellAccumulatedMs / 1000), DWELL_MAX_SECONDS);
    if (seconds < DWELL_MIN_SECONDS) return;
    var url = buildGetUrl('(dwell: ' + seconds + ')', visitorIp);
    // fetch+keepalive survives page unload on modern browsers; fallback to Image beacon.
    try {
      if (typeof fetch === 'function') {
        fetch(url, { method: 'GET', keepalive: true, mode: 'no-cors' }).catch(function(){});
        return;
      }
    } catch (err) {}
    new Image().src = url;
  }

  function startDwell() {
    if (document.visibilityState === 'visible') {
      dwellVisibleSince = Date.now();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', fireDwell);
    window.addEventListener('beforeunload', fireDwell);
  }

  function init(opts) {
    site = (opts && opts.site) || '';
    ensureIp(function(){});
    trackBeacon('(page view)');
    startDwell();
  }

  global.tenziTrack = {
    init: init,
    trackCta: trackCta,
    trackBeacon: trackBeacon,
    postForm: postForm,
    getVisitorIp: function() { return visitorIp; }
  };

  // Back-compat globals — existing pages have inline onclick="trackCta(...)".
  global.trackCta = trackCta;
  global.trackBeacon = trackBeacon;
})(window);
