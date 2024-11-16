"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";
import { FileUpload } from "@/components/ui/file-upload";
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import CodeSnippet from "../../components/CodeSnippet";
import { useDebouncedCallback } from 'use-debounce';
import { revalidatePath } from 'next/cache';
import { uploadInChunks } from '@/lib/chunkUpload';
import LoadingSpinner from '../../components/LoadingSpinner';


const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function AuthorPortal() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isSpanTwo, setIsSpanTwo] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mdParser, setMdParser] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [activeUploads, setActiveUploads] = useState(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(new Set());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log('Auth status:', pb.authStore.isValid);
    console.log('Auth model:', pb.authStore.model);
    const checkAdminStatus = async () => {
      if (pb.authStore.isValid) {
        const user = pb.authStore.model;
        if (user.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push('/auth');
        }
      } else {
        router.push('/auth');
      }
    };
    checkAdminStatus();
  }, [router]);

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

  const handleEditorChange = ({ text }) => {
    setContent(text);
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

        const result = await uploadInChunks(pb, file, (progress) => {
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
            id: result.id
          });
          
          // Immediately update UI after successful upload
          setUploadedImages(prev => [...prev, {
            name: file.name,
            url: result.url,
            type: file.type,
            id: result.id
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
    const editor = document.querySelector('.rc-md-editor textarea');
    if (!editor) {
      console.error('Editor not found');
      return;
    }

    if (fileType?.startsWith('video/')) {
      console.log('Generating video markdown for file:', fileId);
      
      try {
        // Generate a fresh token for the file
        const token = await pb.files.getToken();
        
        // Create record object for getUrl
        const record = {
          id: fileId,
          collectionId: '4bz5g6gp5umym7d',
          file: fileUrl.split('/').pop().split('?')[0] // Get clean filename without query params
        };
        
        // Generate clean URL with single token
        const directUrl = pb.files.getUrl(record, record.file, { token });
        console.log('Generated direct URL:', directUrl);

        markdown = `
<div class="video-wrapper">
  <video 
    controls 
    preload="metadata"
    width="100%"
    class="max-w-full h-auto my-4 rounded-md"
    playsinline
  >
    <source src="${directUrl}" type="${fileType}">
    <p>Your browser doesn't support HTML5 video.</p>
  </video>
</div>

`; // Extra newline for better markdown formatting
        
        const cursorPosition = editor.selectionStart;
        const newContent = 
          content.substring(0, cursorPosition) + 
          markdown + 
          content.substring(cursorPosition);
        
        setContent(newContent);
      } catch (error) {
        console.error('Error generating video markdown:', error);
      }
    } else {
      // Handle images as before
      markdown = `![Image](${fileUrl})\n\n`;
      const cursorPosition = editor.selectionStart;
      const newContent = 
        content.substring(0, cursorPosition) + 
        markdown + 
        content.substring(cursorPosition);
      setContent(newContent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remove any duplicate media items
      const uniqueMedia = Array.from(new Map(uploadedImages.map(item => 
        [item.url, item]
      )).values());

      const data = {
        title,
        content,
        description,
        author: pb.authStore.model.id,
        isSpanTwo,
        media: uniqueMedia,
        images: uniqueMedia.filter(item => item.type === 'image')
      };

      console.log('Creating post with data:', data);
      const record = await pb.collection('posts').create(data);
      router.push(`/blogposts/${record.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.data) {
        console.error('Validation errors:', error.data);
      }
    }
  };

  const renderPreview = () => {
    if (!mdParser) return null;

    const htmlContent = mdParser.render(content);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const contentElements = [];

    doc.body.childNodes.forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'TABLE') {
          contentElements.push(
            <div key={`table-wrapper-${index}`} className="my-8">
              <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
                <div className="rounded-lg bg-[#F6EEE5] dark:bg-cat-frappe-base overflow-x-auto">
                  <table className="w-full">
                    {Array.from(node.children).map((child, childIndex) => {
                      if (child.tagName === 'THEAD') {
                        return (
                          <thead key={`thead-${childIndex}`}>
                            {Array.from(child.rows).map((row, rowIndex) => (
                              <tr key={`thead-row-${rowIndex}`}>
                                {Array.from(row.cells).map((cell, cellIndex) => (
                                  <th 
                                    key={`thead-cell-${cellIndex}`} 
                                    className="px-6 py-4 text-left font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow border-b border-cat-frappe-surface0/10 dark:border-cat-frappe-surface0/20 whitespace-nowrap bg-[#E9D4BA]/50 dark:bg-cat-frappe-surface0"
                                  >
                                    {cell.textContent}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                        );
                      } else if (child.tagName === 'TBODY') {
                        return (
                          <tbody key={`tbody-${childIndex}`}>
                            {Array.from(child.rows).map((row, rowIndex) => (
                              <tr 
                                key={`tbody-row-${rowIndex}`}
                                className="transition-colors duration-200 hover:bg-[#E9D4BA]/20 dark:hover:bg-cat-frappe-surface0/50"
                              >
                                {Array.from(row.cells).map((cell, cellIndex) => (
                                  <td 
                                    key={`tbody-cell-${cellIndex}`}
                                    className="px-6 py-4 text-cat-frappe-base dark:text-cat-frappe-text border-b border-cat-frappe-surface0/10 dark:border-cat-frappe-surface0/20 whitespace-nowrap"
                                  >
                                    {cell.textContent}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        );
                      }
                      return null;
                    })}
                  </table>
                </div>
              </div>
            </div>
          );
        } else if (node.classList?.contains('video-wrapper')) {
          contentElements.push(
            <div key={`video-${index}`} className="video-wrapper">
              <div dangerouslySetInnerHTML={{ __html: node.innerHTML }} />
            </div>
          );
        } else {
          contentElements.push(
            <div key={`element-${index}`} dangerouslySetInnerHTML={{ __html: node.outerHTML }} />
          );
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        contentElements.push(
          <div key={`text-${index}`}>{node.textContent}</div>
        );
      }
    });

    return <div className="prose dark:prose-invert max-w-none">{contentElements}</div>;
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
            <div className="w-full h-2 bg-gray-200 dark:bg-cat-frappe-surface0 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  progress === 98 
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
            className={`px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 ${
              type === 'error' 
                ? 'bg-cat-frappe-red text-white' 
                : type === 'success'
                ? 'bg-cat-frappe-green text-white'
                : 'bg-cat-frappe-yellow text-cat-frappe-base'
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
      <main className="pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
          <aside className="lg:col-span-1">
            <Information />
          </aside>
          <div className="lg:col-span-2">
            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
              <div className="rounded-lg p-4 lg:p-6 bg-gray-300 dark:bg-cat-frappe-base shadow-lg">
                <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                  Author Portal
                </h1>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Title</label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Description</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Upload Media</label>
                    <div className="w-full max-w-4xl mx-auto min-h-48 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <FileUpload 
                        onChange={handleFileUpload}
                        accept={{
                          'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                          'video/*': ['.mp4', '.webm', '.ogg']
                        }}
                      />
                    </div>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="mb-4">
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
                            <div className="aspect-[16/14] w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
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
                                >
                                  <source src={`${file.url}`} type={file.type} />
                                </video>
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

                  <div className="mb-4">
                    <label htmlFor="content" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Content</label>
                    <MdEditor
                      value={content}
                      style={{ height: '500px' }}
                      renderHTML={(text) => mdParser ? mdParser.render(text) : ''}
                      onChange={handleEditorChange}
                      plugins={[
                        'header',
                        'font-bold',
                        'font-italic',
                        'font-underline',
                        'font-strikethrough',
                        'list-unordered',
                        'list-ordered',
                        'block-quote',
                        'block-wrap',
                        'block-code-inline',
                        'block-code-block',
                        'table',
                        'image',
                        'link',
                        'clear',
                        'logger',
                        'mode-toggle',
                        'full-screen',
                        'tab-insert',
                      ]}
                      config={{
                        view: {
                          menu: true,
                          md: true,
                          html: true,
                          fullScreen: true,
                          hideMenu: false,
                        },
                        table: {
                          maxRow: 5,
                          maxCol: 6,
                        },
                        imageUrl: handleFileUpload,
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSpanTwo}
                        onChange={() => setIsSpanTwo(!isSpanTwo)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Span Two Columns
                      </span>
                    </label>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust py-2 px-4 rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Publish Post 🐝
                    </button>
                  </div>
                </form>
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">Preview</h2>
                  <div className="bg-[#eff1f5] dark:bg-cat-frappe-surface0 p-4 rounded-md">
                    <h1 className="text-3xl font-bold mb-4">{title}</h1>
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-1">
            <MoreInformation />
          </aside>
        </div>
      </main>
      <Notifications />
      <UploadProgress />
      <Footer />
    </>
  );
}
