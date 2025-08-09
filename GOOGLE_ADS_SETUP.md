# Google Ads Setup Guide

## 🎯 Overview
This guide will help you set up Google AdSense on your BeeBlog website to start earning revenue from your content.

## 📋 Prerequisites
1. A Google AdSense account
2. Your website approved by Google AdSense
3. Your AdSense Publisher ID

## 🔧 Configuration Steps

### 1. Get Your AdSense Publisher ID
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in to your account
3. Go to "Account" → "Account information"
4. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXXX`)

### 2. Update Environment Variables
Add these to your environment variables (`.env.local` for development):

```bash
# Google AdSense Configuration
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_ENABLE_ADS=true
```

### 3. Update app/layout.js
Replace `ca-pub-XXXXXXXXXXXXXXXXX` in `app/layout.js` line 92 with your actual Publisher ID:

```javascript
src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ACTUAL_ID"
```

### 4. Configure Ad Slots
For each ad component, you'll need to create ad units in AdSense and get their slot IDs:

1. Go to AdSense → "Ads" → "Ad units"
2. Create new ad units for each type:
   - **Banner Ad**: Responsive display ad (728x90 or responsive)
   - **Sidebar Ad**: Responsive display ad (300x250 or responsive)
   - **In-Article Ad**: In-article ad format
   - **Square Ad**: Fixed size ad (300x250)

3. Update the slot IDs in each component:
   - `app/components/ads/BannerAd.jsx`
   - `app/components/ads/SidebarAd.jsx`
   - `app/components/ads/InArticleAd.jsx`
   - `app/components/ads/SquareAd.jsx`

Replace `"BANNER_AD_SLOT_ID"`, `"SIDEBAR_AD_SLOT_ID"`, etc. with your actual slot IDs.

## 🎨 Ad Placements

### Current Ad Placements:

#### Home Page (`app/page.js`):
- **Top Banner**: Above the main content
- **Left Sidebar**: Below Information component
- **Right Sidebar**: Below MoreInformation component
- **Mid-content Square**: After the blog posts grid

#### Blog Post Page (`app/blogposts/[id]/page.js`):
- **Top Banner**: Below hero image, above content
- **Sidebar**: In the right sidebar after Information
- **In-Article**: At the end of the article content

## 🔒 Security & CSP
The Content Security Policy has been updated to allow Google AdSense domains:
- `https://pagead2.googlesyndication.com`
- `https://partner.googleadservices.com`
- `https://tpc.googlesyndication.com`
- `https://googleads.g.doubleclick.net`

## 🧪 Testing

### Development Testing:
Set environment variable to test ads in development:
```bash
NEXT_PUBLIC_ENABLE_ADS=true npm run dev
```

### Production Testing:
1. Deploy your changes
2. Wait 24-48 hours for Google to crawl your site
3. Check AdSense dashboard for ad serving status

## 📊 Ad Performance Tips

1. **Strategic Placement**: Current placements follow best practices:
   - Above the fold (banner ads)
   - Within content (in-article ads)
   - Sidebar placements for engagement

2. **Responsive Design**: All ads are responsive and mobile-friendly

3. **User Experience**: Ads are clearly separated from content and don't interfere with navigation

## 🚨 Important Notes

- **AdSense Approval**: Make sure your site is approved by AdSense before enabling ads
- **Policy Compliance**: Ensure your content complies with AdSense policies
- **Loading Performance**: Ads are loaded asynchronously to not impact page speed
- **Ad Blockers**: Some users may have ad blockers enabled
- **Revenue Sharing**: AdSense will handle payment processing and revenue distribution

## 🛠️ Customization

To customize ad appearance or add new ad placements:

1. **Create New Ad Component**: Follow the pattern in `app/components/ads/`
2. **Import and Use**: Import the component where you want to place the ad
3. **Style**: Use Tailwind classes to style the ad container
4. **Configure**: Set appropriate ad format and slot ID

## 📞 Support

If you encounter issues:
1. Check AdSense account for policy violations
2. Verify all IDs are correctly configured
3. Check browser console for JavaScript errors
4. Review Google AdSense Help Center
