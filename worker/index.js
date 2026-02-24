/*
 * Cloudflare Worker — GitHub API Proxy + Favourite Notification Emails
 *
 * Secrets required (set via Cloudflare dashboard or `wrangler secret put`):
 *   GITHUB_TOKEN        — GitHub personal access token (repo scope)
 *   RESEND_API_KEY      — Resend API key
 *   NOTIFICATION_FROM   — Sender address, e.g. "Ginza Empire <noreply@yourdomain.com>"
 */

const ALLOWED_ORIGIN = 'https://sydneyginza.github.io';
const DATA_REPO = 'sydneyginza/files';
const GH_API = 'https://api.github.com';
const NOTIF_LOG_PATH = 'data/notification_log.json';

/* ── Helpers ── */

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResp(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function decContent(base64) {
  const raw = atob(base64.replace(/\n/g, ''));
  return JSON.parse(decodeURIComponent(escape(raw)));
}

function encContent(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj, null, 2))));
}

function getAEDTDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
}

function fmtDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function fmtTime12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h < 12 ? 'AM' : 'PM';
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return hr + ':' + String(m).padStart(2, '0') + ' ' + ap;
}

function nameToSlug(name) {
  return encodeURIComponent((name || '').trim().replace(/\s+/g, '-'));
}

/* ── Web Push Helpers (RFC 8291 via Web Crypto API) ── */

function base64UrlEncode(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const padded = str + '='.repeat((4 - str.length % 4) % 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function createVapidJwt(audience, env) {
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: now + 43200,
    sub: 'mailto:admin@sydneyginza.github.io'
  })));
  const unsignedToken = header + '.' + payload;
  const key = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(env.VAPID_PRIVATE_JWK),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsignedToken)
  );
  /* Convert DER-style WebCrypto signature to raw r||s (64 bytes) */
  const sigBytes = new Uint8Array(sig);
  return unsignedToken + '.' + base64UrlEncode(sigBytes);
}

async function hkdfDeriveKey(ikm, salt, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
  return new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8)
  );
}

async function encryptPushPayload(subscription, payload) {
  const subKey = base64UrlDecode(subscription.keys.p256dh);
  const authSecret = base64UrlDecode(subscription.keys.auth);

  /* Generate ephemeral ECDH key pair */
  const localKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const localPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', localKeyPair.publicKey));

  /* Import subscriber's public key */
  const subscriberKey = await crypto.subtle.importKey('raw', subKey, { name: 'ECDH', namedCurve: 'P-256' }, false, []);

  /* ECDH shared secret */
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: subscriberKey }, localKeyPair.privateKey, 256)
  );

  /* Key derivation (RFC 8291) */
  const enc = new TextEncoder();
  const keyInfoBuf = new Uint8Array([
    ...enc.encode('WebPush: info\0'),
    ...subKey,
    ...localPubRaw
  ]);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const ikm = await hkdfDeriveKey(sharedSecret, authSecret, keyInfoBuf, 32);
  const contentKey = await hkdfDeriveKey(ikm, salt, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdfDeriveKey(ikm, salt, enc.encode('Content-Encoding: nonce\0'), 12);

  /* Pad and encrypt payload */
  const payloadBytes = enc.encode(JSON.stringify(payload));
  const paddedPayload = new Uint8Array(payloadBytes.length + 2);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; /* delimiter */

  const aesKey = await crypto.subtle.importKey('raw', contentKey, 'AES-GCM', false, ['encrypt']);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, paddedPayload)
  );

  /* Build aes128gcm header: salt(16) + rs(4) + keyIdLen(1) + keyId(65) + ciphertext */
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const body = new Uint8Array(16 + 4 + 1 + localPubRaw.length + encrypted.length);
  body.set(salt, 0);
  body.set(rs, 16);
  body[20] = localPubRaw.length;
  body.set(localPubRaw, 21);
  body.set(encrypted, 21 + localPubRaw.length);

  return body;
}

async function sendPushNotification(env, subscription, payload) {
  try {
    const endpoint = subscription.endpoint;
    const audience = new URL(endpoint).origin;
    const jwt = await createVapidJwt(audience, env);
    const body = await encryptPushPayload(subscription, payload);

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
      },
      body: body,
    });
    if (r.status === 410 || r.status === 404) return 'expired';
    return r.ok ? 'sent' : 'failed';
  } catch (e) {
    console.error('Push send error:', e);
    return 'failed';
  }
}

/* ── GitHub API ── */

function ghHeaders(env) {
  return {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'sydneyginza-worker',
    'Content-Type': 'application/json',
  };
}

