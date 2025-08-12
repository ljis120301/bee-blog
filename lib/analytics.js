// Unique Visitor Analytics System
// Tracks unique visitors using IP + User Agent + Session fingerprinting

import { pb } from './pocketbase';
import crypto from 'crypto';
// Note: We use direct REST calls for privileged writes to avoid global SDK auth races

class AnalyticsManager {
  constructor() {
    this.analyticsCollection = 'analytics';
    this.visitorCollection = 'unique_visitors';
    this._adminBearerToken = null;
    this._adminTokenFetchedAt = 0;
    this._adminTokenTtlMs = 25 * 60 * 1000; // refresh roughly every 25 minutes
  }

  // Get PocketBase base URL from existing client or env
  getPocketBaseBaseUrl() {
    try {
      // Prefer env override if present
      if (process.env.PB_BASE_URL) return process.env.PB_BASE_URL.replace(/\/$/, '');
      const candidate = (pb && (pb.baseUrl || pb.url)) || 'https://api.whoisjason.me/';
      return String(candidate).replace(/\/$/, '');
    } catch (_) {
      return 'https://api.whoisjason.me';
    }
  }

  // Acquire admin/service token for REST calls
  async getAdminBearerToken() {
    const serviceToken = process.env.PB_SERVICE_TOKEN || process.env.PB_ADMIN_TOKEN || process.env.PB_TOKEN;
    if (serviceToken) {
      console.debug('[Analytics.auth] Using service token');
      return serviceToken;
    }
    // Return cached admin token if still fresh
    if (this._adminBearerToken && (Date.now() - this._adminTokenFetchedAt) < this._adminTokenTtlMs) {
      return this._adminBearerToken;
    }

    const adminEmail = process.env.PB_ADMIN_EMAIL || process.env.PB_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD || process.env.PB_PASSWORD;
    console.debug('[Analytics.auth] env presence', {
      hasEmail: !!adminEmail,
      hasPassword: !!adminPassword,
      hasServiceToken: !!serviceToken
    });
    if (adminEmail && adminPassword) {
      const base = this.getPocketBaseBaseUrl();
      try {
        const resp = await fetch(`${base}/api/admins/auth-with-password`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ identity: adminEmail, password: adminPassword })
        });
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          throw new Error(`Admin auth failed: ${resp.status} ${json?.message || ''}`);
        }
        console.debug('[Analytics.auth] Admin auth succeeded');
        this._adminBearerToken = json?.token || null;
        this._adminTokenFetchedAt = Date.now();
        return this._adminBearerToken;
      } catch (e) {
        console.error('[Analytics.auth] Admin auth error', e?.message);
        throw e;
      }
    }
    throw new Error('No PocketBase credentials provided');
  }

  // Create a record via PocketBase REST using bearer token
  async createPocketBaseRecord(collectionName, data) {
    const base = this.getPocketBaseBaseUrl();
    const token = await this.getAdminBearerToken();
    const url = `${base}/api/collections/${collectionName}/records`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const message = json?.message || 'Unknown error';
      const code = json?.code;
      console.error('[Analytics.PB REST] Create failed', { status: resp.status, code, message, data: json?.data });
      throw new Error(`PB create failed: ${resp.status} ${message}`);
    }
    console.debug('[Analytics.PB REST] Created record id:', json?.id);
    return json;
  }

  // Update a record via PocketBase REST using bearer token
  async updatePocketBaseRecord(collectionName, recordId, data) {
    const base = this.getPocketBaseBaseUrl();
    const token = await this.getAdminBearerToken();
    const url = `${base}/api/collections/${collectionName}/records/${recordId}`;
    const resp = await fetch(url, {
      method: 'PATCH',
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const message = json?.message || 'Unknown error';
      const code = json?.code;
      console.error('[Analytics.PB REST] Update failed', { status: resp.status, code, message, data: json?.data });
      throw new Error(`PB update failed: ${resp.status} ${message}`);
    }
    return json;
  }

  async ensurePageViewMetricsFields() {
    const base = this.getPocketBaseBaseUrl();
    const token = await this.getAdminBearerToken();
    const getResp = await fetch(`${base}/api/collections/page_views`, { headers: { authorization: `Bearer ${token}` } });
    const col = await getResp.json();
    if (!getResp.ok) throw new Error(col?.message || 'Failed to fetch collection');
    const schema = Array.isArray(col.schema) ? col.schema : [];
    const names = new Set(schema.map(f => f.name));
    const needed = [];
    if (!names.has('time_on_page')) needed.push({ name: 'time_on_page', type: 'number', required: false, options: { min: 0 } });
    if (!names.has('scroll_depth')) needed.push({ name: 'scroll_depth', type: 'number', required: false, options: { min: 0, max: 100 } });
    if (!names.has('interactions')) needed.push({ name: 'interactions', type: 'number', required: false, options: { min: 0 } });
    if (!names.has('engagement')) needed.push({ name: 'engagement', type: 'text', required: false, options: { max: 20 } });
    if (needed.length === 0) return;
    const updateBody = { ...col, schema: [...schema, ...needed] };
    // Remove read-only fields if present
    delete updateBody.created;
    delete updateBody.updated;
    const putResp = await fetch(`${base}/api/collections/page_views`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(updateBody)
    });
    if (!putResp.ok) {
      const j = await putResp.json().catch(() => ({}));
      console.error('[Analytics.schema] Failed to add metrics fields', j);
      // Do not throw hard; allow flow to continue
    }
  }

  async recordPageMetrics(postId, sessionId, metrics) {
    try {
      await this.ensurePageViewMetricsFields();
      const base = this.getPocketBaseBaseUrl();
      const token = await this.getAdminBearerToken();
      const url = new URL(`${base}/api/collections/page_views/records`);
      url.searchParams.set('page', '1');
      url.searchParams.set('perPage', '1');
      url.searchParams.set('sort', '-created');
      url.searchParams.set('filter', `post_id = "${postId}" && session_id = "${sessionId}"`);
      const resp = await fetch(url.toString(), { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
      const json = await resp.json().catch(() => ({}));
      const id = json?.items?.[0]?.id || null;
      if (!id) return { updated: false, reason: 'record_not_found' };
      const payload = {};
      if (typeof metrics.timeOnPageSec === 'number') payload.time_on_page = Math.max(0, Math.round(metrics.timeOnPageSec));
      if (typeof metrics.scrollDepthPct === 'number') payload.scroll_depth = Math.max(0, Math.min(100, Math.round(metrics.scrollDepthPct)));
      if (typeof metrics.interactions === 'number') payload.interactions = Math.max(0, Math.round(metrics.interactions));
      if (typeof metrics.engagement === 'string') payload.engagement = metrics.engagement.slice(0, 20);
      if (Object.keys(payload).length === 0) return { updated: false, reason: 'no_metrics' };
      await this.updatePocketBaseRecord('page_views', id, payload);
      return { updated: true };
    } catch (e) {
      console.error('Error recording page metrics:', e);
      return { updated: false, reason: 'error', error: e?.message };
    }
  }

  // Acquire temporary PocketBase auth for a privileged write and restore afterward
  async withPocketBaseAuth(executeCallback) {
    const serviceToken = process.env.PB_SERVICE_TOKEN || process.env.PB_ADMIN_TOKEN || process.env.PB_TOKEN;
    const adminEmail = process.env.PB_ADMIN_EMAIL || process.env.PB_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD || process.env.PB_PASSWORD;

    const hadToken = !!pb.authStore?.token;
    const prevToken = pb.authStore?.token || null;
    const restore = () => {
      try {
        if (hadToken && prevToken) pb.authStore.save(prevToken, null); else pb.authStore.clear();
      } catch {}
    };

    try {
      // Prefer static service token if provided
      if (serviceToken) {
        try { pb.authStore.save(serviceToken, null); } catch {}
        return await executeCallback();
      }

      // Fallback: admin email/password auth just-in-time
      if (adminEmail && adminPassword) {
        try { await pb.admins.authWithPassword(adminEmail, adminPassword); } catch (e) {
          throw new Error('PocketBase admin auth failed');
        }
        return await executeCallback();
      }

      // No credentials available; attempt without auth
      return await executeCallback();
    } finally {
      restore();
    }
  }

  // Generate unique visitor fingerprint
  generateVisitorFingerprint(ip, userAgent, additionalData = {}) {
    const fingerprintData = {
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
      screen: additionalData.screen || 'unknown',
      timezone: additionalData.timezone || 'unknown',
      language: additionalData.language || 'unknown'
    };

    const fingerprintString = JSON.stringify(fingerprintData);
    return crypto.createHash('sha256').update(fingerprintString).digest('hex');
  }

  // Normalize potential IPv6-mapped IPv4
  normalizeIP(raw) {
    if (!raw) return 'unknown';
    let v = String(raw).trim();
    // Strip quotes
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    // Strip brackets for IPv6
    v = v.replace(/^\[/, '').replace(/\]$/, '');
    // Strip trailing :port
    v = v.replace(/:\d+$/, '');
    // Normalize IPv4-mapped IPv6
    if (v.startsWith('::ffff:')) v = v.replace('::ffff:', '');
    return v;
  }

  // Basic validation for IPv4/IPv6 string and ensure it's not private/local
  isValidPublicIp(ip) {
    if (!ip || ip === 'unknown') return false;
    const v = ip.trim();
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    const ipv6Regex = /^[0-9a-fA-F:]+$/; // coarse check; private check handled below
    const looksLikeIp = ipv4Regex.test(v) || ipv6Regex.test(v);
    if (!looksLikeIp) return false;
    return !this.isLocalOrPrivateIP(v);
  }

  // Parse RFC 7239 Forwarded header: for=ip;proto=https;by=...
  parseForwardedForIp(forwardedHeaderValue) {
    if (!forwardedHeaderValue) return null;
    try {
      const parts = String(forwardedHeaderValue).split(',');
      for (const part of parts) {
        const segs = part.split(';');
        for (const seg of segs) {
          const [k, vRaw] = seg.trim().split('=');
          if (!k || k.toLowerCase() !== 'for' || !vRaw) continue;
          // Strip quotes and brackets and any port
          let v = vRaw.trim().replace(/^"|"$/g, '');
          v = v.replace(/^\[/, '').replace(/\]$/, '');
          v = v.replace(/:\d+$/, '');
          if (this.isValidPublicIp(v)) return this.normalizeIP(v);
        }
      }
    } catch {}
    return null;
  }

  // Extract first public IP from a comma-separated X-Forwarded-For list
  getFirstPublicIpFromXff(xffValue) {
    if (!xffValue) return null;
    const candidates = String(xffValue).split(',').map(s => this.normalizeIP(s)).filter(Boolean);
    for (const ip of candidates) {
      if (this.isValidPublicIp(ip)) return ip;
    }
    // If none are public, fallback to first item as best-effort
    return candidates.find(Boolean) || null;
  }

  // Primary IP detection prefers client-provided IP, then Cloudflare, then RFC 7239/standard headers
  async getVisitorIP(request, clientProvidedIp = null) {
    const headers = request.headers;

    // 1) Trust well-formed client-provided IP passed from browser fetch (from third-party API)
    const normalizedClientIp = this.normalizeIP(clientProvidedIp);
    if (this.isValidPublicIp(normalizedClientIp)) return normalizedClientIp;

    // 2) Cloudflare headers (Tunnel/Proxy)
    const cfConnectingIp = headers.get('cf-connecting-ip') || headers.get('CF-Connecting-IP');
    if (this.isValidPublicIp(cfConnectingIp)) return this.normalizeIP(cfConnectingIp);

    const trueClientIp = headers.get('true-client-ip') || headers.get('True-Client-IP');
    if (this.isValidPublicIp(trueClientIp)) return this.normalizeIP(trueClientIp);

    // 3) RFC 7239 Forwarded header
    const forwarded = headers.get('forwarded') || headers.get('Forwarded');
    const forwardedIp = this.parseForwardedForIp(forwarded);
    if (forwardedIp) return forwardedIp;

    // 4) X-Forwarded headers
    const xForwardedFor = headers.get('x-forwarded-for') || headers.get('X-Forwarded-For');
    const xffIp = this.getFirstPublicIpFromXff(xForwardedFor);
    if (xffIp) return xffIp;

    const xForwardedClientIp = headers.get('x-forwarded-client-ip');
    if (this.isValidPublicIp(xForwardedClientIp)) return this.normalizeIP(xForwardedClientIp);

    const xClientIp = headers.get('x-client-ip');
    if (this.isValidPublicIp(xClientIp)) return this.normalizeIP(xClientIp);

    const xRealIp = headers.get('x-real-ip') || headers.get('X-Real-IP');
    if (this.isValidPublicIp(xRealIp)) return this.normalizeIP(xRealIp);

    // Optional debug: log a minimal header snapshot when no IP found
    if (process.env.DEBUG_ANALYTICS_IP === '1') {
      try {
        const snapshot = {};
        const interesting = [
          'cf-connecting-ip','true-client-ip','forwarded','x-forwarded-for','x-forwarded-client-ip','x-client-ip','x-real-ip'
        ];
        for (const k of interesting) snapshot[k] = headers.get(k) || null;
        console.warn('[Analytics] Unable to determine client IP. Header snapshot:', snapshot);
      } catch {}
    }

    // Last resort when nothing else is available
    return 'unknown';
  }

  // Determine if IP is localhost or private (RFC1918/ULA)
  isLocalOrPrivateIP(ip) {
    if (!ip || ip === 'unknown') return true;
    const normalized = ip.trim().toLowerCase();

    // IPv6 loopback or ULA ranges
    if (normalized === '::1') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // fc00::/7
    if (normalized.startsWith('fe80:')) return true; // IPv6 link-local

    // Remove IPv6 prefix for IPv4-mapped addresses ::ffff:127.0.0.1
    const v4 = normalized.startsWith('::ffff:') ? normalized.replace('::ffff:', '') : normalized;

    // IPv4 private ranges + loopback + link-local
    const isLoopback = v4.startsWith('127.') || v4 === '0.0.0.0';
    const is10 = v4.startsWith('10.');
    const is172 = /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(v4);
    const is192 = v4.startsWith('192.168.');
    const isLinkLocal = v4.startsWith('169.254.');
    const isCgnat = /^100\.(6[4-9]|[7-9]\d|1\d{2}|2[01]\d|22[0-3])\./.test(v4); // 100.64.0.0/10

    return isLoopback || is10 || is172 || is192 || isLinkLocal || isCgnat;
  }

  // Check if visitor is unique for a specific post within time period
  async isUniqueVisitor(postId, visitorFingerprint, timeWindow = '24h') {
    try {
      const now = new Date();
      let timeThreshold;

      switch (timeWindow) {
        case '24h':
          timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Check if this visitor has viewed this post within the time window
      const existingView = await pb.collection('page_views').getFirstListItem(
        `post_id="${postId}" && visitor_fingerprint="${visitorFingerprint}" && created>="${timeThreshold.toISOString()}"`,
        { '$autoCancel': false }
      ).catch(() => null);

      return !existingView;
    } catch (error) {
      console.error('Error checking unique visitor:', error);
      return true; // Default to counting the view if there's an error
    }
  }

  // Record a page view
  async recordPageView(postId, visitorData, request) {
    try {
      const ip = await this.getVisitorIP(request, visitorData?.clientIp);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const visitorFingerprint = this.generateVisitorFingerprint(ip, userAgent, visitorData);

      // Always record a page view for historical IP logging

      const viewData = {
        post_id: postId,
        visitor_fingerprint: visitorFingerprint,
        ip_address: ip,
        user_agent: userAgent,
        screen_resolution: visitorData.screen || 'unknown',
        timezone: visitorData.timezone || 'unknown',
        language: visitorData.language || 'unknown',
        referrer: visitorData.referrer || 'direct',
        session_id: visitorData.sessionId || crypto.randomUUID(),
        is_authenticated: !!visitorData.isAuthenticated,
        user_id: visitorData.userId || null
      };
      console.debug('[Analytics.recordPageView] creating page_view', viewData);

      // Record the page view via REST with admin/service auth
      try {
        await this.createPocketBaseRecord('page_views', viewData);
      } catch (e) {
        // Surface detailed error
        throw e;
      }

      // Skip post updates and daily aggregations since only page_views collection exists

      console.log('Page view recorded successfully');
      return { counted: true, fingerprint: visitorFingerprint };

    } catch (error) {
      console.error('Error recording page view:', error);
      return { counted: false, reason: 'error', error: error.message };
    }
  }

  // Update post view count in posts collection
  async updatePostViewCount(postId) {
    try {
      // Get current post
      const post = await pb.collection('posts').getOne(postId);
      
      // Count unique views (24h window to prevent spam)
      const uniqueViews = await this.getUniqueViewCount(postId, '24h');
      
      // Update post with new view count
      await pb.collection('posts').update(postId, {
        views: uniqueViews,
        last_viewed: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error updating post view count:', error);
    }
  }

  // Get unique view count for a post within time period
  async getUniqueViewCount(postId, timeWindow = '24h') {
    try {
      const now = new Date();
      let timeThreshold;

      switch (timeWindow) {
        case '24h':
          timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          // All time
          timeThreshold = new Date('2020-01-01');
      }

      let views = [];
      try {
        views = await pb.collection('page_views').getFullList({
          filter: `post_id="${postId}" && created>="${timeThreshold.toISOString()}"`,
          '$autoCancel': false
        });
      } catch (e) {
        if (e?.status === 404) {
          console.warn('Analytics: missing collection "page_views" – returning 0 views');
          return 0;
        }
        throw e;
      }

      // Count unique visitor fingerprints
      const uniqueFingerprints = new Set(views.map(view => view.visitor_fingerprint));
      return uniqueFingerprints.size;

    } catch (error) {
      console.error('Error getting unique view count:', error);
      return 0;
    }
  }

  // Update analytics aggregations for different time periods
  async updateAnalyticsAggregations(postId, visitorFingerprint, ip, userAgent) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we have analytics record for today
      let analyticsRecord = null;
      try {
        analyticsRecord = await pb.collection('daily_analytics').getFirstListItem(
          `date="${today}"`,
          { '$autoCancel': false }
        ).catch(() => null);
      } catch (e) {
        if (e?.status === 404) {
          console.warn('Analytics: missing collection "daily_analytics" – skipping aggregation');
          return;
        }
        throw e;
      }

      if (!analyticsRecord) {
        // Create new daily analytics record
        try {
          analyticsRecord = await pb.collection('daily_analytics').create({
            date: today,
            unique_visitors: [],
            total_views: 0,
            top_posts: {},
            user_agents: {},
            ip_addresses: {},
            created: new Date().toISOString()
          });
        } catch (e) {
          if (e?.status === 404) {
            console.warn('Analytics: missing collection "daily_analytics" – skipping aggregation');
            return;
          }
          throw e;
        }
      }

      // Update analytics data
      const uniqueVisitors = analyticsRecord.unique_visitors || [];
      const topPosts = analyticsRecord.top_posts || {};
      const userAgents = analyticsRecord.user_agents || {};
      const ipAddresses = analyticsRecord.ip_addresses || {};

      // Add unique visitor if not already present
      if (!uniqueVisitors.includes(visitorFingerprint)) {
        uniqueVisitors.push(visitorFingerprint);
      }

      // Update post views
      topPosts[postId] = (topPosts[postId] || 0) + 1;

      // Update user agent stats
      const userAgentKey = this.categorizeUserAgent(userAgent);
      userAgents[userAgentKey] = (userAgents[userAgentKey] || 0) + 1;

      // Update IP stats (for geographic analysis)
      ipAddresses[ip] = (ipAddresses[ip] || 0) + 1;

      // Update analytics record
      try {
        await pb.collection('daily_analytics').update(analyticsRecord.id, {
          unique_visitors: uniqueVisitors,
          total_views: (analyticsRecord.total_views || 0) + 1,
          top_posts: topPosts,
          user_agents: userAgents,
          ip_addresses: ipAddresses,
          updated: new Date().toISOString()
        });
      } catch (e) {
        if (e?.status === 404) {
          console.warn('Analytics: missing collection "daily_analytics" – skipping aggregation');
          return;
        }
        throw e;
      }

    } catch (error) {
      console.error('Error updating analytics aggregations:', error);
    }
  }

  // Categorize user agent for analytics
  categorizeUserAgent(userAgent) {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
      return 'bot';
    } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else if (ua.includes('chrome')) {
      return 'chrome';
    } else if (ua.includes('firefox')) {
      return 'firefox';
    } else if (ua.includes('safari')) {
      return 'safari';
    } else if (ua.includes('edge')) {
      return 'edge';
    } else {
      return 'other';
    }
  }

  // Get analytics data for admin dashboard
  async getAnalyticsData(timeRange = '7d') {
    try {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get daily analytics for the period
      const dailyAnalytics = await pb.collection('daily_analytics').getFullList({
        filter: `date>="${startDate.toISOString().split('T')[0]}"`,
        sort: '-date',
        '$autoCancel': false
      });

      // Aggregate data
      let totalUniqueVisitors = new Set();
      let totalViews = 0;
      let allTopPosts = {};
      let userAgentStats = {};

      dailyAnalytics.forEach(day => {
        // Aggregate unique visitors
        if (day.unique_visitors) {
          day.unique_visitors.forEach(visitor => totalUniqueVisitors.add(visitor));
        }

        // Aggregate views
        totalViews += day.total_views || 0;

        // Aggregate top posts
        if (day.top_posts) {
          Object.entries(day.top_posts).forEach(([postId, views]) => {
            allTopPosts[postId] = (allTopPosts[postId] || 0) + views;
          });
        }

        // Aggregate user agents
        if (day.user_agents) {
          Object.entries(day.user_agents).forEach(([agent, count]) => {
            userAgentStats[agent] = (userAgentStats[agent] || 0) + count;
          });
        }
      });

      // Get top posts with titles
      const topPostEntries = Object.entries(allTopPosts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      const topPosts = [];
      for (const [postId, views] of topPostEntries) {
        try {
          const post = await pb.collection('posts').getOne(postId);
          topPosts.push({
            id: postId,
            title: post.title,
            views: views,
            slug: post.slug
          });
        } catch (error) {
          console.error(`Error fetching post ${postId}:`, error);
        }
      }

      // Fetch recent sessions (page views)
      let recentSessions = [];
      try {
        const pageViews = await pb.collection('page_views').getList(1, 100, {
          sort: '-created',
          fields: 'id,post_id,ip_address,user_agent,referrer,language,timezone,screen_resolution,session_id,is_authenticated,user_id,visitor_fingerprint,created'
        });
        // Deduplicate by session_id if present, otherwise by visitor_fingerprint within a small time window
        const seenSessions = new Set();
        const seenFingerprints = new Map();
        const items = pageViews?.items || [];
        for (const v of items) {
          const key = v.session_id || null;
          const fp = v.visitor_fingerprint || null;
          const createdAt = new Date(v.created).getTime();
          let include = true;
          if (key) {
            if (seenSessions.has(key)) include = false; else seenSessions.add(key);
          } else if (fp) {
            const lastSeen = seenFingerprints.get(fp);
            if (lastSeen && createdAt - lastSeen < 60 * 1000) { // 1 minute collapse
              include = false;
            } else {
              seenFingerprints.set(fp, createdAt);
            }
          }
          if (!include) continue;
          recentSessions.push({
            id: v.id,
            postId: v.post_id,
            ip: v.ip_address,
            userAgent: v.user_agent,
            referrer: v.referrer,
            language: v.language,
            timezone: v.timezone,
            screen: v.screen_resolution,
            sessionId: v.session_id,
            isAuthenticated: v.is_authenticated,
            userId: v.user_id,
            visitorFingerprint: v.visitor_fingerprint,
            timestamp: v.created
          });
          if (recentSessions.length >= 25) break;
        }
      } catch (e) {
        recentSessions = [];
      }

      return {
        totalUniqueVisitors: totalUniqueVisitors.size,
        totalViews,
        topPosts,
        userAgentStats,
        averageViewsPerDay: Math.round(totalViews / Math.max(dailyAnalytics.length, 1)),
        timeRange,
        periodDays: dailyAnalytics.length,
        recentSessions
      };

    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        totalUniqueVisitors: 0,
        totalViews: 0,
        topPosts: [],
        userAgentStats: {},
        averageViewsPerDay: 0,
        timeRange,
        periodDays: 0
      };
    }
  }

  // Clean up old analytics data (optional - run periodically)
  async cleanupOldData(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Delete old page views
      let oldViews = [];
      try {
        oldViews = await pb.collection('page_views').getFullList({
          filter: `created<"${cutoffDate.toISOString()}"`,
          '$autoCancel': false
        });
      } catch (e) {
        if (e?.status === 404) {
          console.warn('Analytics: missing collection "page_views" – skipping cleanup');
          oldViews = [];
        } else {
          throw e;
        }
      }

      for (const view of oldViews) {
        await pb.collection('page_views').delete(view.id);
      }

      // Delete old daily analytics
      let oldAnalytics = [];
      try {
        oldAnalytics = await pb.collection('daily_analytics').getFullList({
          filter: `date<"${cutoffDate.toISOString().split('T')[0]}"`,
          '$autoCancel': false
        });
      } catch (e) {
        if (e?.status === 404) {
          console.warn('Analytics: missing collection "daily_analytics" – skipping cleanup');
          oldAnalytics = [];
        } else {
          throw e;
        }
      }

      for (const analytics of oldAnalytics) {
        await pb.collection('daily_analytics').delete(analytics.id);
      }

      console.log(`Cleaned up analytics data older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }
}

// Export singleton instance
export const analyticsManager = new AnalyticsManager();

// Export utility functions
export const recordPageView = (postId, visitorData, request) => 
  analyticsManager.recordPageView(postId, visitorData, request);

export const getAnalyticsData = (timeRange) => 
  analyticsManager.getAnalyticsData(timeRange);

export const getUniqueViewCount = (postId, timeWindow) => 
  analyticsManager.getUniqueViewCount(postId, timeWindow);
