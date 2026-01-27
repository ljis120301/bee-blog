"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { revalidatePostsPage } from '@/app/actions/revalidate';
import Header from "@/components/app/layout/Header";
import Footer from "@/components/app/layout/Footer";
import ScrollProgressBar from "@/components/app/blog/ScrollProgressBar";
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import { uploadInChunks } from '@/lib/chunkUpload';
import LoadingSpinner from '@/components/app/shared/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { IconSettings, IconSend, IconTrash } from "@tabler/icons-react";
import { FileUpload } from "@/components/ui/file-upload";
import ConfirmationDialog from "@/components/app/shared/ConfirmationDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";


const TipTapEditor = dynamic(() => import('@/components/editor/TipTapEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function AuthorPortal() {
  const router = useRouter();
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
        showNotification(result.error || 'Failed to create post', 'error');
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
    <>
      <ScrollProgressBar />
      <Header />
      <main className="pt-[calc(64px+8px)] text-lg">

        {/* Desktop split view */}
        <div className="container mx-auto px-2 sm:px-4 md:px-6 max-w-[2000px]">
          <div className="hidden xl:block mt-6">
            <ResizablePanelGroup direction="horizontal" className="w-full h-[calc(100vh-140px)]">
              {/* Editor panel */}
              <ResizablePanel defaultSize={65} minSize={35}>
                <div className="h-full rounded-lg bg-[#f8e8e0] dark:bg-cat-frappe-base shadow-lg flex flex-col">
                  {/* Editor header */}
                  <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-yellow">Editor</div>
                    <div className="flex items-center gap-3 text-xs text-[#4c4f69] dark:text-cat-frappe-subtext0">
                      <span>{wordCount(content)} words</span>
                      <span>{estimateReadingTime(content)} min</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 px-3 py-1.5 rounded-md text-cat-frappe-base dark:text-cat-frappe-text hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50 inline-flex items-center gap-2"
                          >
                            <IconSettings size={16} />
                            Settings
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-[#F6EEE5] dark:bg-cat-frappe-base text-cat-frappe-base dark:text-cat-frappe-text overflow-y-auto max-h-[90vh]">
                          <DialogHeader>
                            <DialogTitle>Post Settings</DialogTitle>
                            <DialogDescription>Configure metadata and presentation for this article. Keywords auto-generate from your title and summary by default.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-2 pr-1 pb-4">
                            <div>
                              <label className="block text-sm mb-1">Title</label>
                              <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                              />
                              <p className="text-xs mt-1 text-cat-frappe-subtext0">Main headline for your post. Keep it clear and compelling.</p>
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Summary</label>
                              <textarea
                                value={dek || description}
                                onChange={(e) => { setDek(e.target.value); setDescription(e.target.value); }}
                                rows={3}
                                className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                              />
                              <p className="text-xs mt-1 text-cat-frappe-subtext0">Appears below the title and in listings/SEO.</p>
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Slug</label>
                              <input
                                value={slug || (title ? title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '')}
                                onChange={() => { }}
                                disabled
                                className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-cat-frappe-surface1/50 dark:bg-cat-frappe-surface0/50 text-cat-frappe-base dark:text-cat-frappe-text"
                              />
                              <p className="text-xs mt-1 text-cat-frappe-subtext0">Auto-generated from the title. You don’t need to change this.</p>
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Hero Image</label>
                              <FileUpload onChange={(files) => { const file = files?.[0]; if (file) handleHeroImageFile(file); }} />
                              {heroImageUrl && (
                                <div className="mt-2">
                                  <img src={heroImageUrl} alt="Hero preview" className="h-16 w-28 object-cover rounded" />
                                </div>
                              )}
                              <p className="text-xs mt-1 text-cat-frappe-subtext0">Upload a banner image for the top of the article.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm mb-1">SEO Title</label>
                                <input
                                  value={seoTitle}
                                  onChange={(e) => setSeoTitle(e.target.value)}
                                  className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                                />
                                <p className="text-xs mt-1 text-cat-frappe-subtext0">Appears in search results. Defaults to your Title.</p>
                              </div>
                              <div>
                                <label className="block text-sm mb-1">SEO Description</label>
                                <input
                                  value={seoDescription}
                                  onChange={(e) => setSeoDescription(e.target.value)}
                                  className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                                />
                                <p className="text-xs mt-1 text-cat-frappe-subtext0">Short snippet for search engines. Defaults to Description.</p>
                              </div>
                              <div className="max-w-full">
                                <label className="block text-sm mb-1">SEO Keywords</label>
                                <div className="w-full max-w-full overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <input
                                    value={seoKeywords}
                                    onChange={(e) => { setSeoAutoKeywords(false); setSeoKeywords(e.target.value) }}
                                    placeholder="auto-generated unless overridden"
                                    className="flex-1 min-w-0 px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                                    disabled={seoAutoKeywords}
                                  />
                                  <label className="inline-flex items-center gap-1 text-xs shrink-0 px-2 py-1 rounded border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-white/60 dark:bg-cat-frappe-mantle/60 self-start">
                                    <input type="checkbox" className="accent-cat-frappe-yellow" checked={seoAutoKeywords} onChange={(e) => setSeoAutoKeywords(e.target.checked)} />
                                    Auto
                                  </label>
                                </div>
                                <p className="text-xs mt-1 text-cat-frappe-subtext0">Auto mode recommends keywords from your Title/Description. Uncheck to edit manually.</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSpanTwo}
                                  onChange={() => setIsSpanTwo(!isSpanTwo)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-cat-frappe-overlay2/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cat-frappe-yellow/30 dark:peer-focus:ring-cat-frappe-yellow/50 rounded-full peer dark:bg-cat-frappe-surface0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cat-frappe-surface1 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-cat-frappe-surface0 peer-checked:bg-cat-frappe-yellow"></div>
                                <span className="ml-3 text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-text">Span Two Columns (home grid feature)</span>
                              </label>
                              <div className="text-xs text-cat-frappe-subtext0">Table of contents is disabled globally for posts.</div>
                            </div>
                            {/* Tags selection */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-semibold">Tags</label>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingTags(v => !v)}
                                  className="text-xs rounded-full border px-2 py-1 bg-white/60 dark:bg-cat-frappe-surface0 border-cat-frappe-surface1 dark:border-cat-frappe-surface0"
                                >
                                  {isEditingTags ? '✓ Done editing' : '⚙️ Manage all tags'}
                                </button>
                              </div>

                              {/* Selected tags for this post */}
                              <div className="mb-3">
                                <div className="text-xs text-cat-frappe-subtext0 mb-1">Selected for this post:</div>
                                <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded-md border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-white/40 dark:bg-cat-frappe-mantle/40">
                                  {selectedTagIds.size === 0 ? (
                                    <span className="text-xs text-cat-frappe-subtext0 italic">No tags selected</span>
                                  ) : (
                                    Array.from(selectedTagIds).map(id => {
                                      const tag = availableTags.find(t => t.id === id);
                                      if (!tag) return null;
                                      return (
                                        <div key={id} className="relative inline-flex items-center">
                                          <button
                                            type="button"
                                            onClick={() => removeTagFromPost(id)}
                                            className="inline-flex items-center gap-1 h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border hover:opacity-80 transition-opacity"
                                            style={{ backgroundColor: tag.color_bg || '#ef9f76', color: tag.color_text || '#303446', borderColor: `${(tag.color_text || '#303446')}22` }}
                                            title={`Remove #${tag.name} from this post`}
                                          >
                                            #{tag.name}
                                            <span className="ml-1 text-[10px]">✕</span>
                                          </button>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Available tags to add */}
                              <div className="mb-3">
                                <div className="text-xs text-cat-frappe-subtext0 mb-1">Available tags (click to add):</div>
                                <div className="flex flex-wrap gap-2">
                                  {availableTags.filter(t => !selectedTagIds.has(t.id)).map(t => (
                                    <div key={t.id} className="relative inline-flex items-center">
                                      <button
                                        type="button"
                                        onClick={() => addTagToPost(t.id)}
                                        className="inline-flex items-center gap-1 h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-white/60 dark:bg-cat-frappe-surface0/60 hover:bg-white dark:hover:bg-cat-frappe-surface0 transition-colors"
                                        style={{ color: t.color_text || '#303446' }}
                                        title={`Add #${t.name} to this post`}
                                      >
                                        #{t.name}
                                        <span className="text-[10px]">+</span>
                                      </button>
                                      {isEditingTags && (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); requestDeleteTag(t); }}
                                          className="ml-1 inline-flex items-center justify-center h-7 w-7 rounded-full border border-cat-frappe-red bg-cat-frappe-red text-white hover:opacity-90"
                                          title="Delete tag globally"
                                        >
                                          <IconTrash size={14} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  {availableTags.filter(t => !selectedTagIds.has(t.id)).length === 0 && (
                                    <span className="text-xs text-cat-frappe-subtext0 italic">All tags selected</span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-1 gap-2">
                                <div>
                                  <label className="block text-xs mb-1">New tag name</label>
                                  <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="w-full px-3 py-2 text-sm border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0" />
                                </div>
                                <div>
                                  <label className="block text-xs mb-1">Color preset</label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cat-frappe-surface1 bg-[#F6EEE5] dark:bg-cat-frappe-base text-sm"
                                      >
                                        <span className="inline-block w-4 h-4 rounded-full border" style={{ backgroundColor: newTagBg, borderColor: `${newTagFg}22` }} />
                                        {TAG_COLOR_PRESETS[selectedPreset]?.name || 'Choose color'}
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                      <DropdownMenuLabel>Theme presets</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuGroup>
                                        {TAG_COLOR_PRESETS.map((p, idx) => (
                                          <DropdownMenuItem
                                            key={p.name}
                                            onClick={() => { setSelectedPreset(idx); setNewTagBg(p.bg); setNewTagFg(p.text); }}
                                          >
                                            <span className="inline-block w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: p.bg, borderColor: `${p.text}22` }} />
                                            <span className="flex-1">{p.name}</span>
                                            <span className="text-[10px] opacity-60">{p.bg}</span>
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuGroup>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>Custom</DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent className="w-64 p-2">
                                          <div className="space-y-2">
                                            <div>
                                              <label className="block text-xs mb-1">Background</label>
                                              <input type="text" value={newTagBg} onChange={(e) => setNewTagBg(e.target.value)} className="w-full px-2 py-1 border rounded text-xs bg-white/80 dark:bg-cat-frappe-base" placeholder="#hex" />
                                            </div>
                                            <div>
                                              <label className="block text-xs mb-1">Text</label>
                                              <input type="text" value={newTagFg} onChange={(e) => setNewTagFg(e.target.value)} className="w-full px-2 py-1 border rounded text-xs bg-white/80 dark:bg-cat-frappe-base" placeholder="#hex" />
                                            </div>
                                          </div>
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="sm:col-span-4">
                                  <button type="button" onClick={handleCreateTag} className="mt-1 px-3 py-1.5 rounded-md border border-cat-frappe-surface1 bg-white/60 dark:bg-cat-frappe-surface0 text-sm">
                                    Create tag
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <button type="button" className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 px-3 py-1.5 rounded-md">Close</button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <Separator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />
                  <ScrollArea className="h-full px-4 sm:px-6 py-4">
                    {/* Title & Description moved into Settings dialog */}
                    {/* Editor */}
                    <div className="mb-6">
                      <label htmlFor="content" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Content</label>
                      <TipTapEditor
                        value={content}
                        minHeightClass="min-h-[55vh]"
                        onChange={handleEditorChange}
                        onRequestUpload={async (file) => {
                          const result = await uploadInChunks(file, (progress) => {
                            setUploadProgress(prev => ({ ...prev, [file.name]: Math.round(progress) }));
                          });
                          if (result?.success) {
                            const entry = { name: file.name, url: result.url, type: file.type, id: result.id, token: result.token };
                            setUploadedImages(prev => [...prev, entry]);
                            return entry;
                          }
                          throw new Error('Upload failed');
                        }}
                      />
                    </div>
                    {/* Settings moved to Settings dialog */}
                    {uploadedImages.length > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-cat-frappe-base dark:text-cat-frappe-yellow">Uploaded Files</h3>
                          <button
                            type="button"
                            onClick={() => setUploadedImages([])}
                            className="text-sm text-cat-frappe-red hover:text-cat-frappe-peach transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {uploadedImages.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-[16/14] w-full rounded-lg overflow-hidden bg-[#eff1f5] dark:bg-cat-frappe-surface0">
                                {loadingFiles.has(file.name) ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="animate-pulse">Loading...</span>
                                  </div>
                                ) : file.type.startsWith('video/') ? (
                                  <video
                                    className="w-full h-full object-cover"
                                    controls
                                    preload="metadata"
                                    playsInline
                                    src={`/api/files?id=${file.id}`}
                                  />
                                ) : (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 py-2 px-[5%]">
                                    <button
                                      type="button"
                                      onClick={() => insertFileIntoContent(file.url, file.type, file.id)}
                                      className="w-[80%] max-w-[100px] min-w-[60px] bg-cat-frappe-yellow text-cat-frappe-base px-1 py-0.5 rounded text-xs font-medium hover:bg-cat-frappe-peach transition-colors"
                                    >
                                      Insert
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                                      className="w-[80%] max-w-[100px] min-w-[60px] bg-cat-frappe-red text-white px-1 py-0.5 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Document settings moved into Settings dialog */}
                  </ScrollArea>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-cat-frappe-surface1" />

              {/* Preview panel */}
              <ResizablePanel defaultSize={35} minSize={30}>
                <div className="h-full rounded-lg bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-lg flex flex-col">
                  <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-yellow">Preview</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${previewDevice === 'desktop' ? 'bg-cat-frappe-yellow text-cat-frappe-base border-cat-frappe-yellow' : 'bg-transparent text-cat-frappe-base dark:text-cat-frappe-subtext0 border-cat-frappe-surface1 dark:border-cat-frappe-surface0'}`}
                      >Desktop</button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('tablet')}
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${previewDevice === 'tablet' ? 'bg-cat-frappe-yellow text-cat-frappe-base border-cat-frappe-yellow' : 'bg-transparent text-cat-frappe-base dark:text-cat-frappe-subtext0 border-cat-frappe-surface1 dark:border-cat-frappe-surface0'}`}
                      >Tablet</button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${previewDevice === 'mobile' ? 'bg-cat-frappe-yellow text-cat-frappe-base border-cat-frappe-yellow' : 'bg-transparent text-cat-frappe-base dark:text-cat-frappe-subtext0 border-cat-frappe-surface1 dark:border-cat-frappe-surface0'}`}
                      >Mobile</button>
                    </div>
                  </div>
                  <Separator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />
                  <ScrollArea className="h-full px-4 sm:px-6 py-6">
                    <div className="mx-auto">
                      <div className={`${previewDevice === 'desktop' ? 'w-[1200px]' : previewDevice === 'tablet' ? 'w-[768px]' : 'w-[390px]'} mx-auto border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 rounded-xl bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-md overflow-hidden`}>
                        {heroImageUrl && (
                          <div className="w-full">
                            <div className="relative w-full h-[28vh] sm:h-[36vh] lg:h-[44vh] overflow-hidden">
                              <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}
                        <div className="px-4 sm:px-6 py-6">
                          <header className="mb-4">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-cat-frappe-base dark:text-cat-frappe-yellow tracking-tight">{title || 'Preview Title'}</h1>
                            {dek && (
                              <p className="text-lg md:text-xl mt-3 text-[#4c4f69] dark:text-cat-frappe-subtext0">{dek}</p>
                            )}
                            <div className="mt-4 text-sm text-[#4c4f69] dark:text-cat-frappe-subtext0 flex flex-wrap gap-3">
                              <span>{new Date().toLocaleDateString()}</span>
                              {content ? <span>• {estimateReadingTime(content)} min read</span> : null}
                            </div>
                          </header>
                          <section className="mt-6">
                            <div className="prose dark:prose-invert text-base max-w-none">
                              {renderPreview()}
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Mobile/Tablet: Tabs view */}
          <div className="xl:hidden mt-6">
            <div className="rounded-lg p-4 lg:p-6 bg-[#f8e8e0] dark:bg-cat-frappe-base shadow-lg">
              {/* Mobile/Tablet visible Settings button */}
              <div className="flex justify-end mb-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 px-3 py-1.5 rounded-md text-cat-frappe-base dark:text-cat-frappe-text hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50"
                    >
                      Settings
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-[#F6EEE5] dark:bg-cat-frappe-base text-cat-frappe-base dark:text-cat-frappe-text overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Post Settings</DialogTitle>
                      <DialogDescription>Configure metadata and presentation for this article.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2 pr-1 pb-4">
                      <div>
                        <label className="block text-sm mb-1">Title</label>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Summary</label>
                        <textarea
                          value={dek || description}
                          onChange={(e) => { setDek(e.target.value); setDescription(e.target.value); }}
                          rows={3}
                          className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Slug</label>
                        <input
                          value={slug || (title ? title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '')}
                          onChange={() => { }}
                          disabled
                          className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-cat-frappe-surface1/50 dark:bg-cat-frappe-surface0/50 text-cat-frappe-base dark:text-cat-frappe-text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Hero Image</label>
                        <FileUpload onChange={(files) => { const file = files?.[0]; if (file) handleHeroImageFile(file); }} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm mb-1">SEO Title</label>
                          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0" />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">SEO Description</label>
                          <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0" />
                        </div>
                        <div className="max-w-full">
                          <label className="block text-sm mb-1">SEO Keywords</label>
                          <input
                            value={seoKeywords}
                            onChange={(e) => { setSeoAutoKeywords(false); setSeoKeywords(e.target.value) }}
                            placeholder="auto-generated unless overridden"
                            className="flex-1 min-w-0 px-3 py-2 text-base border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0"
                            disabled={seoAutoKeywords}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={isSpanTwo} onChange={() => setIsSpanTwo(!isSpanTwo)} className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-cat-frappe-overlay2/30 rounded-full peer dark:bg-cat-frappe-surface0 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cat-frappe-yellow"></div>
                          <span className="ml-3 text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-text">Span Two Columns</span>
                        </label>
                        <div className="text-xs text-cat-frappe-subtext0">Table of contents is disabled globally for posts.</div>
                      </div>
                      {/* Tags selection + creation (mobile/tablet) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-semibold">Tags</label>
                          <button
                            type="button"
                            onClick={() => setIsEditingTags(v => !v)}
                            className="text-xs rounded-full border px-2 py-1 bg-white/60 dark:bg-cat-frappe-surface0 border-cat-frappe-surface1 dark:border-cat-frappe-surface0"
                          >
                            {isEditingTags ? '✓ Done editing' : '⚙️ Manage all tags'}
                          </button>
                        </div>

                        {/* Selected tags for this post */}
                        <div className="mb-3">
                          <div className="text-xs text-cat-frappe-subtext0 mb-1">Selected for this post:</div>
                          <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded-md border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-white/40 dark:bg-cat-frappe-mantle/40">
                            {selectedTagIds.size === 0 ? (
                              <span className="text-xs text-cat-frappe-subtext0 italic">No tags selected</span>
                            ) : (
                              Array.from(selectedTagIds).map(id => {
                                const tag = availableTags.find(t => t.id === id);
                                if (!tag) return null;
                                return (
                                  <div key={id} className="relative inline-flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => removeTagFromPost(id)}
                                      className="inline-flex items-center gap-1 h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border hover:opacity-80 transition-opacity"
                                      style={{ backgroundColor: tag.color_bg || '#ef9f76', color: tag.color_text || '#303446', borderColor: `${(tag.color_text || '#303446')}22` }}
                                      title={`Remove #${tag.name} from this post`}
                                    >
                                      #{tag.name}
                                      <span className="ml-1 text-[10px]">✕</span>
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Available tags to add */}
                        <div className="mb-3">
                          <div className="text-xs text-cat-frappe-subtext0 mb-1">Available tags (click to add):</div>
                          <div className="flex flex-wrap gap-2">
                            {availableTags.filter(t => !selectedTagIds.has(t.id)).map(t => (
                              <div key={t.id} className="relative inline-flex items-center">
                                <button
                                  type="button"
                                  onClick={() => addTagToPost(t.id)}
                                  className="inline-flex items-center gap-1 h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-white/60 dark:bg-cat-frappe-surface0/60 hover:bg-white dark:hover:bg-cat-frappe-surface0 transition-colors"
                                  style={{ color: t.color_text || '#303446' }}
                                  title={`Add #${t.name} to this post`}
                                >
                                  #{t.name}
                                  <span className="text-[10px]">+</span>
                                </button>
                                {isEditingTags && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); requestDeleteTag(t); }}
                                    className="ml-1 inline-flex items-center justify-center h-7 w-7 rounded-full border border-cat-frappe-red bg-cat-frappe-red text-white hover:opacity-90"
                                    title="Delete tag globally"
                                  >
                                    <IconTrash size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {availableTags.filter(t => !selectedTagIds.has(t.id)).length === 0 && (
                              <span className="text-xs text-cat-frappe-subtext0 italic">All tags selected</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs mb-1">New tag name</label>
                            <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="w-full px-3 py-2 text-sm border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0" />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Color preset</label>
                            <div className="flex flex-wrap gap-2">
                              {TAG_COLOR_PRESETS.map((p, idx) => (
                                <button
                                  key={p.name}
                                  type="button"
                                  onClick={() => { setSelectedPreset(idx); setNewTagBg(p.bg); setNewTagFg(p.text); }}
                                  className={`h-8 px-3 rounded-full border text-xs font-semibold ${selectedPreset === idx ? 'ring-2 ring-cat-frappe-yellow' : ''}`}
                                  style={{ backgroundColor: p.bg, color: p.text, borderColor: `${p.text}22` }}
                                  title={p.name}
                                >
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <button type="button" onClick={handleCreateTag} className="mt-1 px-3 py-1.5 rounded-md border border-cat-frappe-surface1 bg-white/60 dark:bg-cat-frappe-surface0 text-sm">
                              Create tag
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <button type="button" className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 px-3 py-1.5 rounded-md">Close</button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="edit">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  {/* Reuse the editor stack for mobile; Summary merged */}
                  <div className="mb-4">
                    <label className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Summary</label>
                    <textarea
                      value={dek || description}
                      onChange={(e) => { setDek(e.target.value); setDescription(e.target.value); }}
                      className="w-full px-4 py-3 text-base border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#F6EEE5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Hero Image URL</label>
                    <input
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 text-base border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="content-m" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Content</label>
                    <TipTapEditor
                      value={content}
                      onChange={handleEditorChange}
                      onRequestUpload={async (file) => {
                        const result = await uploadInChunks(file, (progress) => {
                          setUploadProgress(prev => ({ ...prev, [file.name]: Math.round(progress) }));
                        });
                        if (result?.success) {
                          const entry = { name: file.name, url: result.url, type: file.type, id: result.id, token: result.token };
                          setUploadedImages(prev => [...prev, entry]);
                          return entry;
                        }
                        throw new Error('Upload failed');
                      }}
                    />
                  </div>
                  {/* Document settings moved into Settings dialog */}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="rounded-lg overflow-hidden bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-lg">
                    {heroImageUrl && (
                      <div className="w-full">
                        <div className="relative w-full h-[28vh] sm:h-[36vh] lg:h-[44vh] overflow-hidden">
                          <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    <div className="px-4 sm:px-6 py-6">
                      <header className="mb-4">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-cat-frappe-base dark:text-cat-frappe-yellow tracking-tight">{title || 'Preview Title'}</h1>
                        {dek && (
                          <p className="text-lg md:text-xl mt-3 text-[#4c4f69] dark:text-cat-frappe-subtext0">{dek}</p>
                        )}
                        <div className="mt-4 text-sm text-[#4c4f69] dark:text-cat-frappe-subtext0 flex flex-wrap gap-3">
                          <span>{new Date().toLocaleDateString()}</span>
                          {content ? <span>• {estimateReadingTime(content)} min read</span> : null}
                        </div>
                      </header>
                      <section className="mt-6">
                        <div className="prose dark:prose-invert text-base max-w-3xl lg:max-w-4xl mx-auto">
                          {renderPreview()}
                        </div>
                      </section>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Notifications />
      <UploadProgress />
      <ConfirmationDialog
        isOpen={isDeleteTagDialogOpen}
        onClose={() => setIsDeleteTagDialogOpen(false)}
        onConfirm={confirmDeleteTag}
        message={`Delete tag "${tagToDelete?.name ?? ''}"? This will remove it from ${tagToDelete?.postCount ?? 0} post(s) and cannot be undone.`}
      />
      {/* Floating Publish FAB */}
      <button
        type="button"
        onClick={handleSubmit}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full px-5 py-3 shadow-xl bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust hover:shadow-2xl transition-all"
        aria-label="Publish"
      >
        <IconSend size={18} />
        Publish
      </button>
      <Footer />
    </>
  );
}
