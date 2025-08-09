"use client";
import GoogleAd from '../GoogleAd';

const InArticleAd = ({ className = "" }) => {
  return (
    <div className={`w-full my-6 flex justify-center ${className}`}>
      <div className="max-w-md w-full">
        <GoogleAd
          adSlot="IN_ARTICLE_AD_SLOT_ID" // Replace with your actual ad slot ID
          adFormat="fluid"
          adLayout="in-article"
          responsive={true}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default InArticleAd;