async function ghGet(env, path) {
  const r = await fetch(`${GH_API}/repos/${DATA_REPO}/contents/${path}`, {
    headers: ghHeaders(env),
  });
  if (!r.ok) throw new Error(`GitHub GET ${r.status} ${path}`);
  const d = await r.json();
  return { content: decContent(d.content), sha: d.sha };
}

async function ghPut(env, path, content, sha, message) {
  const body = { message, content: encContent(content) };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH_API}/repos/${DATA_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: ghHeaders(env),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GitHub PUT ${r.status} ${path}`);
  return r.json();
}

async function loadNotifLog(env) {
  try {
    return await ghGet(env, NOTIF_LOG_PATH);
  } catch {
    return { content: {}, sha: null };
  }
}

/* ── Resend Email ── */

function buildEmailHtml(username, matches) {
  const rows = matches.map(m => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #2a2a3e;">
        <a href="${m.profileUrl}" style="color:#b44aff;font-weight:600;text-decoration:none;font-size:16px;">${m.girlName}</a>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #2a2a3e;color:#ccc;font-size:14px;">
        ${fmtTime12(m.start)} &ndash; ${fmtTime12(m.end)}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #2a2a3e;">
        <a href="${m.profileUrl}" style="color:#b44aff;text-decoration:none;font-size:13px;">View Profile &rarr;</a>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#b44aff;font-size:24px;letter-spacing:3px;margin:0;">GINZA EMPIRE</h1>
    <p style="color:#888;font-size:13px;margin:8px 0 0;">Sydney&rsquo;s Premier Experience</p>
  </div>
  <div style="background:#16162a;border:1px solid #2a2a3e;border-radius:8px;padding:24px;margin-bottom:24px;">
    <p style="color:#eee;font-size:15px;margin:0 0 8px;">Hi ${username},</p>
    <p style="color:#bbb;font-size:14px;margin:0 0 20px;line-height:1.5;">
      ${matches.length === 1 ? 'One of your favourited girls is' : 'Some of your favourited girls are'} available today!
    </p>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid #b44aff;">
          <th style="text-align:left;padding:8px 16px;color:#888;font-size:11px;letter-spacing:1px;">NAME</th>
          <th style="text-align:left;padding:8px 16px;color:#888;font-size:11px;letter-spacing:1px;">HOURS</th>
          <th style="text-align:left;padding:8px 16px;"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="text-align:center;">
    <a href="https://sydneyginza.github.io/roster" style="display:inline-block;background:#b44aff;color:#fff;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:600;font-size:14px;letter-spacing:1px;">VIEW FULL ROSTER</a>
  </div>
  <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
    You received this because you favourited these girls on Ginza Empire.<br>
    To stop these emails, remove them from your favourites.
  </p>
</div>
</body></html>`;
}

async function sendEmail(env, email, username, matches) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.NOTIFICATION_FROM || 'Ginza Empire <onboarding@resend.dev>',
      to: [email],
      subject: matches.length === 1
        ? `${matches[0].girlName} is available today`
        : `${matches.length} of your favourites are available today`,
      html: buildEmailHtml(username, matches),
    }),
  });
  if (!r.ok) {
    console.error(`Resend error for ${email}: ${r.status} ${await r.text()}`);
    return false;
  }
  return true;
}

/* ── Sitemap Generation ── */

async function generateSitemap(env) {
  const { content: girlsData } = await ghGet(env, 'data/girls.json');
  const today = fmtDate(getAEDTDate());
  const base = 'https://sydneyginza.github.io';
  const pages = [
    { loc: '/',           freq: 'daily',   pri: '1.0' },
    { loc: '/roster',     freq: 'daily',   pri: '0.9' },
    { loc: '/girls',      freq: 'daily',   pri: '0.9' },
    { loc: '/rates',      freq: 'weekly',  pri: '0.7' },
    { loc: '/employment', freq: 'monthly', pri: '0.5' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const p of pages) {
    xml += `  <url>\n    <loc>${base}${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.pri}</priority>\n  </url>\n`;
  }
  for (const g of girlsData) {
    if (!g.name || g.hidden) continue;
    const slug = nameToSlug(g.name);
    const lastmod = g.lastModified ? g.lastModified.split('T')[0] : today;
    xml += `  <url>\n    <loc>${base}/girls/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }
  xml += '</urlset>\n';
  return xml;
}

async function commitSitemap(env) {
  const xml = await generateSitemap(env);
  const SITE_REPO = 'sydneyginza/sydneyginza.github.io';
  const path = 'sitemap.xml';
  // Fetch current sha
  let sha = null;
  try {
    const r = await fetch(`${GH_API}/repos/${SITE_REPO}/contents/${path}`, { headers: ghHeaders(env) });
    if (r.ok) { const d = await r.json(); sha = d.sha; }
  } catch {}
  const body = { message: 'Update sitemap.xml', content: btoa(unescape(encodeURIComponent(xml))) };
  if (sha) body.sha = sha;
  const r = await fetch(`${GH_API}/repos/${SITE_REPO}/contents/${path}`, {
    method: 'PUT',
    headers: ghHeaders(env),
    body: JSON.stringify(body),
  });
  return r.ok;
}

/* ── Core: check favourites & send notifications ── */

function findMatches(user, calData, today) {
  const matches = [];
  if (!Array.isArray(user.favorites) || !user.favorites.length) return matches;
  for (const name of user.favorites) {
    const dayData = calData[name] && calData[name][today];
    if (dayData && dayData.start && dayData.end) {
      matches.push({
        girlName: name,
        start: dayData.start,
        end: dayData.end,
        profileUrl: `https://sydneyginza.github.io/girls/${nameToSlug(name)}`,
      });
    }
  }
  return matches;
}

