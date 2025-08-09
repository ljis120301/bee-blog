"use client";
import GoogleAd from '../GoogleAd';

const BannerAd = ({ className = "" }) => {
  return (
    <div className={`w-full my-4 ${className}`}>
      <GoogleAd
        adSlot="BANNER_AD_SLOT_ID" // Replace with your actual ad slot ID
        adFormat="auto"
        responsive={true}
        className="w-full"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
};

export default BannerAd;
