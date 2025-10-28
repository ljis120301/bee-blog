import { 
  IconBrandTwitter, 
  IconBrandLinkedin, 
  IconBrandFacebook, 
  IconBrandReddit,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconBrandPinterest,
  IconLink, 
  IconMail 
} from '@tabler/icons-react';
import { useState } from 'react';

export default function ShareButtons({ 
  url, 
  title, 
  description = '',
  imageUrl = '',
  tags = '',
  className = '' 
}) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description);
  const shareImage = encodeURIComponent(imageUrl);
  const shareTags = encodeURIComponent(tags);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: IconBrandTwitter,
      url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}&hashtags=${shareTags}`,
      color: 'hover:text-blue-400',
    },
    {
      name: 'LinkedIn',
      icon: IconBrandLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${shareTitle}&summary=${shareDescription}`,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Facebook',
      icon: IconBrandFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle}`,
      color: 'hover:text-blue-800',
    },
    {
      name: 'Reddit',
      icon: IconBrandReddit,
      url: `https://reddit.com/submit?url=${shareUrl}&title=${shareTitle}`,
      color: 'hover:text-orange-600',
    },
    {
      name: 'TikTok',
      icon: IconBrandTiktok,
      url: `https://www.tiktok.com/share?url=${shareUrl}&title=${shareTitle}`,
      color: 'hover:text-black dark:hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: IconBrandWhatsapp,
      url: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
      color: 'hover:text-green-500',
    },
    {
      name: 'Telegram',
      icon: IconBrandTelegram,
      url: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
      color: 'hover:text-blue-500',
    },
    {
      name: 'Pinterest',
      icon: IconBrandPinterest,
      url: `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${shareTitle}&media=${shareImage}`,
      color: 'hover:text-red-600',
    },
    {
      name: 'Email',
      icon: IconMail,
      url: `mailto:?subject=${shareTitle}&body=${shareDescription}%0A%0A${shareUrl}`,
      color: 'hover:text-green-600',
    },
  ];

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#4c4f69] dark:text-cat-frappe-subtext0">
          Share this article:
        </span>
        <button
          onClick={handleCopyLink}
          className="px-3 py-1 text-xs bg-cat-frappe-yellow dark:bg-cat-frappe-peach text-cat-frappe-base rounded-full transition-all duration-200 hover:shadow-md relative"
          title="Copy link"
          aria-label="Copy link to clipboard"
        >
          <IconLink size={14} className="inline mr-1" />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
      
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-9">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 text-[#6c6f85] dark:text-cat-frappe-subtext1 ${link.color} hover:bg-gray-100 dark:hover:bg-cat-frappe-surface0 group`}
            title={`Share on ${link.name}`}
            aria-label={`Share on ${link.name}`}
          >
            <link.icon size={24} className="mb-1" />
            <span className="text-xs font-medium opacity-75 group-hover:opacity-100 transition-opacity">
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
