"use client";
import GoogleAd from '../GoogleAd';

const SquareAd = ({ className = "" }) => {
  return (
    <div className={`w-full my-4 flex justify-center ${className}`}>
      <GoogleAd
        adSlot="SQUARE_AD_SLOT_ID" // Replace with your actual ad slot ID
        adFormat="auto"
        responsive={true}
        className="max-w-sm w-full"
        style={{ minHeight: '280px' }}
        width="300"
        height="250"
      />
    </div>
  );
};

export default SquareAd;
