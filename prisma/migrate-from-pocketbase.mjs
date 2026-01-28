/**
 * Pocketbase to Prisma Migration Script
 * ======================================
 * 
 * Fetches data from api.whoisjason.me and imports to SQLite
 * 
 * Run with: node prisma/migrate-from-pocketbase.mjs
 */

import PocketBase from 'pocketbase';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'blog.db');

console.log('🔄 Starting Pocketbase to Prisma migration...');
console.log(`📁 Database path: ${dbPath}`);

// Use better-sqlite3 directly for simpler migration
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Pocketbase
const pb = new PocketBase(process.env.PB_BASE_URL || 'https://api.whoisjason.me/');

// Helper to generate IDs
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function createAdminAccount() {
    console.log('\n👤 Creating admin account...');

    try {
        // Check if admin already exists
        const existing = db.prepare('SELECT * FROM User WHERE role = ?').get('ADMIN');

        if (existing) {
            console.log('  ⏭️  Admin account already exists');
            return;
        }

        // Create admin with password from env
        const password = process.env.ADMIN_PASSWORD;
        if (!password) {
            console.error('  ❌ ADMIN_PASSWORD environment variable not set');
            return;
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const id = generateId();
        const now = new Date().toISOString();

        db.prepare(`
      INSERT INTO User (id, email, username, passwordHash, name, role, emailVerified, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, process.env.ADMIN_EMAIL, 'admin', passwordHash, 'Admin', 'ADMIN', 1, now, now);

        console.log('  ✅ Admin account created!');
        console.log(`     Email: ${process.env.ADMIN_EMAIL}`);
        console.log('     Password: (from ADMIN_PASSWORD env var)');
    } catch (err) {
        console.error('  ❌ Error creating admin:', err.message);
    }
}

async function migrateTags() {
    console.log('\n🏷️  Migrating tags...');

    try {
        const tags = await pb.collection('tags').getFullList({ sort: 'name' });
        console.log(`  Found ${tags.length} tags to migrate`);

        const insert = db.prepare(`
      INSERT OR IGNORE INTO Tag (id, name, colorBg, colorText, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

        for (const tag of tags) {
            try {
                const now = new Date().toISOString();
                insert.run(
                    tag.id,
                    tag.name,
                    tag.color_bg || '#ef9f76',
                    tag.color_text || '#303446',
                    now
                );
                console.log(`  ✅ Migrated: #${tag.name}`);
            } catch (err) {
                console.error(`  ❌ Failed tag "${tag.name}":`, err.message);
            }
        }
    } catch (err) {
        console.error('  ❌ Error fetching tags:', err.message);
    }
}

async function migratePosts() {
    console.log('\n📝 Migrating posts...');

    try {
        const posts = await pb.collection('posts').getFullList({
            sort: '-created',
            expand: 'tags'
        });
        console.log(`  Found ${posts.length} posts to migrate`);

        // Get admin user ID for author
        const admin = db.prepare('SELECT id FROM User WHERE role = ?').get('ADMIN');
        const authorId = admin?.id || null;

        const insertPost = db.prepare(`
      INSERT OR IGNORE INTO Post (
        id, title, slug, content, description, dek, heroImageUrl,
        seoTitle, seoDescription, seoKeywords, isSpanTwo,
        readingTimeMinutes, views, published, authorId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const insertPostTag = db.prepare(`
      INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)
    `);

        for (const post of posts) {
            try {
                // Generate slug from title if not present
                const slug = post.slug || post.title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');

                insertPost.run(
                    post.id,
                    post.title || 'Untitled',
                    slug,
                    post.content || '',
                    post.description || null,
                    post.dek || null,
                    post.hero_image_url || null,
                    post.seo_title || post.title,
                    post.seo_description || post.description || null,
                    post.seo_keywords ? JSON.stringify(post.seo_keywords) : null,
                    post.isSpanTwo ? 1 : 0,
                    post.reading_time_minutes || null,
                    post.views || 0,
                    1, // published
                    authorId,
                    new Date(post.created).toISOString(),
                    new Date(post.updated || post.created).toISOString()
                );

                // Add tag relationships
                if (post.expand?.tags) {
                    for (const tag of post.expand.tags) {
                        try {
                            insertPostTag.run(post.id, tag.id);
                        } catch { }
                    }
                }

                console.log(`  ✅ Migrated: ${post.title}`);
            } catch (err) {
                console.error(`  ❌ Failed "${post.title}":`, err.message);
            }
        }
    } catch (err) {
        console.error('  ❌ Error fetching posts:', err.message);
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('  Pocketbase → Prisma Migration');
    console.log('='.repeat(50));

    try {
        await createAdminAccount();
        await migrateTags();
        await migratePosts();

        // Verify migration
        const postCount = db.prepare('SELECT COUNT(*) as count FROM Post').get();
        const tagCount = db.prepare('SELECT COUNT(*) as count FROM Tag').get();
        const userCount = db.prepare('SELECT COUNT(*) as count FROM User').get();

        console.log('\n' + '='.repeat(50));
        console.log('  ✅ Migration complete!');
        console.log('='.repeat(50));
        console.log(`\n📊 Database now contains:`);
        console.log(`   • ${userCount.count} users`);
        console.log(`   • ${postCount.count} posts`);
        console.log(`   • ${tagCount.count} tags`);
        console.log('\nYou can now:');
        console.log('  1. Restart the server: pnpm dev');
        console.log('  2. Visit: http://localhost:3000');
        console.log(`  3. Login with ADMIN_EMAIL / ADMIN_PASSWORD from .env`);

    } catch (err) {
        console.error('\n❌ Migration failed:', err);
    } finally {
        db.close();
    }
}

main();
