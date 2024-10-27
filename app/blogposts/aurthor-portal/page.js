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
        breaks: true,
      })
      .use(sub)
      .use(sup)
      .use(ins)
      .use(mark)
      .use(taskLists);

      // Enable all header levels
      mdInstance.enable('heading');

      setMdParser(mdInstance);
    };

    initializeMdParser();
  }, []);

  const handleEditorChange = ({ text }) => {
    setContent(text);
  };

  const handleImageUpload = async (files) => {
    const uploadedFiles = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const fileRecord = await pb.collection('files').create(formData);
        const imageUrl = pb.getFileUrl(fileRecord, fileRecord.file);
        uploadedFiles.push({ name: file.name, url: imageUrl });
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    setUploadedImages([...uploadedImages, ...uploadedFiles]);
    // Insert the last uploaded image into the editor
    if (uploadedFiles.length > 0) {
      const lastImage = uploadedFiles[uploadedFiles.length - 1];
      insertImageIntoContent(lastImage.url);
    }
  };

  const insertImageIntoContent = (imageUrl) => {
    setContent(prevContent => prevContent + `\n![Image](${imageUrl})\n`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title,
        content,
        description,
        author: pb.authStore.model.id,
        isSpanTwo,
        images: uploadedImages.map(img => img.url),
      };
      console.log('Submitting data:', data); // For debugging
      const record = await pb.collection('posts').create(data);
      router.push(`/blogposts/${record.id}`);
    } catch (error) {
      console.error('Error publishing post:', error);
      if (error.data) {
        console.error('Validation errors:', error.data);
      }
    }
  };

  const renderPreview = () => {
    if (!mdParser) return null;

    const htmlContent = mdParser.render(content);

    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const contentElements = [];

    // Process each element in the parsed HTML
    doc.body.childNodes.forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'H1') {
          contentElements.push(
            <h1 key={`h1-${index}`} className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
              {node.textContent}
            </h1>
          );
        } else if (node.tagName === 'H2') {
          contentElements.push(
            <h2 key={`h2-${index}`} className="text-3xl font-bold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">
              {node.textContent}
            </h2>
          );
        } else if (node.tagName === 'H3') {
          contentElements.push(
            <h3 key={`h3-${index}`} className="text-2xl font-bold mb-3 text-cat-frappe-base dark:text-cat-frappe-yellow">
              {node.textContent}
            </h3>
          );
        } else if (node.tagName === 'PRE' && node.querySelector('code')) {
          const codeElement = node.querySelector('code');
          const language = codeElement.className.replace('language-', '');
          contentElements.push(
            <CodeSnippet key={`code-${index}`} language={language} code={codeElement.textContent} />
          );
        } else if (node.tagName === 'IMG') {
          contentElements.push(
            <img key={`img-${index}`} src={node.src} alt={node.alt} className="max-w-full h-auto my-4 rounded-md" />
          );
        } else if (node.tagName === 'TABLE') {
          contentElements.push(
            <div key={`table-${index}`} className="overflow-x-auto my-4">
              <table className="w-full border-collapse">
                {Array.from(node.children).map((child, childIndex) => {
                  if (child.tagName === 'THEAD') {
                    return (
                      <thead key={`thead-${childIndex}`} className="bg-blue-200 dark:bg-cat-frappe-yellow border border-gray-800 dark:border-cat-frappe-surface0">
                        {Array.from(child.rows).map((row, rowIndex) => (
                          <tr key={`thead-row-${rowIndex}`}>
                            {Array.from(row.cells).map((cell, cellIndex) => (
                              <th key={`thead-cell-${cellIndex}`} className="border border-gray-800 dark:border-cat-frappe-surface0 p-2 font-bold text-left text-gray-800 dark:text-cat-frappe-base">
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
                          <tr key={`tbody-row-${rowIndex}`} className={rowIndex % 2 === 0 ? 'bg-gray-300 dark:bg-cat-frappe-surface1' : 'bg-gray-200 dark:bg-cat-frappe-mantle'}>
                            {Array.from(row.cells).map((cell, cellIndex) => (
                              <td key={`tbody-cell-${cellIndex}`} className="border border-gray-700 dark:border-cat-frappe-surface0 p-2 text-gray-800 dark:text-cat-frappe-subtext1">
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
          );
        } else {
          contentElements.push(
            <div key={`element-${index}`} dangerouslySetInnerHTML={{ __html: node.outerHTML }} />
          );
        }
      }
    });

    return <div>{contentElements}</div>;
  };

  if (!isAdmin) {
    return <div>Loading...</div>;
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
                    <label className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Upload Images</label>
                    <div className="w-full max-w-4xl mx-auto min-h-48 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <FileUpload onChange={handleImageUpload} />
                    </div>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Uploaded Images</h3>
                      <div className="flex flex-wrap gap-2">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img src={img.url} alt={img.name} className="w-24 h-24 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => insertImageIntoContent(img.url)}
                              className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                            >
                              Insert
                            </button>
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
                        imageUrl: handleImageUpload,
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
      <Footer />
    </>
  );
}
