/**
 * Rate Limiter - In-Memory Implementation
 * ========================================
 * 
 * Simple token bucket rate limiter for protecting auth endpoints.
 * Note: Resets on server restart. For production persistence, use Redis.
 */

// Store: { key: { tokens: number, lastRefill: timestamp } }
const store = new Map();

// Cleanup expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, data] of store.entries()) {
        if (now - data.lastRefill > data.windowMs * 2) {
            store.delete(key);
        }
    }
}, CLEANUP_INTERVAL);

/**
 * Create a rate limiter with specified configuration
 * @param {Object} options
 * @param {number} options.maxAttempts - Maximum attempts in window
 * @param {number} options.windowMs - Time window in milliseconds
 * @returns {Object} Rate limiter instance
 */
export function createRateLimiter({ maxAttempts = 5, windowMs = 15 * 60 * 1000 }) {
    return {
        /**
         * Check if request is allowed and consume a token
         * @param {string} key - Unique identifier (e.g., IP address)
         * @returns {{ allowed: boolean, remaining: number, resetAt: Date }}
         */
        check(key) {
            const now = Date.now();
            const storeKey = `${maxAttempts}-${windowMs}-${key}`;

            let data = store.get(storeKey);

            if (!data) {
                // First request from this key
                data = {
                    tokens: maxAttempts - 1,
                    lastRefill: now,
                    windowMs,
                };
                store.set(storeKey, data);
                return {
                    allowed: true,
                    remaining: data.tokens,
                    resetAt: new Date(now + windowMs),
                };
            }

            // Check if window has expired and refill
            if (now - data.lastRefill >= windowMs) {
                data.tokens = maxAttempts - 1;
                data.lastRefill = now;
                store.set(storeKey, data);
                return {
                    allowed: true,
                    remaining: data.tokens,
                    resetAt: new Date(now + windowMs),
                };
            }

            // Check if tokens available
            if (data.tokens > 0) {
                data.tokens--;
                store.set(storeKey, data);
                return {
                    allowed: true,
                    remaining: data.tokens,
                    resetAt: new Date(data.lastRefill + windowMs),
                };
            }

            // Rate limited
            return {
                allowed: false,
                remaining: 0,
                resetAt: new Date(data.lastRefill + windowMs),
            };
        },

        /**
         * Reset the limiter for a key (e.g., on successful login)
         * @param {string} key - Unique identifier
         */
        reset(key) {
            const storeKey = `${maxAttempts}-${windowMs}-${key}`;
            store.delete(storeKey);
        },
    };
}

// Pre-configured limiters for common use cases
export const loginLimiter = createRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
});

export const registerLimiter = createRateLimiter({
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
});

/**
 * Get client IP from request headers
 * @param {Request} request
 * @returns {string}
 */
export function getClientIP(request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';
}
