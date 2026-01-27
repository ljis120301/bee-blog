"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const [isAuthor, setIsAuthor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [seoAutoKeywords, setSeoAutoKeywords] = useState(true);
  const [postData, setPostData] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [newTagName, setNewTagName] = useState('');
  const [newTagBg, setNewTagBg] = useState('#ef9f76');
  const [newTagFg, setNewTagFg] = useState('#303446');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [isEditingTags, setIsEditingTags] = useState(false);
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

  const { user: authUser, isAdmin: isAdminRole, isAuthor: isAuthorRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (isAdminRole || isAuthorRole) {
        setIsAuthor(true);
        // Fetch the existing post data only after markdown parser is ready
        if (mdParser) {
          fetchPostData();
        }
      } else {
        router.push('/auth');
      }
    }
  }, [router, params.id, mdParser, authLoading, isAdminRole, isAuthorRole]);

  // Convert markdown to HTML using the same logic as individual blog post display
  const convertContentForEditor = (content) => {
    if (!content || !mdParser) return content;

    // Same detection logic as app/blogposts/[id]/page.js
    const looksLikeHtml = typeof content === 'string' && /<\w+[^>]*>/.test(content);
    const htmlContent = looksLikeHtml && !content.trim().startsWith('#')
      ? content
      : mdParser.render(content);

    console.log('Content conversion:', {
      original: content.substring(0, 100) + '...',
      isHtml: looksLikeHtml,
      startsWithHash: content.trim().startsWith('#'),
      converted: htmlContent.substring(0, 100) + '...'
    });

    return htmlContent;
  };

  const fetchPostData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/posts/${params.id}`);
      const data = await res.json();

      if (!data.success) {
        router.push('/');
        return;
      }

      const record = data.post;
      setPostData(record);

      // Convert markdown content to HTML if needed (using same logic as blog post display)
      const convertedContent = convertContentForEditor(record.content || '');

      // Populate form fields with existing data
      setTitle(record.title || '');
      setContent(convertedContent);
      setDescription(record.description || '');
      setDek(record.dek || '');
      setSlug(record.slug || '');
      setHeroImageUrl(record.heroImageUrl || '');
      setSeoTitle(record.seoTitle || '');
      setSeoDescription(record.seoDescription || '');
      setSeoKeywords(Array.isArray(record.seoKeywords) ? record.seoKeywords.join(', ') : '');
      setIsSpanTwo(record.isSpanTwo || false);
      setUploadedImages(record.media || record.images || []);
      // selected tags from record
      const tagIds = Array.isArray(record.tags) ? record.tags.map(t => t.id) : [];
      setSelectedTagIds(new Set(tagIds));

      console.log('Original content:', record.content);
      console.log('Converted content for editor:', convertedContent);
      console.log('Content length:', convertedContent?.length);

    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/'); // Redirect if post not found or unauthorized
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeMdParser = () => {
      const mdInstance = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
      })
        .use(sub)
        .use(sup)
        .use(ins)
        .use(mark)
        .use(taskLists);

      mdInstance.enable('heading');
      setMdParser(mdInstance);
    };

    initializeMdParser();
  }, []);

  // Load all tags for selection via API
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
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: 'Tag name cannot be empty',
        type: 'error'
      }]);
      return;
    }

    // Check if tag already exists
    const existing = availableTags.find(t => t.name.toLowerCase() === name);
    if (existing) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `Tag "${name}" already exists. Adding to post.`,
        type: 'info'
      }]);
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
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: `Created and added "${name}" tag`,
          type: 'success'
        }]);
      } else {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: data.error || 'Failed to create tag',
          type: 'error'
        }]);
      }
    } catch (e) {
      console.error('Tag create failed:', e);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: 'Failed to create tag',
        type: 'error'
      }]);
    }
  };

  const requestDeleteTag = async (tag) => {
    // Simplified - just show the dialog
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

        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: 'Tag deleted successfully',
          type: 'success'
        }]);
      } else {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: data.error || 'Failed to delete tag',
          type: 'error'
        }]);
      }
    } catch (e) {
      console.error('Delete tag failed:', e);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: 'Failed to delete tag',
        type: 'error'
      }]);
    } finally {
      setIsDeleteTagDialogOpen(false);
      setTagToDelete(null);
    }
  };

  const estimateReadingTime = (content) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0);
    return Math.max(1, Math.round(words.length / 200));
  };

  const handleUpdate = async (e) => {
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

      console.log('Updating post with data:', data);
      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        // Revalidate the cache to show updated tags immediately
        await revalidatePostsPage();
        router.push(`/blogposts/${result.post.id}`);
      } else {
        console.error('Error updating post:', result.error);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: result.error || 'Failed to update post',
          type: 'error'
        }]);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleFileUploads = async (files) => {
    const uploads = Array.from(files).map(async (file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setLoadingFiles(prev => new Set([...prev, fileId]));
      setActiveUploads(prev => new Set([...prev, fileId]));

      try {
        console.log('Starting upload for file:', file.name);
        const url = await uploadInChunks(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        });

        console.log('Upload completed, URL:', url);

        const newItem = {
          url: url,
          filename: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: file.size
        };

        setUploadedImages(prev => [...prev, newItem]);

        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: `${file.name} uploaded successfully!`,
          type: 'success'
        }]);

      } catch (error) {
        console.error('Upload failed:', error);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: `Failed to upload ${file.name}: ${error.message}`,
          type: 'error'
        }]);
      } finally {
        setLoadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        setActiveUploads(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    });

    await Promise.all(uploads);
  };

  const renderPreview = () => {
    if (!mdParser || !content) return <div className="text-cat-frappe-subtext0">No content to preview</div>;

    const deviceClasses = {
      desktop: 'max-w-full',
      tablet: 'max-w-2xl mx-auto',
      mobile: 'max-w-sm mx-auto'
    };

    return (
      <div className={`bg-[#eff1f5] dark:bg-cat-frappe-mantle min-h-full ${deviceClasses[previewDevice]}`}>
        <article className="p-6">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-cat-frappe-base dark:text-cat-frappe-text">{title}</h1>
            {dek && <p className="text-lg text-cat-frappe-overlay1 dark:text-cat-frappe-subtext0 mb-4">{dek}</p>}
            {heroImageUrl && (
              <div className="mb-6">
                <img src={heroImageUrl} alt="Hero" className="w-full h-64 object-cover rounded-lg" />
              </div>
            )}
          </header>
          <div
            className="prose prose-lg max-w-none dark:prose-invert text-cat-frappe-base dark:text-cat-frappe-text"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
        <ScrollProgressBar />
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthor) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <ScrollProgressBar />
      <Header />
      {/* 
        Main background uses Catppuccin Frappé colors:
        - Light mode: #F6EEE5 (warm beige)
        - Dark mode: cat-frappe-mantle (dark warm gray)
        These match the author portal page design perfectly
      */}
      <main className="pt-[calc(64px+8px)] min-h-screen bg-[#F6EEE5] dark:bg-cat-frappe-mantle">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-cat-frappe-base dark:text-cat-frappe-yellow">
                Edit Post: {title}
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-6 py-3 bg-cat-frappe-yellow hover:bg-cat-frappe-peach text-cat-frappe-base rounded-lg font-semibold transition-colors shadow-lg border border-cat-frappe-surface1 dark:border-cat-frappe-surface0"
                >
                  <IconSend size={20} />
                  Update Post
                </button>
              </div>
            </div>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-0">
                <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-200px)] rounded-lg border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-lg">
                  <ResizablePanel defaultSize={70} minSize={50}>
                    <div className="h-full p-6 bg-[#F6EEE5] dark:bg-cat-frappe-base">
                      <div className="space-y-6">
                        {/* Basic Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">Title</label>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full p-3 border border-cat-frappe-surface1 rounded-lg bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                              placeholder="Enter post title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">Slug (URL)</label>
                            <input
                              type="text"
                              value={slug}
                              onChange={(e) => setSlug(e.target.value)}
                              className="w-full p-3 border border-cat-frappe-surface1 rounded-lg bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                              placeholder="Auto-generated from title"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">Description</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-cat-frappe-surface1 rounded-lg bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                            rows="3"
                            placeholder="Brief description of the post"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">Dek (Subtitle)</label>
                          <input
                            type="text"
                            value={dek}
                            onChange={(e) => setDek(e.target.value)}
                            className="w-full p-3 border border-cat-frappe-surface1 rounded-lg bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                            placeholder="Optional subtitle or summary"
                          />
                        </div>

                        {/* Content Editor */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">Content</label>
                          <div className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 rounded-lg overflow-hidden">
                            {postData && mdParser ? (
                              <TipTapEditor
                                key={params.id} // Force re-render when editing different posts
                                value={content}
                                onChange={(newContent) => setContent(newContent)}
                                minHeightClass="min-h-[400px]"
                                onRequestUpload={async (file) => {
                                  try {
                                    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                    setLoadingFiles(prev => new Set([...prev, fileId]));

                                    const url = await uploadInChunks(file, (progress) => {
                                      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
                                    });

                                    const newItem = {
                                      url: url,
                                      filename: file.name,
                                      type: file.type.startsWith('image/') ? 'image' : 'video',
                                      size: file.size
                                    };

                                    setUploadedImages(prev => [...prev, newItem]);
                                    setLoadingFiles(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(fileId);
                                      return newSet;
                                    });

                                    return { url: url, type: file.type };
                                  } catch (error) {
                                    console.error('Upload failed:', error);
                                    throw error;
                                  }
                                }}
                                placeholder="Write your post content..."
                              />
                            ) : (
                              <div className="flex items-center justify-center h-64 bg-[#eff1f5] dark:bg-cat-frappe-surface0 rounded">
                                <p className="text-cat-frappe-subtext0">Loading editor...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />

                  <ResizablePanel defaultSize={30} minSize={25}>
                    <div className="h-full bg-[#F6EEE5] dark:bg-cat-frappe-base">
                      <ScrollArea className="h-full">
                        <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">Settings</h3>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">Hero Image URL</label>
                                <input
                                  type="url"
                                  value={heroImageUrl}
                                  onChange={(e) => setHeroImageUrl(e.target.value)}
                                  className="w-full p-2 border border-cat-frappe-surface1 rounded bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text text-sm"
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSpanTwo}
                                  onChange={(e) => setIsSpanTwo(e.target.checked)}
                                  className="rounded accent-cat-frappe-yellow"
                                />
                                <label className="text-sm text-cat-frappe-base dark:text-cat-frappe-text">Span Two Columns</label>
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />

                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">SEO Settings</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">SEO Title</label>
                                <input
                                  type="text"
                                  value={seoTitle}
                                  onChange={(e) => setSeoTitle(e.target.value)}
                                  className="w-full p-2 border border-cat-frappe-surface1 rounded bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text text-sm"
                                  placeholder="Defaults to post title"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">SEO Description</label>
                                <textarea
                                  value={seoDescription}
                                  onChange={(e) => setSeoDescription(e.target.value)}
                                  className="w-full p-2 border border-cat-frappe-surface1 rounded bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text text-sm"
                                  rows="3"
                                  placeholder="Defaults to post description"
                                />
                              </div>

                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={seoAutoKeywords}
                                    onChange={(e) => setSeoAutoKeywords(e.target.checked)}
                                    className="rounded accent-cat-frappe-yellow"
                                  />
                                  <label className="text-sm text-cat-frappe-base dark:text-cat-frappe-text">Auto-generate keywords</label>
                                </div>
                                {!seoAutoKeywords && (
                                  <input
                                    type="text"
                                    value={seoKeywords}
                                    onChange={(e) => setSeoKeywords(e.target.value)}
                                    className="w-full p-2 border border-cat-frappe-surface1 rounded bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text text-sm"
                                    placeholder="keyword1, keyword2, keyword3"
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow">Tags</h3>
                              <button
                                type="button"
                                onClick={() => setIsEditingTags(v => !v)}
                                className="text-xs rounded-full border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 px-2 py-1 bg-white/60 dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                              >
                                {isEditingTags ? '✓ Done editing' : '⚙️ Manage all tags'}
                              </button>
                            </div>

                            {/* Selected tags for this post */}
                            <div className="mb-3">
                              <div className="text-xs text-cat-frappe-subtext0 mb-1">Currently tagged:</div>
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
                              <div className="text-xs text-cat-frappe-subtext0 mb-1">Add more tags:</div>
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
                                <label className="block text-xs mb-1 text-cat-frappe-base dark:text-cat-frappe-text">New tag name</label>
                                <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="w-full px-3 py-2 text-sm border border-cat-frappe-surface1 rounded-md bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text" />
                              </div>
                              <div>
                                <label className="block text-xs mb-1 text-cat-frappe-base dark:text-cat-frappe-text">Color preset</label>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cat-frappe-surface1 bg-[#F6EEE5] dark:bg-cat-frappe-base text-sm text-cat-frappe-base dark:text-cat-frappe-text"
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
                                        <DropdownMenuItem key={p.name} onClick={() => { setSelectedPreset(idx); setNewTagBg(p.bg); setNewTagFg(p.text); }}>
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
                              <div>
                                <button type="button" onClick={handleCreateTag} className="mt-1 px-3 py-1.5 rounded-md border border-cat-frappe-surface1 bg-white/60 dark:bg-cat-frappe-surface0 text-sm text-cat-frappe-base dark:text-cat-frappe-text">
                                  Create tag
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">File Upload</h3>
                            <FileUpload onChange={handleFileUploads} />

                            {uploadedImages.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2 text-cat-frappe-base dark:text-cat-frappe-text">Uploaded Files</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {uploadedImages.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-white/60 dark:bg-cat-frappe-surface0 rounded text-xs text-cat-frappe-base dark:text-cat-frappe-text border border-cat-frappe-surface1 dark:border-cat-frappe-surface0">
                                      <span className="truncate flex-1">{item.filename}</span>
                                      <button
                                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                                        className="text-cat-frappe-red hover:text-cat-frappe-peach transition-colors"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>

              <TabsContent value="preview" className="space-y-0">
                <div className="min-h-[calc(100vh-200px)] bg-[#F6EEE5] dark:bg-cat-frappe-base rounded-lg border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 shadow-lg">
                  <div className="p-6 border-b border-cat-frappe-surface1 dark:border-cat-frappe-surface0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow">Preview</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-cat-frappe-base dark:text-cat-frappe-subtext0">Device:</span>
                        <select
                          value={previewDevice}
                          onChange={(e) => setPreviewDevice(e.target.value)}
                          className="text-sm border border-cat-frappe-surface1 rounded px-2 py-1 bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                        >
                          <option value="desktop">Desktop</option>
                          <option value="tablet">Tablet</option>
                          <option value="mobile">Mobile</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    {renderPreview()}
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {notifications.slice(-3).map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-2 rounded-lg shadow-lg border ${notification.type === 'error'
                  ? 'bg-cat-frappe-red/90 dark:bg-cat-frappe-red text-white border-cat-frappe-red'
                  : notification.type === 'success'
                    ? 'bg-[#a6d189]/90 dark:bg-[#a6d189] text-cat-frappe-base dark:text-[#303446] border-[#a6d189]' // Catppuccin Frappé Green
                    : notification.type === 'info'
                      ? 'bg-cat-frappe-blue/90 dark:bg-cat-frappe-blue text-white border-cat-frappe-blue'
                      : 'bg-cat-frappe-yellow/90 dark:bg-cat-frappe-yellow text-cat-frappe-base dark:text-[#303446] border-cat-frappe-yellow'
                  }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </main>
      <ConfirmationDialog
        isOpen={isDeleteTagDialogOpen}
        onClose={() => setIsDeleteTagDialogOpen(false)}
        onConfirm={confirmDeleteTag}
        message={`Delete tag "${tagToDelete?.name ?? ''}"? This will remove it from ${tagToDelete?.postCount ?? 0} post(s) and cannot be undone.`}
      />
      <Footer />
    </>
  );
}
