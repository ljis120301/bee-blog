"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { revalidatePostsPage } from '@/app/actions/revalidate';
import Header from "@/components/app/layout/Header";
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import { uploadInChunks } from '@/lib/chunkUpload';
import LoadingSpinner from '@/components/app/shared/LoadingSpinner.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconSend, IconArrowLeft, IconSettings, IconCheck, IconCloudUpload } from "@tabler/icons-react";
import ConfirmationDialog from "@/components/app/shared/ConfirmationDialog";
import ArticleSettingsSheet from "@/components/author-portal/ArticleSettingsSheet";
import Link from 'next/link';


const TipTapEditor = dynamic(() => import('@/components/editor/TipTapEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function AuthorPortal() {
  const router = useRouter();
  // Trigger HMR update
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [dek, setDek] = useState('');
  const [slug, setSlug] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [isSpanTwo, setIsSpanTwo] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mdParser, setMdParser] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [activeUploads, setActiveUploads] = useState(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [seoAutoKeywords, setSeoAutoKeywords] = useState(true);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [newTagName, setNewTagName] = useState('');
  const [newTagBg, setNewTagBg] = useState('#ef9f76');
  const [newTagFg, setNewTagFg] = useState('#303446');
  const TAG_COLOR_PRESETS = [
    // Core theme tones
    { name: 'Peach', bg: '#ef9f76', text: '#303446' },
    { name: 'Yellow', bg: '#e5c890', text: '#303446' },
    { name: 'Green', bg: '#a6d189', text: '#303446' },
    { name: 'Mauve', bg: '#ca9ee6', text: '#303446' },
    { name: 'Blue', bg: '#8caaee', text: '#303446' },
    // Extended palette aligned with site theme
    { name: 'Red', bg: '#e78284', text: '#303446' },
    { name: 'Maroon', bg: '#ea999c', text: '#303446' },
    { name: 'Pink', bg: '#f4b8e4', text: '#303446' },
    { name: 'Sky', bg: '#99d1db', text: '#303446' },
    { name: 'Teal', bg: '#81c8be', text: '#303446' },
    { name: 'Sapphire', bg: '#85c1dc', text: '#303446' },
    { name: 'Lavender', bg: '#babbf1', text: '#303446' },
    { name: 'Rosewater', bg: '#f2d5cf', text: '#303446' },
    { name: 'Flamingo', bg: '#eebebe', text: '#303446' },
    { name: 'Overlay', bg: '#e6e9ef', text: '#303446' },
  ];
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { user: authUser, isAdmin: isAdminRole, isAuthor: isAuthorRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (isAdminRole || isAuthorRole) {
        setIsAdmin(true);
      } else {
        router.push('/auth');
      }
    }
  }, [router, authLoading, isAdminRole, isAuthorRole]);

  useEffect(() => {
    const initializeMdParser = () => {
      const mdInstance = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true
      })
        .use(sub)
        .use(sup)
        .use(ins)
        .use(mark)
        .use(taskLists);

      // Add custom rendering rules for videos
      const defaultRender = mdInstance.renderer.rules.html_block ||
        ((tokens, idx) => tokens[idx].content);

      mdInstance.renderer.rules.html_block = (tokens, idx, options, env, self) => {
        const content = tokens[idx].content;
        if (content.includes('<video')) {
          return content; // Return video HTML as-is
        }
        return defaultRender(tokens, idx, options, env, self);
      };

      setMdParser(mdInstance);
    };

    initializeMdParser();
  }, []);

  // Load existing tags via API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/tags');
        const data = await res.json();
        if (data.success && mounted) setAvailableTags(data.tags);
      } catch (e) {
        console.warn('Tags not available:', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Add tag to current post's selection
  const addTagToPost = (id) => {
    setSelectedTagIds(prev => new Set(prev).add(id));
  };

  // Remove tag from current post's selection (does NOT delete globally)
  const removeTagFromPost = (id) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Legacy toggle function - now just calls add/remove
  const toggleTag = (id) => {
    if (selectedTagIds.has(id)) {
      removeTagFromPost(id);
    } else {
      addTagToPost(id);
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim().toLowerCase();
    if (!name) {
      showNotification('Tag name cannot be empty', 'error');
      return;
    }

    // Check if tag already exists
    const existing = availableTags.find(t => t.name.toLowerCase() === name);
    if (existing) {
      showNotification(`Tag "${name}" already exists. Adding to post.`, 'info');
      addTagToPost(existing.id);
      setNewTagName('');
      return;
    }

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, colorBg: newTagBg, colorText: newTagFg }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailableTags(prev => [...prev, data.tag]);
        addTagToPost(data.tag.id);
        setNewTagName('');
        showNotification(`Created and added "${name}" tag`, 'success');
      } else {
        showNotification(data.error || 'Failed to create tag', 'error');
      }
    } catch (e) {
      console.error('Tag create failed:', e);
      showNotification('Failed to create tag', 'error');
    }
  };

  const requestDeleteTag = async (tag) => {
    // Simplified - just show the dialog, we'll delete via API
    setTagToDelete({ ...tag, postCount: 0 });
    setIsDeleteTagDialogOpen(true);
  };

  const confirmDeleteTag = async () => {
    if (!tagToDelete) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId: tagToDelete.id }),
      });
      const data = await res.json();

      if (data.success) {
        // Update UI
        setAvailableTags(prev => prev.filter(t => t.id !== tagToDelete.id));
        setSelectedTagIds(prev => {
          const next = new Set(prev);
          next.delete(tagToDelete.id);
          return next;
        });

        // Revalidate cache since tag affects multiple posts
        await revalidatePostsPage();

        showNotification('Tag deleted successfully', 'success');
      } else {
        showNotification(data.error || 'Failed to delete tag', 'error');
      }
    } catch (e) {
      console.error('Delete tag failed:', e);
      showNotification('Failed to delete tag', 'error');
    } finally {
      setIsDeleteTagDialogOpen(false);
      setTagToDelete(null);
    }
  };

  const handleEditorChange = (html) => {
    setContent(html);
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
  };

  const handleFileUpload = async (files) => {
    const uploadedFiles = [];
    const newLoadingFiles = new Set(loadingFiles);

    for (const file of files) {
      try {
        newLoadingFiles.add(file.name);
        setLoadingFiles(newLoadingFiles);
        setActiveUploads(prev => new Set(prev).add(file.name));

        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));

        const result = await uploadInChunks(file, (progress) => {
          console.log(`Upload progress for ${file.name}: ${Math.round(progress)}%`);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.round(progress)
          }));
        });

        if (result.success) {
          uploadedFiles.push({
            name: file.name,
            url: result.url,
            type: file.type,
            id: result.id,
            token: result.token
          });

          // Immediately update UI after successful upload
          setUploadedImages(prev => [...prev, {
            name: file.name,
            url: result.url,
            type: file.type,
            id: result.id,
            token: result.token
          }]);

          showNotification(`Successfully uploaded ${file.name}`, 'success');
        }

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        showNotification(`Failed to upload ${file.name}`, 'error');
      } finally {
        // Clean up immediately
        newLoadingFiles.delete(file.name);
        setLoadingFiles(newLoadingFiles);
        setActiveUploads(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  };

  const insertFileIntoContent = async (fileUrl, fileType, fileId) => {
    let markdown = '';
    // For TipTap we just append to HTML string

    if (fileType?.startsWith('video/')) {
      console.log('Generating video embed via proxy for file:', fileId);
      try {
        // Prefer token captured from upload response if available in uploadedImages
        const entry = uploadedImages.find(f => f.id === fileId);
        const token = entry?.token ? `&token=${encodeURIComponent(entry.token)}` : '';
        const streamUrl = `/api/files?id=${fileId}${token}`;
        // Insert bare <video> to be handled by reader and preview
        markdown = `<video controls preload="metadata" width="100%" class="max-w-full h-auto my-4 rounded-md" playsinline src="${streamUrl}"></video>`;
        setContent((prev) => `${prev}\n${markdown}`);
      } catch (error) {
        console.error('Error generating video embed:', error);
      }
    } else {
      // Insert image as HTML for TipTap
      markdown = `<img src="${fileUrl}" alt="${fileUrl.split('/').pop()}" class="max-w-full h-auto my-4 rounded-md"/>`;
      setContent((prev) => `${prev}\n${markdown}`);
    }
  };

  const handleHeroImageFile = async (file) => {
    if (!file) return;
    try {
      const result = await uploadInChunks(file, (progress) => {
        // no-op for hero image
      });
      if (result?.success) {
        setHeroImageUrl(result.url);
        showNotification('Hero image uploaded', 'success');
      } else {
        showNotification('Failed to upload hero image', 'error');
      }
    } catch (e) {
      showNotification('Failed to upload hero image', 'error');
    }
  };

  const wordCount = (html) => {
    const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  };

  const estimateReadingTime = (html) => {
    const words = wordCount(html);
    return Math.max(1, Math.ceil(words / 225));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!title.trim()) {
      showNotification('Post title is required', 'error');
      return;
    }
    if (!content.trim()) {
      showNotification('Post content is required', 'error');
      return;
    }

    try {
      // Remove any duplicate media items
      const uniqueMedia = Array.from(new Map(uploadedImages.map(item =>
        [item.url, item]
      )).values());

      const defaultSeoKeywords = (titleText, descriptionText, userKeywords) => {
        const base = new Set();
        (titleText || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3).slice(0, 8).forEach(w => base.add(w));
        (descriptionText || '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 4).slice(0, 6).forEach(w => base.add(w));
        ['beeblog', 'blog', 'article'].forEach(w => base.add(w));
        const user = (userKeywords ? userKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : []);
        user.forEach(k => base.add(k));
        return Array.from(base).slice(0, 15);
      };

      const data = {
        title,
        content, // TipTap HTML string
        description,
        author: authUser?.id,
        isSpanTwo,
        media: uniqueMedia,
        images: uniqueMedia.filter(item => item.type === 'image'),
        dek,
        slug: (slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')),
        heroImageUrl: heroImageUrl || null,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || description,
        seoKeywords: defaultSeoKeywords(seoTitle || title, seoDescription || description, seoAutoKeywords ? '' : seoKeywords),
        tocEnabled: false,
        readingTimeMinutes: estimateReadingTime(content),
        tags: Array.from(selectedTagIds)
      };

      console.log('Creating post with data:', data);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        // Revalidate the cache to show the new post immediately
        await revalidatePostsPage();
        router.push(`/blogposts/${result.post.id}`);
      } else {
        console.error('Error creating post:', result.error);
        if (result.error && result.error.includes('slug already exists')) {
          showNotification('Slug already exists. Please change the title or edit the slug in Settings.', 'error');
          // Optionally open settings to let user fix it
          setSettingsOpen(true);
        } else {
          showNotification(result.error || 'Failed to create post', 'error');
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const renderPreview = () => {
    // TipTap content is HTML; fallback to markdown rendering if not HTML-like
    const looksLikeHtml = typeof content === 'string' && /<\w+[^>]*>/.test(content);
    const htmlContent = looksLikeHtml && !content.trim().startsWith('#')
      ? content
      : (mdParser ? mdParser.render(content) : content);
    return (
      <div className="prose dark:prose-invert text-base max-w-none text-cat-frappe-base dark:text-cat-frappe-text">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  };

  const UploadProgress = () => {
    const hasActiveUploads = Object.keys(uploadProgress).length > 0;

    if (!hasActiveUploads) return null;

    return (
      <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-cat-frappe-base rounded-lg shadow-lg p-4 z-50">
        {Object.entries(uploadProgress).map(([filename, progress]) => (
          <div key={filename} className="mb-3 last:mb-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-cat-frappe-base dark:text-cat-frappe-text truncate pr-2">
                {filename}
              </span>
              <span className="text-sm text-cat-frappe-peach">
                {progress === 98 ? (
                  <span className="inline-flex items-center">
                    Processing
                    <span className="ml-1 animate-bounce delay-0">.</span>
                    <span className="ml-0.5 animate-bounce delay-150">.</span>
                    <span className="ml-0.5 animate-bounce delay-300">.</span>
                  </span>
                ) : (
                  `${progress}%`
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-cat-frappe-overlay2/30 dark:bg-cat-frappe-surface0 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${progress === 98
                  ? 'bg-gradient-to-r from-cat-frappe-peach via-cat-frappe-yellow to-cat-frappe-peach animate-[shimmer_2s_linear_infinite]'
                  : 'bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow'
                  }`}
                style={{
                  width: progress === 98 ? '100%' : `${progress}%`,
                  transition: 'width 0.3s ease-out',
                  backgroundSize: progress === 98 ? '200% 100%' : '100% 100%',
                  backgroundPosition: progress === 98 ? 'right center' : 'left center'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const Notifications = () => {
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 border ${type === 'error'
              ? 'bg-cat-frappe-red/90 dark:bg-cat-frappe-red text-white border-cat-frappe-red'
              : type === 'success'
                ? 'bg-[#a6d189]/90 dark:bg-[#a6d189] text-cat-frappe-base dark:text-[#303446] border-[#a6d189]'
                : type === 'info'
                  ? 'bg-cat-frappe-blue/90 dark:bg-cat-frappe-blue text-white border-cat-frappe-blue'
                  : 'bg-cat-frappe-yellow/90 dark:bg-cat-frappe-yellow text-cat-frappe-base dark:text-[#303446] border-cat-frappe-yellow'
              }`}
          >
            {message}
          </div>
        ))}
      </div>
    );
  };

  if (!isAdmin) {
    return <div><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-[#E9D4BA] dark:bg-cat-frappe-surface1 flex flex-col font-sans pt-20">
      <Header />
      <Notifications />
      <UploadProgress />
      <ConfirmationDialog
        isOpen={isDeleteTagDialogOpen}
        onClose={() => setIsDeleteTagDialogOpen(false)}
        onConfirm={confirmDeleteTag}
        message={`Delete tag "${tagToDelete?.name ?? ''}"? This will remove it from ${tagToDelete?.postCount ?? 0} post(s) and cannot be undone.`}
      />

      {/* Content Container - fills remaining space below Header */}
      <div className="flex-1 flex flex-col relative">
        {/* Title Bar with Settings and Publish - ALWAYS VISIBLE ON TOP */}
        <div className="w-full bg-white dark:bg-cat-frappe-base border-b-2 border-cat-frappe-surface1/30 dark:border-cat-frappe-surface0/30 z-50 relative shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3 sm:gap-4 bg-white dark:bg-cat-frappe-base">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <Link
                href="/blogposts"
                className="p-2 rounded-lg hover:bg-cat-frappe-surface1/20 dark:hover:bg-cat-frappe-surface0/20 text-cat-frappe-subtext0 hover:text-cat-frappe-text transition-colors shrink-0"
                title="Back to Posts"
              >
                <IconArrowLeft size={20} />
              </Link>
              <div className="flex flex-col flex-1 min-w-0 max-w-2xl gap-1">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Post"
                  className="text-base sm:text-lg md:text-xl font-bold bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder:text-cat-frappe-overlay0 text-cat-frappe-base dark:text-cat-frappe-text w-full"
                />
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-cat-frappe-subtext0">
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{slug || 'slug-will-appear-here'}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className={`flex items-center gap-1 ${isUploading ? 'text-cat-frappe-peach' : ''}`}>
                    {isUploading ? <IconCloudUpload size={12} className="animate-pulse" /> : <IconCheck size={12} />}
                    <span className="hidden sm:inline">{isUploading ? 'Saving...' : 'Changes Saved'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setSettingsOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40 hover:bg-white/50 dark:hover:bg-cat-frappe-surface0/50 text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-text transition-colors"
              >
                <IconSettings size={18} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="sm:hidden p-2 rounded-lg hover:bg-cat-frappe-surface1/20 text-cat-frappe-base dark:text-cat-frappe-text"
                title="Settings"
              >
                <IconSettings size={20} />
              </button>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <IconSend size={18} />
                <span className="hidden sm:inline">Publish</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor/Preview Tabs Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Tab Buttons */}
            <div className="px-4 sm:px-6 py-2 border-b border-cat-frappe-surface1/20 dark:border-cat-frappe-surface0/20 bg-white dark:bg-cat-frappe-base shrink-0 flex justify-center">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg p-1 bg-cat-frappe-surface1/20 dark:bg-cat-frappe-surface0/30">
                <TabsTrigger
                  value="edit"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-cat-frappe-base data-[state=active]:text-cat-frappe-base dark:data-[state=active]:text-cat-frappe-text data-[state=active]:shadow-sm text-cat-frappe-subtext0 dark:text-cat-frappe-overlay1"
                >
                  Editor
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-cat-frappe-base data-[state=active]:text-cat-frappe-base dark:data-[state=active]:text-cat-frappe-text data-[state=active]:shadow-sm text-cat-frappe-subtext0 dark:text-cat-frappe-overlay1"
                >
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content - scrollable area */}
            <TabsContent value="edit" className="flex-1 overflow-y-auto mt-0 bg-[#f8e8e0]/40 dark:bg-cat-frappe-crust/60 p-4 sm:p-6">
              <div className="max-w-5xl mx-auto h-full">
                <TipTapEditor
                  value={content}
                  onChange={handleEditorChange}
                  minHeightClass="min-h-[calc(100vh-280px)]"
                  onRequestUpload={async (file) => {
                    const result = await uploadInChunks(file, (progress) => {
                      setUploadProgress(prev => ({ ...prev, [file.name]: Math.round(progress) }));
                    });
                    if (result?.success) {
                      const entry = { name: file.name, url: result.url, type: file.type, id: result.id, token: result.token };
                      setUploadedImages(prev => [...prev, entry]);
                      insertFileIntoContent(result.url, file.type, result.id);
                      return entry;
                    }
                    throw new Error('Upload failed');
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto mt-0 bg-[#f0f2f5] dark:bg-cat-frappe-crust p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-cat-frappe-base rounded-xl shadow-md border border-cat-frappe-surface1/20 p-6 sm:p-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-cat-frappe-subtext0 mb-6 pb-2 border-b border-cat-frappe-surface1/30">Live Preview</h2>
                  {heroImageUrl && (
                    <div className="relative w-full h-48 sm:h-64 mb-6 rounded-lg overflow-hidden group">
                      <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    </div>
                  )}
                  <header className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-cat-frappe-base dark:text-cat-frappe-yellow mb-3 leading-tight">{title || 'Untitled Post'}</h1>
                    {dek && <p className="text-base sm:text-lg text-cat-frappe-subtext0 leading-relaxed italic">{dek}</p>}
                  </header>
                  <div className="prose dark:prose-invert max-w-none">
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* Slide-out Settings Sheet */}
      <ArticleSettingsSheet
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
        // Article info
        title={title}
        dek={dek}
        setDek={setDek}
        description={description}
        setDescription={setDescription}
        slug={slug}
        heroImageUrl={heroImageUrl}
        onHeroImageUpload={handleHeroImageFile}
        // SEO
        seoTitle={seoTitle}
        setSeoTitle={setSeoTitle}
        seoDescription={seoDescription}
        setSeoDescription={setSeoDescription}
        seoKeywords={seoKeywords}
        setSeoKeywords={setSeoKeywords}
        seoAutoKeywords={seoAutoKeywords}
        setSeoAutoKeywords={setSeoAutoKeywords}
        // Display
        isSpanTwo={isSpanTwo}
        setIsSpanTwo={setIsSpanTwo}
        // Tags
        availableTags={availableTags}
        selectedTagIds={selectedTagIds}
        addTagToPost={addTagToPost}
        removeTagFromPost={removeTagFromPost}
        isEditingTags={isEditingTags}
        setIsEditingTags={setIsEditingTags}
        requestDeleteTag={requestDeleteTag}
        newTagName={newTagName}
        setNewTagName={setNewTagName}
        newTagBg={newTagBg}
        setNewTagBg={setNewTagBg}
        newTagFg={newTagFg}
        setNewTagFg={setNewTagFg}
        selectedPreset={selectedPreset}
        setSelectedPreset={setSelectedPreset}
        handleCreateTag={handleCreateTag}
      />
    </div>
  );
}
