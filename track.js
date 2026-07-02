/**
 * Tenzi shared analytics tracker.
 * Served at https://tenzi.ai/track.js — loaded by tenzi.ai (marketing),
 * resources.tenzi.ai (free data) and partner.tenzi.ai (broker portal).
 * Single source of truth for client-side events.
 *
 * Usage (any page, bottom of <body>):
 *   <script src="https://tenzi.ai/track.js"></script>
 *   <script>tenziTrack.init({ site: 'marketing' })</script>
 *   (or { site: 'resources' }, or { site: 'partner', user: '<broker-id>' })
 *
 * Public API (tenziTrack.*):
 *   init({ site, user })   — fire page view, start dwell timer; optional user
 *                            = known-visitor id sent as recipient on every beacon.
 *                            When no user is given, a ?tzr=<recipient> URL param
 *                            (appended by the newsletter redirect at
 *                            resources.tenzi.ai/r/) is picked up instead, stripped
 *                            from the URL, and kept in sessionStorage so the rest
 *                            of the tab session stays attributed
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
 * D=ip, E=referrer, F=site, G=recipient — the init user id when one is set).
 * Dwell time is captured on pagehide as "(dwell: N)"
 * where N = whole seconds the tab was visible (capped 3600, skipped below 2).
 */
(function(global) {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzO6crfhklS6kIOXOGNIBBSk9ZiIUdM1lESOw6hGkqfE7qxz9MbVz47_ydAitFyFQtW/exec';
  var DWELL_MAX_SECONDS = 3600;
  var DWELL_MIN_SECONDS = 2;

  var site = '';
  var user = '';
  var visitorIp = '';
  var ipRequested = false;
  var ipPending = [];
  var dwellVisibleSince = null;
  var dwellAccumulatedMs = 0;
  var dwellFired = false;

  // Callbacks registered while the ipify fetch is in flight are queued and
  // all flushed together when it resolves — otherwise the page-view beacon
  // wins the race against the IP lookup and lands in the sheet with an
  // empty IP, breaking the dashboard's unique-visitor count.
  function ensureIp(cb) {
    if (visitorIp) { cb && cb(visitorIp); return; }
    if (cb) ipPending.push(cb);
    if (ipRequested) return;
    ipRequested = true;
    fetch('https://api.ipify.org?format=json')
      .then(function(r) { return r.json(); })
      .then(function(d) { flushIp(d.ip || ''); })
      .catch(function() { flushIp(''); });
  }

  function flushIp(ip) {
    visitorIp = ip;
    var pending = ipPending;
    ipPending = [];
    pending.forEach(function(f) { f(ip); });
  }

  // Newsletter hand-off: the /r/ click redirect appends ?tzr=<recipient> to
  // tenzi.ai destinations so the visit stays attributable after the redirect.
  // The id is lifted out of the URL immediately (replaceState, so it never
  // lingers in the address bar or gets copied into shared links) and kept in
  // sessionStorage so follow-on pages in the same tab stay attributed.
  function resolveHandoffUser() {
    var fromUrl = '';
    try {
      var params = new URLSearchParams(window.location.search);
      fromUrl = params.get('tzr') || '';
      if (fromUrl) {
        params.delete('tzr');
        var qs = params.toString();
        var clean = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
        window.history.replaceState(null, '', clean);
      }
    } catch (err) {}
    try {
      if (fromUrl) {
        sessionStorage.setItem('tenzi_tzr', fromUrl);
        return fromUrl;
      }
      return sessionStorage.getItem('tenzi_tzr') || '';
    } catch (err) {
      return fromUrl;
    }
  }

  function buildGetUrl(eventName, ip) {
    var url = ENDPOINT
      + '?email=' + encodeURIComponent(eventName)
      + '&page=' + encodeURIComponent(document.title)
      + '&ref=' + encodeURIComponent(document.referrer);
    if (site) url += '&site=' + encodeURIComponent(site);
    // Known-visitor id (e.g. partner-site broker) — the Apps Script writes it
    // to the Events sheet recipient column (G), the slot newsletter identity
    // already uses, so no endpoint change is needed.
    if (user) url += '&recipient=' + encodeURIComponent(user);
    if (ip) url += '&ip=' + encodeURIComponent(ip);
    // UA travels via URL param because Apps Script doGet doesn't expose
    // request headers — same reason ip is passed explicitly. Used by the
    // dashboard to flag scanner traffic (HeadlessChrome, Mimecast etc.).
    if (navigator.userAgent) url += '&ua=' + encodeURIComponent(navigator.userAgent);
    return url;
  }

  // Send a beacon URL to the endpoint. Prefers fetch+keepalive so the request
  // survives page unload (fast bounce, same-tab outbound click, BFCache freeze);
  // falls back to Image beacon for older browsers without keepalive support.
  function sendUrl(url) {
    try {
      if (typeof fetch === 'function') {
        fetch(url, { method: 'GET', keepalive: true, mode: 'no-cors' }).catch(function(){});
        return;
      }
    } catch (err) {}
    new Image().src = url;
  }

  function trackBeacon(eventName) {
    ensureIp(function(ip) {
      sendUrl(buildGetUrl(eventName, ip));
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
    if (data.ua === undefined) data.ua = navigator.userAgent || '';
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

  // BFCache restore — browsers (Chrome, Safari, Firefox) freeze pages on
  // back/forward navigation and replay them without re-running init(). Without
  // this hook those return visits never register a page view, and any extra
  // visible time on the restored session is dropped because dwellFired is
  // already true. Reset the dwell counters and fire a fresh page view so the
  // restored session is counted.
  function handlePageShow(e) {
    if (!e || !e.persisted) return;
    dwellFired = false;
    dwellAccumulatedMs = 0;
    dwellVisibleSince = (document.visibilityState === 'visible') ? Date.now() : null;
    trackBeacon('(page view)');
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
    sendUrl(buildGetUrl('(dwell: ' + seconds + ')', visitorIp));
  }

  function startDwell() {
    if (document.visibilityState === 'visible') {
      dwellVisibleSince = Date.now();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', fireDwell);
    window.addEventListener('beforeunload', fireDwell);
    window.addEventListener('pageshow', handlePageShow);
  }

  function init(opts) {
    site = (opts && opts.site) || '';
    user = (opts && opts.user) || resolveHandoffUser();
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
