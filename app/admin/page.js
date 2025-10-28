'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Header from '@/components/app/layout/Header';
import Footer from '@/components/app/layout/Footer';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPageViews: 0,
    averageTimeOnPage: 0,
    averageBounceRate: 0,
    averageScrollDepth: 0,
    topPosts: [],
    recentSessions: [],
    userEngagement: 'Loading...',
    coreWebVitals: {},
    totalUsers: 0,
    totalPosts: 0,
    monthlyGrowth: 0
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    checkAdminStatusAndLoadData();
  }, [router, timeRange]);

  // Near real-time refresh so new page_views appear promptly
  useEffect(() => {
    if (!isAdmin) return;
    const intervalId = setInterval(() => {
      loadDashboardData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isAdmin, timeRange]);

  const checkAdminStatusAndLoadData = async () => {
    if (pb.authStore.isValid) {
      const user = pb.authStore.model;
      if (user.role === "admin") {
        setIsAdmin(true);
        await loadDashboardData();
      } else {
        router.push('/auth');
      }
    } else {
      router.push('/auth');
    }
    setLoading(false);
  };

  const loadDashboardData = async () => {
    try {
      // Fetch analytics data from our new API
      const analyticsResponse = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}` , {
        headers: pb.authStore.isValid ? { 'Authorization': `Bearer ${pb.authStore.token}` } : {}
      });
      const analyticsData = await analyticsResponse.json();

          if (analyticsData.success) {
        const data = analyticsData.data;
        
        setMetrics({
          totalPageViews: data.totalPageViews,
          totalUniqueVisitors: data.totalUniqueVisitors,
          averageTimeOnPage: data.averageTimeOnPage,
          averageBounceRate: data.averageBounceRate,
          totalUsers: data.totalUsers,
          totalPosts: data.totalPosts,
          topPosts: data.topPosts.map(post => ({
            id: post.id,
            title: post.title,
            views: post.views,
            avgTime: Math.floor(Math.random() * 300) + 120, // Will be real data once session tracking is added
            bounceRate: Math.floor(Math.random() * 40) + 20  // Will be real data once session tracking is added
          })),
          userEngagement: 'High',
          coreWebVitals: {
            lcp: 1.2,
            fid: 45,
            cls: 0.05,
            fcp: 0.9,
            ttfb: 650
          },
          recentSessions: Array.isArray(data.recentSessions) ? data.recentSessions : [],
            monthlyGrowth: Math.floor((data.totalUniqueVisitors / Math.max(data.periodDays, 1)) * 30)
        });
          // Attach recentConnections to state for rendering below
          try {
            if (Array.isArray(data.recentConnections)) {
              setRecentConnections(data.recentConnections);
            }
          } catch {}
      }

      // Still fetch users data for user management
      const usersData = await pb.collection('users').getList(1, 50, {
        sort: '-created',
        fields: 'id,username,email,role,created'
      });

      setUsers(usersData.items);

      // Comments moderation queue (pending or hidden)
      try {
        const pending = await pb.collection('comments').getList(1, 50, {
          sort: '-created',
          filter: 'status = "pending" || status = "hidden"',
          expand: 'author,post',
        });
        setPendingComments(pending.items || []);
      } catch {}

      // Comment flags/reports
      try {
        const flagged = await pb.collection('comment_flags').getList(1, 100, {
          sort: '-created',
          expand: 'comment,user',
        });
        setFlags(flagged.items || []);
      } catch {}


    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const generateMockSessions = () => {
    return [
      { id: 1, timeOnPage: 180, scrollDepth: 45, interactions: 3, engagement: 'medium', timestamp: new Date() },
      { id: 2, timeOnPage: 420, scrollDepth: 85, interactions: 8, engagement: 'high', timestamp: new Date() },
      { id: 3, timeOnPage: 90, scrollDepth: 25, interactions: 1, engagement: 'low', timestamp: new Date() },
      { id: 4, timeOnPage: 330, scrollDepth: 75, interactions: 6, engagement: 'high', timestamp: new Date() },
      { id: 5, timeOnPage: 210, scrollDepth: 55, interactions: 4, engagement: 'medium', timestamp: new Date() }
    ];
  };

  // IP log recent connections (from JSON)
  const [recentConnections, setRecentConnections] = useState([]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case 'high': return 'text-cat-frappe-green bg-cat-frappe-green/20';
      case 'medium': return 'text-cat-frappe-yellow bg-cat-frappe-yellow/20';
      case 'low': return 'text-cat-frappe-red bg-cat-frappe-red/20';
      default: return 'text-cat-frappe-subtext0 bg-cat-frappe-overlay0/20';
    }
  };

  const getVitalStatus = (metric, value) => {
    const thresholds = {
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1.8, poor: 3.0 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-cat-frappe-subtext0';

    if (value <= threshold.good) return 'text-cat-frappe-green';
    if (value <= threshold.poor) return 'text-cat-frappe-yellow';
    return 'text-cat-frappe-red';
  };

  const deletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await pb.collection('posts').delete(postId);
        await loadDashboardData(); // Refresh data
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await pb.collection('users').update(userId, { role: newRole });
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const setCommentStatus = async (commentId, status) => {
    try {
      await pb.collection('comments').update(commentId, { status });
      await loadDashboardData();
    } catch (e) {
      alert('Failed to update comment status');
    }
  };

  const resolveFlag = async (flagId) => {
    try {
      await pb.collection('comment_flags').update(flagId, { resolved: true });
      await loadDashboardData();
    } catch (e) {
      alert('Failed to resolve flag');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-1 dark:bg-cat-frappe-base flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cat-frappe-peach mx-auto"></div>
          <p className="mt-4 text-cat-frappe-base dark:text-cat-frappe-text">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-yellow-1 dark:bg-cat-frappe-base flex items-center justify-center">
        <div className="max-w-md w-full bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg p-6 text-center">
          <div className="text-cat-frappe-red text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-text mb-2">Access Denied</h1>
          <p className="text-cat-frappe-subtext0 dark:text-cat-frappe-subtext0 mb-4">You need admin privileges to access this dashboard.</p>
          <a href="/auth" className="bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base px-4 py-2 rounded-full hover:scale-105 transition-all duration-300 font-bold">
            Login as Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-1 dark:bg-cat-frappe-base">
      <Header />
      
      {/* Main Content */}
      <div className="pt-[calc(64px+8px)]">
        {/* Page Header */}
        <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 shadow-sm border-b border-cat-frappe-overlay0/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-cat-frappe-base dark:text-cat-frappe-text">🐝 Admin Dashboard</h1>
                <p className="text-sm text-cat-frappe-subtext0 dark:text-cat-frappe-subtext0 mt-1">Behavioral Metrics, Analytics & Site Management</p>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-cat-frappe-overlay0/30 dark:border-cat-frappe-overlay0 rounded-lg px-3 py-2 text-sm bg-white dark:bg-cat-frappe-surface1 text-cat-frappe-base dark:text-cat-frappe-text"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                <a href="/blogposts/aurthor-portal" className="text-cat-frappe-peach hover:text-cat-frappe-yellow transition-colors duration-200 font-medium">Author Portal</a>
                <a href="/" className="text-cat-frappe-blue hover:text-cat-frappe-sapphire transition-colors duration-200 font-medium">← Back to Site</a>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Moderation */}
        <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg border border-cat-frappe-overlay0/20 mb-8">
          <div className="px-6 py-4 border-b border-cat-frappe-overlay0/20">
            <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-text">Comments Moderation</h2>
            <p className="text-sm text-cat-frappe-subtext0">Review and moderate pending/hidden comments.</p>
          </div>
          <div className="divide-y divide-cat-frappe-overlay0/20">
            {pendingComments.length === 0 ? (
              <div className="p-6 text-cat-frappe-subtext0">No comments pending moderation.</div>
            ) : pendingComments.map((c) => (
              <div key={c.id} className="p-6 flex flex-col gap-2">
                <div className="text-sm text-cat-frappe-subtext0">
                  <span className="font-medium text-cat-frappe-base dark:text-cat-frappe-text">{c.expand?.author?.username || c.expand?.author?.email}</span>
                  <span className="ml-2">on post: {c.expand?.post?.title || c.post}</span>
                  <span className="ml-2">{new Date(c.created).toLocaleString()}</span>
                </div>
                <div className="text-cat-frappe-base dark:text-cat-frappe-text whitespace-pre-wrap break-words">
                  {c.content}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button className="px-3 py-1 rounded bg-cat-frappe-green/20 text-cat-frappe-green" onClick={() => setCommentStatus(c.id, 'published')}>Publish</button>
                  <button className="px-3 py-1 rounded bg-cat-frappe-yellow/20 text-cat-frappe-yellow" onClick={() => setCommentStatus(c.id, 'hidden')}>Hide</button>
                  <button className="px-3 py-1 rounded bg-cat-frappe-red/20 text-cat-frappe-red" onClick={() => setCommentStatus(c.id, 'deleted')}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Reports */}
        <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg border border-cat-frappe-overlay0/20 mb-8">
          <div className="px-6 py-4 border-b border-cat-frappe-overlay0/20">
            <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-text">Comment Reports</h2>
            <p className="text-sm text-cat-frappe-subtext0">User-submitted reports for moderation.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white dark:bg-cat-frappe-surface1">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-cat-frappe-surface0 divide-y divide-cat-frappe-overlay0/20">
                {flags.length === 0 ? (
                  <tr><td className="px-6 py-4 text-cat-frappe-subtext0" colSpan={6}>No reports.</td></tr>
                ) : flags.map((f) => (
                  <tr key={f.id}>
                    <td className="px-6 py-4 text-sm text-cat-frappe-base dark:text-cat-frappe-text max-w-[400px]">
                      {(f.expand?.comment?.content || '').slice(0, 200)}{(f.expand?.comment?.content || '').length > 200 ? '…' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-cat-frappe-base dark:text-cat-frappe-text">
                      {f.expand?.user?.username || f.expand?.user?.email || 'n/a'}
                    </td>
                    <td className="px-6 py-4 text-sm text-cat-frappe-base dark:text-cat-frappe-text">
                      {f.reason || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-cat-frappe-subtext0">
                      {new Date(f.created).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {f.resolved ? <span className="text-cat-frappe-green">Resolved</span> : <span className="text-cat-frappe-yellow">Open</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {!f.resolved && (
                        <button className="px-3 py-1 rounded bg-cat-frappe-green/20 text-cat-frappe-green" onClick={() => resolveFlag(f.id)}>Mark Resolved</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg p-6 border border-cat-frappe-overlay0/20">
            <div className="flex items-center">
              <div className="text-3xl text-cat-frappe-blue">👁️</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-cat-frappe-subtext0 dark:text-cat-frappe-subtext0">Unique Visitors</p>
                <p className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-text">{metrics.totalUniqueVisitors?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg p-6 border border-cat-frappe-overlay0/20">
            <div className="flex items-center">
              <div className="text-3xl text-cat-frappe-green">⏱️</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-cat-frappe-subtext0 dark:text-cat-frappe-subtext0">Avg. Time on Page</p>
                <p className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-text">{formatTime(metrics.averageTimeOnPage)}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg p-6 border border-cat-frappe-overlay0/20">
            <div className="flex items-center">
              <div className="text-3xl text-cat-frappe-mauve">📊</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-cat-frappe-subtext0 dark:text-cat-frappe-subtext0">Bounce Rate</p>
                <p className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-text">{metrics.averageBounceRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg p-6 border border-cat-frappe-overlay0/20">
            <div className="flex items-center">
              <div className="text-3xl text-cat-frappe-peach">👥</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-cat-frappe-subtext0 dark:text-cat-frappe-subtext0">Total Users</p>
                <p className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-text">{metrics.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg p-6 border border-cat-frappe-overlay0/20">
            <div className="flex items-center">
              <div className="text-3xl text-cat-frappe-yellow">📝</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-cat-frappe-subtext0 dark:text-cat-frappe-subtext0">Total Posts</p>
                <p className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-text">{metrics.totalPosts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Core Web Vitals */}
          <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg border border-cat-frappe-overlay0/20">
            <div className="px-6 py-4 border-b border-cat-frappe-overlay0/20">
              <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-text">Core Web Vitals</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cat-frappe-subtext0">Largest Contentful Paint (LCP)</span>
                  <span className={`font-bold ${getVitalStatus('lcp', metrics.coreWebVitals.lcp)}`}>
                    {metrics.coreWebVitals.lcp}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cat-frappe-subtext0">First Input Delay (FID)</span>
                  <span className={`font-bold ${getVitalStatus('fid', metrics.coreWebVitals.fid)}`}>
                    {metrics.coreWebVitals.fid}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cat-frappe-subtext0">Cumulative Layout Shift (CLS)</span>
                  <span className={`font-bold ${getVitalStatus('cls', metrics.coreWebVitals.cls)}`}>
                    {metrics.coreWebVitals.cls}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cat-frappe-subtext0">First Contentful Paint (FCP)</span>
                  <span className={`font-bold ${getVitalStatus('fcp', metrics.coreWebVitals.fcp)}`}>
                    {metrics.coreWebVitals.fcp}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-cat-frappe-subtext0">Time to First Byte (TTFB)</span>
                  <span className={`font-bold ${getVitalStatus('ttfb', metrics.coreWebVitals.ttfb)}`}>
                    {metrics.coreWebVitals.ttfb}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends & Breakdown */}
        {/* Charts - display only those with data via Tabs */}
        {(metrics.topPosts?.length || metrics.viewsByDay?.length || (metrics.engagementBreakdown || []).some(e => e.value > 0)) && (
          <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg border border-cat-frappe-overlay0/20 mb-8">
            <div className="px-6 py-4 border-b border-cat-frappe-overlay0/20">
              <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-text">Analytics</h2>
            </div>
            <div className="p-6">
              <Tabs defaultValue={metrics.topPosts?.length ? 'top' : (metrics.viewsByDay?.length ? 'views' : 'engagement')}>
                <TabsList className="mb-4">
                  {metrics.topPosts?.length ? <TabsTrigger value="top">Top Posts</TabsTrigger> : null}
                  {metrics.viewsByDay?.length ? <TabsTrigger value="views">Views by Day</TabsTrigger> : null}
                  {(metrics.engagementBreakdown || []).some(e => e.value > 0) ? <TabsTrigger value="engagement">Engagement</TabsTrigger> : null}
                </TabsList>

                {metrics.topPosts?.length ? (
                  <TabsContent value="top">
                    <ChartContainer id="top-posts" config={{ views: { label: 'Views', color: 'hsl(25 95% 53%)' } }}>
                      <BarChart data={metrics.topPosts.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" hide />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </TabsContent>
                ) : null}

                {metrics.viewsByDay?.length ? (
                  <TabsContent value="views">
                    <ChartContainer id="views-by-day" config={{ views: { label: 'Views', color: 'hsl(221 83% 53%)' } }}>
                      <LineChart data={metrics.viewsByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </TabsContent>
                ) : null}

                {(metrics.engagementBreakdown || []).some(e => e.value > 0) ? (
                  <TabsContent value="engagement">
                    <ChartContainer id="engagement" config={{ high: { label: 'High', color: 'hsl(142 76% 36%)' }, medium: { label: 'Medium', color: 'hsl(38 92% 50%)' }, low: { label: 'Low', color: 'hsl(0 84% 60%)' } }}>
                      <PieChart>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Pie data={metrics.engagementBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                          {metrics.engagementBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ChartContainer>
                  </TabsContent>
                ) : null}
              </Tabs>
            </div>
          </div>
        )}

        {/* Recent User Sessions */}
        <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg mb-8 border border-cat-frappe-overlay0/20">
          <div className="px-6 py-4 border-b border-cat-frappe-overlay0/20">
            <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-text">Recent User Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Time on Page</TableHead>
                  <TableHead>Scroll Depth</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="whitespace-nowrap">#{session.id || session.sessionId || 'n/a'}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{session.postTitle || session.postId || '—'}</TableCell>
                    <TableCell>{session.timeOnPage ? formatTime(session.timeOnPage) : '-'}</TableCell>
                    <TableCell>{typeof session.scrollDepth === 'number' ? `${session.scrollDepth}%` : '-'}</TableCell>
                    <TableCell>{typeof session.interactions === 'number' ? session.interactions : '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEngagementColor(session.engagement)}`}>{session.engagement || 'n/a'}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{session.ip || session.ipAddress || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{session.timestamp ? new Date(session.timestamp).toLocaleTimeString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Connections (IP Log) */}
        <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg mb-8 border border-cat-frappe-overlay0/20">
          <div className="px-6 py-4 border-b border-cat-frappe-overlay0/20">
            <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-text">Recent Connections (JSON Log)</h2>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentConnections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-cat-frappe-subtext0">No connections logged yet.</TableCell>
                  </TableRow>
                ) : recentConnections.map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="whitespace-nowrap">{c.timestamp ? new Date(c.timestamp).toLocaleString() : '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{c.ip || '-'}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{c.path || c.url || '-'}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{c.referrer || '-'}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{c.userAgent || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{c.country || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-[#F6EEE5] dark:bg-cat-frappe-surface0 rounded-lg shadow-lg border border-cat-frappe-overlay0/20">
          <div className="px-6 py-4 border-b border-cat-frappe-overlay0/20">
            <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-text">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white dark:bg-cat-frappe-surface1">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cat-frappe-subtext0 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-cat-frappe-surface0 divide-y divide-cat-frappe-overlay0/20">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-text">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cat-frappe-base dark:text-cat-frappe-text">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cat-frappe-base dark:text-cat-frappe-text">
                      <select 
                        value={user.role || 'user'} 
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="border border-cat-frappe-overlay0/30 dark:border-cat-frappe-overlay0 rounded px-2 py-1 text-sm bg-white dark:bg-cat-frappe-surface1 text-cat-frappe-base dark:text-cat-frappe-text"
                      >
                        <option value="user">User</option>
                        <option value="author">Author</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cat-frappe-subtext0">
                      {new Date(user.created).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cat-frappe-subtext0">
                      <button className="text-cat-frappe-blue hover:text-cat-frappe-sapphire mr-2 transition-colors duration-200">Edit</button>
                      <button className="text-cat-frappe-red hover:text-cat-frappe-maroon transition-colors duration-200">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      </div>
      <Footer />
    </div>
  );
}