async function processNotifications(env, { singleUser } = {}) {
  const today = fmtDate(getAEDTDate());

  const [authResult, calResult, logResult] = await Promise.all([
    ghGet(env, 'data/auth.json'),
    ghGet(env, 'data/calendar.json'),
    loadNotifLog(env),
  ]);

  const users = authResult.content;
  const calData = calResult.content;
  const log = logResult.content;
  let logSha = logResult.sha;
  let logChanged = false;
  let authChanged = false;
  let sentCount = 0;

  const targets = singleUser
    ? users.filter(u => u.user === singleUser)
    : users;

  for (const user of targets) {
    if (!Array.isArray(user.favorites) || !user.favorites.length) continue;
    if (log[user.user] === today) continue;
    if (!user.email && !user.pushSub) continue;

    const matches = findMatches(user, calData, today);
    if (!matches.length) continue;

    let notified = false;
    /* Email notification */
    if (user.email) {
      const sent = await sendEmail(env, user.email, user.user, matches);
      if (sent) notified = true;
    }
    /* Push notification */
    if (user.pushSub && env.VAPID_PRIVATE_JWK) {
      const pushPayload = {
        title: matches.length === 1
          ? `${matches[0].girlName} is available today`
          : `${matches.length} favourites available today`,
        body: matches.map(m => `${m.girlName} (${fmtTime12(m.start)} – ${fmtTime12(m.end)})`).join(', '),
        url: '/roster',
      };
      const result = await sendPushNotification(env, user.pushSub, pushPayload);
      if (result === 'sent') notified = true;
      if (result === 'expired') { delete user.pushSub; authChanged = true; } /* clean up expired sub */
    }
    if (notified) {
      log[user.user] = today;
      logChanged = true;
      sentCount += matches.length;
    }
  }

  if (logChanged) {
    try {
      await ghPut(env, NOTIF_LOG_PATH, log, logSha, 'Update notification log');
    } catch (e) {
      // Handle SHA conflict: refetch and retry once
      if (e.message.includes('409')) {
        const fresh = await loadNotifLog(env);
        Object.assign(fresh.content, log);
        await ghPut(env, NOTIF_LOG_PATH, fresh.content, fresh.sha, 'Update notification log');
      }
    }
  }

  /* Save auth if any expired push subscriptions were cleaned up */
  if (authChanged) {
    try {
      await ghPut(env, 'data/auth.json', users, authResult.sha, 'Clean expired push subscriptions');
    } catch (e) { console.error('Auth save error:', e); }
  }

  return { sent: logChanged, matchCount: sentCount, alreadyNotified: !logChanged && sentCount === 0 };
}

/* ── POST /send-notification (login trigger) ── */

async function handleSendNotification(request, env) {
  if (request.method !== 'POST') return jsonResp({ error: 'method not allowed' }, 405);

  const xrw = request.headers.get('X-Requested-With');
  if (xrw !== 'XMLHttpRequest') return jsonResp({ error: 'forbidden' }, 403);

  let body;
  try { body = await request.json(); } catch { return jsonResp({ error: 'invalid body' }, 400); }

  const { username } = body;
  if (!username) return jsonResp({ error: 'username required' }, 400);

  try {
    const result = await processNotifications(env, { singleUser: username });
    return jsonResp(result);
  } catch (e) {
    console.error('Notification error:', e);
    return jsonResp({ error: 'internal error' }, 500);
  }
}

/* ── Rate Limiting (sliding window, per-isolate) ── */

const RATE_LIMIT_WINDOW = 60_000;         // 1 minute window
const RATE_LIMIT_MAX_READ = 120;          // GET requests per window per IP
const RATE_LIMIT_MAX_WRITE = 30;          // PUT/POST/DELETE per window per IP
const rateBuckets = new Map();            // ip → { reads: [{ts}], writes: [{ts}] }

