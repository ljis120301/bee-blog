// Unique Visitor Analytics System - Prisma Version
// Tracks unique visitors using IP + User Agent + Session fingerprinting

import crypto from 'crypto';

// Dynamic import to ensure server-side only
let db = null;
const getDb = async () => {
  if (!db) {
    const module = await import('@/lib/db');
    db = module.db;
  }
  return db;
};

class AnalyticsManager {
  constructor() {
    this.analyticsCollection = 'analytics';
    this.visitorCollection = 'unique_visitors';
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
    } catch { }
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

    // Last resort when nothing else is available
    return 'unknown';
  }

  // Check if visitor is unique for a specific post within time period
  async isUniqueVisitor(postId, visitorFingerprint, timeWindow = '24h') {
    try {
      const prisma = await getDb();
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
      const existingView = await prisma.pageView.findFirst({
        where: {
          postId: postId,
          visitorFingerprint: visitorFingerprint,
          createdAt: {
            gte: timeThreshold
          }
        }
      });

      return !existingView;
    } catch (error) {
      console.error('Error checking unique visitor:', error);
      return true; // Default to counting the view if there's an error
    }
  }

  // Record page metrics update
  async recordPageMetrics(postId, sessionId, metrics) {
    try {
      const prisma = await getDb();

      // Find the existing page view record
      const existingView = await prisma.pageView.findFirst({
        where: {
          postId: postId,
          sessionId: sessionId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!existingView) {
        return { updated: false, reason: 'record_not_found' };
      }

      const updateData = {};
      if (typeof metrics.timeOnPageSec === 'number') {
        updateData.timeOnPage = Math.max(0, Math.round(metrics.timeOnPageSec));
      }
      if (typeof metrics.scrollDepthPct === 'number') {
        updateData.scrollDepth = Math.max(0, Math.min(100, Math.round(metrics.scrollDepthPct)));
      }
      if (typeof metrics.interactions === 'number') {
        updateData.interactions = Math.max(0, Math.round(metrics.interactions));
      }
      if (typeof metrics.engagement === 'string') {
        updateData.engagement = metrics.engagement.slice(0, 20);
      }

      if (Object.keys(updateData).length === 0) {
        return { updated: false, reason: 'no_metrics' };
      }

      await prisma.pageView.update({
        where: { id: existingView.id },
        data: updateData
      });

      return { updated: true };
    } catch (error) {
      console.error('Error recording page metrics:', error);
      return { updated: false, reason: 'error', error: error?.message };
    }
  }

  // Record a page view
  async recordPageView(postId, visitorData, request) {
    try {
      const prisma = await getDb();
      const ip = await this.getVisitorIP(request, visitorData?.clientIp);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const visitorFingerprint = this.generateVisitorFingerprint(ip, userAgent, visitorData);

      const viewData = {
        path: `/blogposts/${postId}`,
        postId: postId,
        visitorFingerprint: visitorFingerprint,
        ipAddress: ip,
        userAgent: userAgent,
        screenResolution: visitorData.screen || 'unknown',
        timezone: visitorData.timezone || 'unknown',
        language: visitorData.language || 'unknown',
        referrer: visitorData.referrer || 'direct',
        sessionId: visitorData.sessionId || crypto.randomUUID(),
        isAuthenticated: !!visitorData.isAuthenticated,
        userId: visitorData.userId || null
      };

      console.debug('[Analytics.recordPageView] creating page_view', viewData);

      // Record the page view
      await prisma.pageView.create({
        data: viewData
      });

      // Update post view count
      await this.updatePostViewCount(postId);

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
      const prisma = await getDb();

      // Count unique views (24h window to prevent spam)
      const uniqueViews = await this.getUniqueViewCount(postId, '24h');

      // Update post with new view count
      await prisma.post.update({
        where: { id: postId },
        data: {
          views: uniqueViews,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error updating post view count:', error);
    }
  }

  // Get unique view count for a post within time period
  async getUniqueViewCount(postId, timeWindow = '24h') {
    try {
      const prisma = await getDb();
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

      // Get all views for this post within time window
      const views = await prisma.pageView.findMany({
        where: {
          postId: postId,
          createdAt: {
            gte: timeThreshold
          }
        },
        select: {
          visitorFingerprint: true
        }
      });

      // Count unique visitor fingerprints
      const uniqueFingerprints = new Set(views.map(view => view.visitorFingerprint).filter(Boolean));
      return uniqueFingerprints.size;

    } catch (error) {
      console.error('Error getting unique view count:', error);
      return 0;
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
      const prisma = await getDb();
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

      // Get page views within time range
      const pageViews = await prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Count unique visitors by fingerprint
      const uniqueFingerprints = new Set(
        pageViews.map(v => v.visitorFingerprint).filter(Boolean)
      );

      // Aggregate top posts
      const postViews = {};
      const userAgentStats = {};

      pageViews.forEach(view => {
        // Count views per post
        if (view.postId) {
          postViews[view.postId] = (postViews[view.postId] || 0) + 1;
        }

        // Aggregate user agents
        if (view.userAgent) {
          const category = this.categorizeUserAgent(view.userAgent);
          userAgentStats[category] = (userAgentStats[category] || 0) + 1;
        }
      });

      // Get top posts with details
      const topPostEntries = Object.entries(postViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const topPosts = [];
      for (const [postId, views] of topPostEntries) {
        try {
          const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, title: true, slug: true }
          });
          if (post) {
            topPosts.push({
              id: postId,
              title: post.title,
              views: views,
              slug: post.slug
            });
          }
        } catch (error) {
          console.error(`Error fetching post ${postId}:`, error);
        }
      }

      // Recent sessions (deduplicated)
      const seenSessions = new Set();
      const recentSessions = [];
      for (const v of pageViews.slice(0, 100)) {
        const key = v.sessionId || v.visitorFingerprint;
        if (!key || seenSessions.has(key)) continue;
        seenSessions.add(key);

        recentSessions.push({
          id: v.id,
          postId: v.postId,
          ip: v.ipAddress,
          userAgent: v.userAgent,
          referrer: v.referrer,
          language: v.language,
          timezone: v.timezone,
          screen: v.screenResolution,
          sessionId: v.sessionId,
          isAuthenticated: v.isAuthenticated,
          userId: v.userId,
          visitorFingerprint: v.visitorFingerprint,
          timestamp: v.createdAt
        });

        if (recentSessions.length >= 25) break;
      }

      const periodDays = Math.max(1, Math.round((now - startDate) / (24 * 60 * 60 * 1000)));

      return {
        totalUniqueVisitors: uniqueFingerprints.size,
        totalViews: pageViews.length,
        topPosts,
        userAgentStats,
        averageViewsPerDay: Math.round(pageViews.length / periodDays),
        timeRange,
        periodDays,
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
      const prisma = await getDb();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Delete old page views
      const result = await prisma.pageView.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Cleaned up ${result.count} old page view records`);
      return { deleted: result.count };

    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return { deleted: 0, error: error.message };
    }
  }
}

// Create singleton instance
export const analyticsManager = new AnalyticsManager();

// Export convenience function for recording page views
export async function recordPageView(postId, visitorData, request) {
  return analyticsManager.recordPageView(postId, visitorData, request);
}

// Export convenience function for recording page metrics
export async function recordPageMetrics(postId, sessionId, metrics) {
  return analyticsManager.recordPageMetrics(postId, sessionId, metrics);
}

export default analyticsManager;
