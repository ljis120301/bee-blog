"use client";
import { useEffect } from 'react';

const GoogleAd = ({ 
  adSlot, 
  adFormat = "auto", 
  responsive = true, 
  className = "",
  style = {},
  adLayout = "",
  adLayoutKey = "",
  width,
  height
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Initialize AdSense if not already done
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  // Only render ads in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_ADS !== 'true') {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500 p-4 text-center text-gray-600 dark:text-gray-400 ${className}`}>
        <p className="text-sm">Google Ad Placeholder</p>
        <p className="text-xs mt-1">Slot: {adSlot}</p>
      </div>
    );
  }

  const adProps = {
    className: `adsbygoogle ${className}`,
    style: { display: 'block', ...style },
    'data-ad-client': process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXXX',
    'data-ad-slot': adSlot,
    'data-ad-format': adFormat,
    ...(responsive && { 'data-full-width-responsive': 'true' }),
    ...(adLayout && { 'data-ad-layout': adLayout }),
    ...(adLayoutKey && { 'data-ad-layout-key': adLayoutKey }),
    ...(width && { 'data-ad-width': width }),
    ...(height && { 'data-ad-height': height })
  };

  return <ins {...adProps} />;
};

export default GoogleAd;