function isRateLimited(ip, isWrite) {
  const now = Date.now();
  if (!rateBuckets.has(ip)) {
    rateBuckets.set(ip, { reads: [], writes: [] });
  }
  const bucket = rateBuckets.get(ip);
  // Prune expired entries
  bucket.reads = bucket.reads.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  bucket.writes = bucket.writes.filter(ts => now - ts < RATE_LIMIT_WINDOW);

  if (isWrite) {
    if (bucket.writes.length >= RATE_LIMIT_MAX_WRITE) return true;
    bucket.writes.push(now);
  } else {
    if (bucket.reads.length >= RATE_LIMIT_MAX_READ) return true;
    bucket.reads.push(now);
  }

  // Evict old IPs to prevent memory buildup (keep max 5000)
  if (rateBuckets.size > 5000) {
    const oldest = rateBuckets.keys().next().value;
    rateBuckets.delete(oldest);
  }

  return false;
}

/* ── GitHub API Proxy (existing logic) ── */

async function handleProxy(request, env, pathname) {
  const ghUrl = `${GH_API}${pathname}`;
  const headers = {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept: request.headers.get('Accept') || 'application/vnd.github.v3+json',
    'User-Agent': 'sydneyginza-worker',
  };
  if (request.method === 'PUT' || request.method === 'POST' || request.method === 'DELETE') {
    headers['Content-Type'] = 'application/json';
  }

  const init = { method: request.method, headers };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const ghResp = await fetch(ghUrl, init);
  const respHeaders = { ...corsHeaders(), 'Content-Type': ghResp.headers.get('Content-Type') || 'application/json' };
  return new Response(ghResp.body, { status: ghResp.status, headers: respHeaders });
}

/* ── Main Export ── */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // Origin check — only allow requests from the site (skip for scheduled triggers)
    const origin = request.headers.get('Origin');
    if (origin && origin !== ALLOWED_ORIGIN) {
      return jsonResp({ error: 'forbidden origin' }, 403);
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const isWrite = request.method !== 'GET' && request.method !== 'HEAD';
    if (isRateLimited(ip, isWrite)) {
      const retryAfter = Math.ceil(RATE_LIMIT_WINDOW / 1000);
      return new Response(JSON.stringify({ error: 'rate limited' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          ...corsHeaders(),
        },
      });
    }

    // VAPID public key (no auth required)
    if (url.pathname === '/vapid-public-key' && request.method === 'GET') {
      if (!env.VAPID_PUBLIC_KEY) return jsonResp({ error: 'push not configured' }, 501);
      return jsonResp({ key: env.VAPID_PUBLIC_KEY });
    }

    // Push subscribe
    if (url.pathname === '/push-subscribe' && request.method === 'POST') {
      try {
        const { username, subscription } = await request.json();
        if (!username || !subscription) return jsonResp({ error: 'missing fields' }, 400);
        const authResult = await ghGet(env, 'data/auth.json');
        const users = authResult.content;
        const user = users.find(u => u.user === username);
        if (!user) return jsonResp({ error: 'user not found' }, 404);
        user.pushSub = subscription;
        await ghPut(env, 'data/auth.json', users, authResult.sha, 'Save push subscription');
        return jsonResp({ success: true });
      } catch (e) {
        return jsonResp({ error: e.message }, 500);
      }
    }

    // Push unsubscribe
    if (url.pathname === '/push-unsubscribe' && request.method === 'POST') {
      try {
        const { username } = await request.json();
        if (!username) return jsonResp({ error: 'missing username' }, 400);
        const authResult = await ghGet(env, 'data/auth.json');
        const users = authResult.content;
        const user = users.find(u => u.user === username);
        if (user && user.pushSub) {
          delete user.pushSub;
          await ghPut(env, 'data/auth.json', users, authResult.sha, 'Remove push subscription');
        }
        return jsonResp({ success: true });
      } catch (e) {
        return jsonResp({ error: e.message }, 500);
      }
    }

    // Notification endpoint
    if (url.pathname === '/send-notification') {
      return handleSendNotification(request, env);
    }

    // Sitemap regeneration (admin trigger)
    if (url.pathname === '/generate-sitemap' && request.method === 'POST') {
      try {
        const ok = await commitSitemap(env);
        return jsonResp({ success: ok });
      } catch (e) {
        return jsonResp({ error: e.message }, 500);
      }
    }

    // GitHub API proxy (/repos/...)
    if (url.pathname.startsWith('/repos/')) {
      return handleProxy(request, env, url.pathname);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders() });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      Promise.all([
        processNotifications(env),
        commitSitemap(env).catch(e => console.error('Sitemap error:', e)),
      ])
    );
  },
};
