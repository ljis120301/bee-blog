// Behavioral Metrics & User Intent Optimization - 2025 SEO Enhancement
'use client';
import { useEffect, useState, useRef } from 'react';

export default function BehavioralMetricsOptimization({ post }) {
  const [metrics, setMetrics] = useState({
    timeOnPage: 0,
    scrollDepth: 0,
    bounceRate: 0,
    engagement: 'low',
    readingProgress: 0,
    interactionEvents: 0
  });
  
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const interactionCountRef = useRef(0);
  const isActiveRef = useRef(true);

  useEffect(() => {
    // Track user engagement and behavioral metrics
    const trackBehavioralMetrics = () => {
      const updateMetrics = () => {
        if (!isActiveRef.current) return;

        const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const scrollDepth = Math.floor((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        const currentScrollDepth = Math.max(maxScrollRef.current, scrollDepth);
        maxScrollRef.current = currentScrollDepth;

        // Calculate engagement level based on multiple factors
        let engagement = 'low';
        if (timeOnPage > 120 && currentScrollDepth > 50) engagement = 'high';
        else if (timeOnPage > 60 && currentScrollDepth > 25) engagement = 'medium';

        // Calculate reading progress based on content length
        const contentHeight = document.querySelector('article')?.scrollHeight || 0;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        const readingProgress = contentHeight > 0 ? Math.min(100, Math.floor(((scrollTop + viewportHeight) / contentHeight) * 100)) : 0;

        setMetrics({
          timeOnPage,
          scrollDepth: currentScrollDepth,
          readingProgress,
          interactionEvents: interactionCountRef.current,
          engagement
        });

        // Send to analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'engagement_metrics', {
            event_category: 'User Behavior',
            time_on_page: timeOnPage,
            scroll_depth: currentScrollDepth,
            reading_progress: readingProgress,
            engagement_level: engagement,
            interaction_count: interactionCountRef.current
          });
        }
      };

      // Track scroll events
      const handleScroll = () => updateMetrics();
      
      // Track interaction events
      const handleInteraction = () => {
        interactionCountRef.current += 1;
        updateMetrics();
      };

      // Track page visibility
      const handleVisibilityChange = () => {
        isActiveRef.current = !document.hidden;
        if (document.hidden) {
          // Send metrics when user leaves
          updateMetrics();
        }
      };

      // Event listeners
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('click', handleInteraction);
      window.addEventListener('keydown', handleInteraction);
      window.addEventListener('touchstart', handleInteraction, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Update metrics every 5 seconds
      const interval = setInterval(updateMetrics, 5000);

      // Cleanup
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(interval);
      };
    };

    const cleanup = trackBehavioralMetrics();
    return cleanup;
  }, []);

  // Send final metrics when component unmounts
  useEffect(() => {
    return () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'page_exit', {
          event_category: 'User Behavior',
          time_on_page: Math.floor((Date.now() - startTimeRef.current) / 1000),
          scroll_depth: maxScrollRef.current,
          interaction_count: interactionCountRef.current,
          engagement_level: metrics.engagement
        });
      }
    };
  }, [metrics.engagement]);

  return (
    <>
      {/* User Intent Meta Tags */}
      <meta name="user-intent-learn" content="programming,coding,development,tutorials" />
      <meta name="user-intent-implement" content="code-examples,step-by-step,practical-guides" />
      <meta name="user-intent-compare" content="technology-comparison,framework-analysis,tool-evaluation" />
      <meta name="user-intent-discover" content="trends,innovations,new-technologies,industry-insights" />
      <meta name="user-intent-solve" content="troubleshooting,debugging,error-solutions,how-to-fix" />
      
      {/* Behavioral Metrics Optimization */}
      <meta name="engagement-tracking" content="enabled" />
      <meta name="time-on-page-optimized" content="true" />
      <meta name="scroll-depth-tracking" content="enabled" />
      <meta name="interaction-tracking" content="enabled" />
      <meta name="reading-progress-tracking" content="enabled" />
      <meta name="bounce-rate-optimization" content="enabled" />
      
      {/* Content Quality Signals */}
      <meta name="content-depth" content="comprehensive" />
      <meta name="content-value" content="high" />
      <meta name="user-satisfaction" content="optimized" />
      <meta name="content-usefulness" content="practical" />
      <meta name="learning-outcomes" content="clear" />
      
      {/* User Experience Signals */}
      <meta name="ux-optimized" content="true" />
      <meta name="user-journey-optimized" content="true" />
      <meta name="conversion-optimized" content="true" />
      <meta name="retention-optimized" content="true" />
      <meta name="engagement-optimized" content="true" />

      {/* Hidden behavioral data for search engines */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <div data-behavioral-metric="time-on-page" data-value={metrics.timeOnPage}>
          Average Time on Page: {metrics.timeOnPage}s
        </div>
        <div data-behavioral-metric="scroll-depth" data-value={metrics.scrollDepth}>
          Scroll Depth: {metrics.scrollDepth}%
        </div>
        <div data-behavioral-metric="engagement" data-value={metrics.engagement}>
          Engagement Level: {metrics.engagement}
        </div>
        <div data-behavioral-metric="reading-progress" data-value={metrics.readingProgress}>
          Reading Progress: {metrics.readingProgress}%
        </div>
        <div data-behavioral-metric="interactions" data-value={metrics.interactionEvents}>
          User Interactions: {metrics.interactionEvents}
        </div>
      </div>

      {/* User Intent Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPageElement",
            "@id": "#user-intent-signals",
            "name": "User Intent Optimization",
            "description": "Behavioral metrics and user intent optimization for enhanced SEO performance",
            "mainContentOfPage": {
              "@type": "WebPageElement",
              "name": post?.title || "Technical Content",
              "description": post?.description || "Comprehensive technical guide and tutorial",
              "learningResourceType": [
                "tutorial",
                "guide", 
                "documentation",
                "example",
                "reference"
              ],
              "educationalUse": [
                "learning",
                "skill-building",
                "professional-development",
                "problem-solving",
                "implementation"
              ],
              "audience": {
                "@type": "EducationalAudience",
                "educationalRole": [
                  "developer",
                  "programmer", 
                  "engineer",
                  "student",
                  "professional"
                ]
              },
              "isPartOf": {
                "@type": "LearningResource",
                "name": "BeeBlog Technology Education",
                "url": "https://bee.whoisjason.me"
              }
            },
            "userInteractionStatistic": {
              "@type": "UserInteractionStatistic",
              "interactionType": "UserEngagement",
              "userInteractionCount": metrics.interactionEvents,
              "description": `User engagement metrics for ${post?.title || 'content'}`
            }
          }, null, 2)
        }}
      />
    </>
  );
}

// Export user intent categories for SEO optimization
export const USER_INTENT_CATEGORIES = {
  learn: {
    keywords: [
      'how to learn', 'tutorial', 'guide', 'beginner', 'introduction', 'basics',
      'fundamentals', 'course', 'training', 'education', 'study', 'understand'
    ],
    contentTypes: ['tutorial', 'guide', 'course', 'documentation', 'explanation'],
    userGoals: ['skill-building', 'knowledge-acquisition', 'understanding-concepts']
  },
  implement: {
    keywords: [
      'how to build', 'implementation', 'step by step', 'create', 'develop',
      'code example', 'practical', 'hands-on', 'build', 'make', 'setup'
    ],
    contentTypes: ['code-example', 'implementation-guide', 'step-by-step', 'tutorial'],
    userGoals: ['building-projects', 'solving-problems', 'practical-application']
  },
  compare: {
    keywords: [
      'vs', 'versus', 'comparison', 'difference', 'which is better', 'pros and cons',
      'alternatives', 'evaluate', 'analyze', 'contrast', 'review'
    ],
    contentTypes: ['comparison', 'review', 'analysis', 'evaluation'],
    userGoals: ['decision-making', 'tool-selection', 'technology-choice']
  },
  discover: {
    keywords: [
      'what is', 'latest', 'new', 'trends', 'emerging', 'innovation', 'future',
      'best practices', 'industry insights', 'updates', 'news'
    ],
    contentTypes: ['news', 'trends', 'insights', 'analysis', 'industry-report'],
    userGoals: ['staying-current', 'discovering-tools', 'understanding-trends']
  },
  solve: {
    keywords: [
      'error', 'fix', 'troubleshoot', 'debug', 'solution', 'problem', 'issue',
      'not working', 'help', 'resolve', 'overcome', 'address'
    ],
    contentTypes: ['troubleshooting', 'error-solution', 'debugging-guide', 'FAQ'],
    userGoals: ['problem-solving', 'bug-fixing', 'overcoming-obstacles']
  }
};

// Behavioral metrics thresholds for 2025 SEO
export const BEHAVIORAL_METRICS_THRESHOLDS = {
  timeOnPage: {
    excellent: 300, // 5+ minutes
    good: 120,      // 2+ minutes
    average: 60,    // 1+ minute
    poor: 30        // Less than 30 seconds
  },
  scrollDepth: {
    excellent: 80,  // 80%+ scroll
    good: 50,       // 50%+ scroll
    average: 25,    // 25%+ scroll
    poor: 10        // Less than 10% scroll
  },
  bounceRate: {
    excellent: 20,  // Less than 20% bounce
    good: 40,       // Less than 40% bounce
    average: 60,    // Less than 60% bounce
    poor: 80        // 80%+ bounce rate
  },
  engagementScore: {
    high: 'timeOnPage > 120 && scrollDepth > 50 && interactions > 3',
    medium: 'timeOnPage > 60 && scrollDepth > 25 && interactions > 1',
    low: 'timeOnPage < 60 || scrollDepth < 25 || interactions < 1'
  }
};
