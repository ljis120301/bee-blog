"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ScrollProgressBar from "../../../components/ScrollProgressBar";
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import { uploadInChunks } from '@/lib/chunkUpload';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { IconSettings, IconSend } from "@tabler/icons-react";
import { FileUpload } from "@/components/ui/file-upload";

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

  useEffect(() => {
    const checkAuthorStatus = async () => {
      if (pb.authStore.isValid) {
        const user = pb.authStore.model;
        if (user.role === "admin" || user.role === "author") {
          setIsAuthor(true);
          // Fetch the existing post data only after markdown parser is ready
          if (mdParser) {
            await fetchPostData();
          }
        } else {
          router.push('/auth');
        }
      } else {
        router.push('/auth');
      }
    };
    checkAuthorStatus();
  }, [router, params.id, mdParser]); // Added mdParser dependency

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
      const record = await pb.collection('posts').getOne(params.id);
      setPostData(record);
      
      // Convert markdown content to HTML if needed (using same logic as blog post display)
      const convertedContent = convertContentForEditor(record.content || '');
      
      // Populate form fields with existing data
      setTitle(record.title || '');
      setContent(convertedContent);
      setDescription(record.description || '');
      setDek(record.dek || '');
      setSlug(record.slug || '');
      setHeroImageUrl(record.hero_image_url || '');
      setSeoTitle(record.seo_title || '');
      setSeoDescription(record.seo_description || '');
      setSeoKeywords(Array.isArray(record.seo_keywords) ? record.seo_keywords.join(', ') : '');
      setIsSpanTwo(record.isSpanTwo || false);
      setUploadedImages(record.media || record.images || []);
      
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
        const user = (userKeywords ? userKeywords.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean) : []);
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
        slug: (slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')),
        hero_image_url: heroImageUrl || null,
        seo_title: seoTitle || title,
        seo_description: seoDescription || description,
        seo_keywords: defaultSeoKeywords(seoTitle || title, seoDescription || description, seoAutoKeywords ? '' : seoKeywords),
        toc_enabled: false,
        reading_time_minutes: estimateReadingTime(content)
      };

      console.log('Updating post with data:', data);
      const record = await pb.collection('posts').update(params.id, data);
      router.push(`/blogposts/${record.id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      if (error.data) {
        console.error('Validation errors:', error.data);
      }
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
    if (!mdParser || !content) return <div>No content to preview</div>;
    
    const deviceClasses = {
      desktop: 'max-w-full',
      tablet: 'max-w-2xl mx-auto',
      mobile: 'max-w-sm mx-auto'
    };

    return (
      <div className={`bg-white dark:bg-gray-900 min-h-full ${deviceClasses[previewDevice]}`}>
        <article className="p-6">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
            {dek && <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{dek}</p>}
            {heroImageUrl && (
              <div className="mb-6">
                <img src={heroImageUrl} alt="Hero" className="w-full h-64 object-cover rounded-lg" />
              </div>
            )}
          </header>
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
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
      <main className="pt-[calc(64px+8px)] min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Edit Post: {title}
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
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
                <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-200px)] rounded-lg border bg-white dark:bg-gray-800">
                  <ResizablePanel defaultSize={70} minSize={50}>
                    <div className="h-full p-6">
                      <div className="space-y-6">
                        {/* Basic Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                              placeholder="Enter post title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                            <input
                              type="text"
                              value={slug}
                              onChange={(e) => setSlug(e.target.value)}
                              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                              placeholder="Auto-generated from title"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            rows="3"
                            placeholder="Brief description of the post"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Dek (Subtitle)</label>
                          <input
                            type="text"
                            value={dek}
                            onChange={(e) => setDek(e.target.value)}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Optional subtitle or summary"
                          />
                        </div>

                        {/* Content Editor */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Content</label>
                          <div className="border rounded-lg overflow-hidden dark:border-gray-600">
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
                              <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded">
                                <p className="text-gray-500">Loading editor...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel defaultSize={30} minSize={25}>
                    <div className="h-full bg-gray-50 dark:bg-gray-900">
                      <ScrollArea className="h-full">
                        <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Settings</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                                <input
                                  type="url"
                                  value={heroImageUrl}
                                  onChange={(e) => setHeroImageUrl(e.target.value)}
                                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSpanTwo}
                                  onChange={(e) => setIsSpanTwo(e.target.checked)}
                                  className="rounded"
                                />
                                <label className="text-sm">Span Two Columns</label>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">SEO Title</label>
                                <input
                                  type="text"
                                  value={seoTitle}
                                  onChange={(e) => setSeoTitle(e.target.value)}
                                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                                  placeholder="Defaults to post title"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">SEO Description</label>
                                <textarea
                                  value={seoDescription}
                                  onChange={(e) => setSeoDescription(e.target.value)}
                                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
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
                                    className="rounded"
                                  />
                                  <label className="text-sm">Auto-generate keywords</label>
                                </div>
                                {!seoAutoKeywords && (
                                  <input
                                    type="text"
                                    value={seoKeywords}
                                    onChange={(e) => setSeoKeywords(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                                    placeholder="keyword1, keyword2, keyword3"
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="text-lg font-semibold mb-4">File Upload</h3>
                            <FileUpload onChange={handleFileUploads} />
                            
                            {uploadedImages.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {uploadedImages.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                      <span className="truncate flex-1">{item.filename}</span>
                                      <button
                                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                                        className="text-red-500 hover:text-red-700"
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
                <div className="min-h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Preview</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Device:</span>
                        <select
                          value={previewDevice}
                          onChange={(e) => setPreviewDevice(e.target.value)}
                          className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
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
                className={`px-4 py-2 rounded-lg shadow-lg ${
                  notification.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
