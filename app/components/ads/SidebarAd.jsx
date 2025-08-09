"use client";
import GoogleAd from '../GoogleAd';

const SidebarAd = ({ className = "" }) => {
  return (
    <div className={`w-full my-4 ${className}`}>
      <GoogleAd
        adSlot="SIDEBAR_AD_SLOT_ID" // Replace with your actual ad slot ID
        adFormat="auto"
        responsive={true}
        className="w-full"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
};

export default SidebarAd;
