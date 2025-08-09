// Unique Visitor Analytics System
// Tracks unique visitors using IP + User Agent + Session fingerprinting

import { pb } from './pocketbase';
import crypto from 'crypto';

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

  // Get visitor IP from request headers
  getVisitorIP(request) {
    // Check for various proxy headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, get the first one
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) return realIP;
    if (cfConnectingIP) return cfConnectingIP;
    
    // Fallback to connection remote address
    return request.ip || 'unknown';
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
      const ip = this.getVisitorIP(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const visitorFingerprint = this.generateVisitorFingerprint(ip, userAgent, visitorData);

      // Check if this is a unique view in the last 24 hours (to prevent spam)
      const isUnique24h = await this.isUniqueVisitor(postId, visitorFingerprint, '24h');

      if (!isUnique24h) {
        console.log('Duplicate view detected within 24h, not counting');
        return { counted: false, reason: 'duplicate_within_24h' };
      }

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
        is_authenticated: visitorData.isAuthenticated || false,
        user_id: visitorData.userId || null,
        created: new Date().toISOString()
      };

      // Record the page view
      await pb.collection('page_views').create(viewData);

      // Update post view count
      await this.updatePostViewCount(postId);

      // Update analytics aggregations
      await this.updateAnalyticsAggregations(postId, visitorFingerprint, ip, userAgent);

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

      const views = await pb.collection('page_views').getFullList({
        filter: `post_id="${postId}" && created>="${timeThreshold.toISOString()}"`,
        '$autoCancel': false
      });

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
      let analyticsRecord = await pb.collection('daily_analytics').getFirstListItem(
        `date="${today}"`,
        { '$autoCancel': false }
      ).catch(() => null);

      if (!analyticsRecord) {
        // Create new daily analytics record
        analyticsRecord = await pb.collection('daily_analytics').create({
          date: today,
          unique_visitors: [],
          total_views: 0,
          top_posts: {},
          user_agents: {},
          ip_addresses: {},
          created: new Date().toISOString()
        });
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
      await pb.collection('daily_analytics').update(analyticsRecord.id, {
        unique_visitors: uniqueVisitors,
        total_views: (analyticsRecord.total_views || 0) + 1,
        top_posts: topPosts,
        user_agents: userAgents,
        ip_addresses: ipAddresses,
        updated: new Date().toISOString()
      });

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

      return {
        totalUniqueVisitors: totalUniqueVisitors.size,
        totalViews,
        topPosts,
        userAgentStats,
        averageViewsPerDay: Math.round(totalViews / Math.max(dailyAnalytics.length, 1)),
        timeRange,
        periodDays: dailyAnalytics.length
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
      const oldViews = await pb.collection('page_views').getFullList({
        filter: `created<"${cutoffDate.toISOString()}"`,
        '$autoCancel': false
      });

      for (const view of oldViews) {
        await pb.collection('page_views').delete(view.id);
      }

      // Delete old daily analytics
      const oldAnalytics = await pb.collection('daily_analytics').getFullList({
        filter: `date<"${cutoffDate.toISOString().split('T')[0]}"`,
        '$autoCancel': false
      });

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
