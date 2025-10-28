This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
# pre-requisities install node js 

# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
# download and install Node.js (you may need to restart the terminal)
nvm install 20
# verifies the right Node.js version is in the environment
node -v # should print `v20.17.0`
# verifies the right npm version is in the environment
npm -v # should print `10.8.2`

mkdir blog-website 

cd blog-website 
git clone https://github.com/ljis120301/json-webapp.git
npn install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## cute blog website with next js and tailwind

hi 
## cute blog website 

information about our cool blog website 

we made it using AI to give initial mockup with HTML CSS and JavaScript. 
Transitioned to a next js

## RSS Feed

BeeBlog now supports RSS feed subscriptions! Users can add your blog to any RSS reader application.

### How to Subscribe

Users can subscribe to your blog using any of these methods:

1. **Automatic Discovery**: Most RSS readers will automatically detect the feed when users enter `https://bee.whoisjason.me`

2. **Direct Feed URL**: Users can manually add the feed URL:
   ```
   https://bee.whoisjason.me/feed.xml
   ```

3. **Popular RSS Readers**:
   - Feedly
   - Inoreader
   - The Old Reader
   - NewsBlur
   - Feedbin
   - NetNewsWire (Mac/iOS)
   - Reeder (Mac/iOS)
   - FeedReader
   - And many more!

### Technical Details

The RSS feed:
- Uses RSS 2.0 format (most compatible)
- Includes the last 50 blog posts
- Updates automatically when new posts are published
- Uses the same PocketBase database connection as the rest of the site
- Includes full post descriptions, publication dates, and featured images
- Supports content:encoded for rich content
- Implements proper caching for performance (1 hour cache, 30 min stale-while-revalidate)

### Feed Discovery

The RSS feed is automatically discoverable through:
- `<link rel="alternate">` tag in the HTML head (autodiscovery)
- Listed in `/robots.txt` for search engines and aggregators
- Proper Content-Type headers for RSS readers 
