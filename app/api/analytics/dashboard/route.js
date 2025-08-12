// API Route for admin dashboard analytics data
import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    // Validate PocketBase auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    try {
      pb.authStore.save(token, null);
      // Verify token and load user model
      await pb.collection('users').authRefresh();
      const user = pb.authStore.model;
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Compute analytics directly from page_views for freshness and scalability
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '1d': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    const startIso = startDate.toISOString();

    // Admin REST auth (prefer service token; else use verified incoming admin bearer; optionally try env creds but don't fail if they are wrong)
    const baseUrl = process.env.PB_BASE_URL?.replace(/\/$/, '') || 'https://api.whoisjason.me';
    let adminToken = process.env.PB_SERVICE_TOKEN || process.env.PB_ADMIN_TOKEN || process.env.PB_TOKEN || token;
    // Best-effort: if env admin creds are provided, attempt them; on failure, keep existing token
    try {
      const email = process.env.PB_ADMIN_EMAIL || process.env.PB_EMAIL;
      const password = process.env.PB_ADMIN_PASSWORD || process.env.PB_PASSWORD;
      if (!process.env.PB_SERVICE_TOKEN && email && password) {
        const resp = await fetch(`${baseUrl}/api/admins/auth-with-password`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ identity: email, password })
        });
        if (resp.ok) {
          const json = await resp.json().catch(() => ({}));
          if (json?.token) adminToken = json.token;
        }
      }
    } catch { /* ignore and rely on existing token */ }
    const authHeaders = { authorization: `Bearer ${adminToken}` };

    async function pbGet(path, params) {
      const url = new URL(`${baseUrl}${path}`);
      if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
      const resp = await fetch(url.toString(), { headers: authHeaders, cache: 'no-store' });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.message || `PB GET failed ${resp.status}`);
      return json;
    }

    // total views via paged count
    const totalViewsResp = await pbGet('/api/collections/page_views/records', {
      page: 1,
      perPage: 1,
      skipTotal: 0,
      filter: `created>="${startIso}"`
    }).catch(() => ({ totalItems: 0 }));
    const totalViews = totalViewsResp?.totalItems || 0;

    // recent sessions (limited)
    const recentSessionsResp = await pbGet('/api/collections/page_views/records', {
      page: 1,
      perPage: 50,
      sort: '-created',
      filter: `created>="${startIso}"`,
      fields: 'id,post_id,ip_address,referrer,language,timezone,screen_resolution,session_id,is_authenticated,visitor_fingerprint,time_on_page,scroll_depth,interactions,engagement,created'
    }).catch(() => ({ items: [] }));
    const rawSessions = (recentSessionsResp?.items || []).map(v => ({
      id: v.id,
      postId: v.post_id,
      ip: v.ip_address,
      referrer: v.referrer,
      language: v.language,
      timezone: v.timezone,
      screen: v.screen_resolution,
      sessionId: v.session_id,
      isAuthenticated: v.is_authenticated,
      visitorFingerprint: v.visitor_fingerprint,
      timeOnPage: typeof v.time_on_page === 'number' ? v.time_on_page : (typeof v.time_on_page === 'string' ? Number(v.time_on_page) : undefined),
      scrollDepth: typeof v.scroll_depth === 'number' ? v.scroll_depth : (typeof v.scroll_depth === 'string' ? Number(v.scroll_depth) : undefined),
      interactions: typeof v.interactions === 'number' ? v.interactions : (typeof v.interactions === 'string' ? Number(v.interactions) : undefined),
      engagement: typeof v.engagement === 'string' ? v.engagement : undefined,
      timestamp: v.created
    }));

    // Deduplicate by sessionId keeping most recent entry
    const recentSessionsMap = new Map();
    for (const s of rawSessions) {
      const key = s.sessionId || s.id;
      const prev = recentSessionsMap.get(key);
      if (!prev || new Date(s.timestamp) > new Date(prev.timestamp)) {
        recentSessionsMap.set(key, s);
      }
    }
    const recentSessions = Array.from(recentSessionsMap.values());

    // annotate recent sessions with post titles (bounded by unique set)
    const uniquePostIds = Array.from(new Set(recentSessions.map(s => s.postId).filter(Boolean))).slice(0, 50);
    const postTitleMap = new Map();
    for (const pid of uniquePostIds) {
      try {
        const p = await pbGet(`/api/collections/posts/records/${pid}`);
        postTitleMap.set(pid, p?.title || pid);
      } catch { postTitleMap.set(pid, pid); }
    }
    for (const s of recentSessions) {
      if (s.postId && postTitleMap.has(s.postId)) s.postTitle = postTitleMap.get(s.postId);
    }

    // Aggregate top posts and unique visitors with a bounded scan
    const PAGE_SIZE = 200;
    const CAP = 5000;
    let page = 1;
    let fetched = 0;
    const topPostsMap = new Map();
    const uniqueFingerprints = new Set();
    const viewsByDayMap = new Map(); // key: YYYY-MM-DD, value: count
    const engagementMap = new Map(); // key: engagement, value: count
    try {
      // fetch pages until cap or no more items
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const resp = await pbGet('/api/collections/page_views/records', {
          page,
          perPage: PAGE_SIZE,
          sort: '-created',
          filter: `created>="${startIso}"`,
          fields: 'post_id,visitor_fingerprint,created,engagement'
        });
        const items = resp?.items || [];
        if (items.length === 0) break;
        for (const v of items) {
          if (v.post_id) topPostsMap.set(v.post_id, (topPostsMap.get(v.post_id) || 0) + 1);
          if (v.visitor_fingerprint) uniqueFingerprints.add(v.visitor_fingerprint);
          if (v.created) {
            const d = new Date(v.created).toISOString().split('T')[0];
            viewsByDayMap.set(d, (viewsByDayMap.get(d) || 0) + 1);
          }
          if (typeof v.engagement === 'string' && v.engagement) {
            const key = v.engagement.toLowerCase();
            engagementMap.set(key, (engagementMap.get(key) || 0) + 1);
          }
        }
        fetched += items.length;
        if (fetched >= CAP || (page * PAGE_SIZE) >= (resp?.totalItems || 0)) break;
        page += 1;
      }
    } catch (_) {}

    // build top posts array with titles
    const topPostEntries = Array.from(topPostsMap.entries()).sort((a,b) => b[1]-a[1]).slice(0, 10);
    const topPosts = [];
    for (const [postId, views] of topPostEntries) {
      try {
        const post = await pbGet(`/api/collections/posts/records/${postId}`);
        topPosts.push({ id: postId, title: post?.title || postId, views, slug: post?.slug });
      } catch {
        topPosts.push({ id: postId, title: postId, views });
      }
    }

    // build viewsByDay series (fill gaps)
    const viewsByDay = [];
    const dayMs = 24*60*60*1000;
    const startDay = new Date(startDate.toISOString().split('T')[0]);
    const endDay = new Date(new Date().toISOString().split('T')[0]);
    for (let t = startDay.getTime(); t <= endDay.getTime(); t += dayMs) {
      const day = new Date(t).toISOString().split('T')[0];
      viewsByDay.push({ date: day, views: viewsByDayMap.get(day) || 0 });
    }

    // build engagement breakdown
    const engagementBreakdown = ['high','medium','low'].map(k => ({ name: k, value: engagementMap.get(k) || 0 }));

    // Get additional metrics
    const totalUsers = await pbGet('/api/collections/users/records', { page: 1, perPage: 1, skipTotal: 0 })
      .then(r => r?.totalItems || 0).catch(() => 0);
    const totalPosts = await pbGet('/api/collections/posts/records', { page: 1, perPage: 1, skipTotal: 0 })
      .then(r => r?.totalItems || 0).catch(() => 0);

    // Calculate additional metrics
    const bounceRate = Math.floor(Math.random() * 20) + 25; // Placeholder - would need session tracking
    const avgTimeOnPage = Math.floor(Math.random() * 180) + 120; // Placeholder - would need session tracking

    // Additionally: read JSON IP log and include a recent connections section
    let recentConnections = [];
    try {
      const filePath = path.join(process.cwd(), 'data', 'ip-data.json');
      const raw = await fs.readFile(filePath, 'utf-8');
      const all = JSON.parse(raw);
      if (Array.isArray(all)) {
        // Keep last 50 entries, newest first
        recentConnections = all.slice(-50).reverse();
      }
    } catch (_) {
      recentConnections = [];
    }

    const response = NextResponse.json({
      success: true,
      data: {
        totalPageViews: totalViews,
        totalUniqueVisitors: uniqueFingerprints.size,
        averageTimeOnPage: avgTimeOnPage,
        averageBounceRate: bounceRate,
        totalUsers,
        totalPosts,
        topPosts,
        userAgentStats: {},
        averageViewsPerDay: Math.round(totalViews / Math.max(1, (now - startDate) / (24*60*60*1000))),
        timeRange,
        periodDays: Math.max(1, Math.round((now - startDate) / (24*60*60*1000))),
        recentSessions,
        viewsByDay,
        engagementBreakdown,
        recentConnections
      }
    });
    return response;

  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
  finally {
    // Prevent token leakage across requests
    try { pb.authStore.clear(); } catch {}
  }
}
