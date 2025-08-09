import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import TurndownService from 'turndown'
import { saveAs } from 'file-saver'

declare module "@tiptap/react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Commands<ReturnType> {
    documentConverter: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportDocument: (format: 'pdf' | 'docx' | 'markdown' | 'html' | 'json') => any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      importDocument: (file: File) => any
    }
  }
}

declare global {
  interface Window {
    documentConverter?: DocumentConverter
  }
}

export interface DocumentConverterOptions {
  // Export options
  allowedExportFormats: ('pdf' | 'docx' | 'markdown' | 'html' | 'json')[]
  allowedImportFormats: ('docx' | 'markdown' | 'html' | 'json' | 'txt')[]
  
  // PDF options
  pdf: {
    format: 'a4' | 'letter'
    orientation: 'portrait' | 'landscape'
    margin: number
    fontSize: number
    fontFamily: string
  }
  
  // DOCX/RTF options
  docx: {
    pageSize: 'a4' | 'letter'
    margins: {
      top: number
      right: number
      bottom: number
      left: number
    }
    // RTF image sizing options
    imageMaxWidth: number // Maximum image width in inches
    imageMaxHeight: number // Maximum image height in inches
    imageMinSize: number // Minimum image size in inches
  }
  
  // Markdown options
  markdown: {
    gfm: boolean // GitHub Flavored Markdown
    bulletListMarker: '-' | '*' | '+'
    codeBlockStyle: 'indented' | 'fenced'
  }
  
  // File size limits (in bytes)
  maxFileSize: number
  
  // Callbacks
  onExportStart?: (format: string) => void
  onExportComplete?: (format: string, success: boolean) => void
  onImportStart?: (file: File) => void
  onImportComplete?: (success: boolean, errorMessage?: string) => void
  onProgress?: (progress: number) => void
}

export class DocumentConverter {
  private editor: Editor
  private options: DocumentConverterOptions

  constructor(editor: Editor, options: DocumentConverterOptions) {
    this.editor = editor
    this.options = options
  }

  // Export Methods
  async exportToPDF(): Promise<void> {
    if (!this.options.allowedExportFormats.includes('pdf')) {
      throw new Error('PDF export is not enabled')
    }

    try {
      this.options.onExportStart?.('pdf')
      this.options.onProgress?.(5)

      // Get the HTML content from the editor
      const html = this.editor.getHTML()
      
      this.options.onProgress?.(15)

      // Enhanced progress tracking with detailed steps
      const progressInterval = setInterval(() => {
        // Simulate incremental progress during the API call
        const currentTime = Date.now()
        if (!this.startTime) this.startTime = currentTime
        const elapsed = currentTime - this.startTime
        
        // Progressive loading based on time elapsed
        if (elapsed < 2000) {
          this.options.onProgress?.(20 + (elapsed / 2000) * 30) // 20-50% in first 2 seconds
        } else if (elapsed < 5000) {
          this.options.onProgress?.(50 + ((elapsed - 2000) / 3000) * 20) // 50-70% in next 3 seconds
        } else {
          this.options.onProgress?.(70 + ((elapsed - 5000) / 2000) * 15) // 70-85% after 5 seconds
        }
      }, 200)

      // Send HTML to our Puppeteer API route for PDF generation
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          options: {
            format: this.options.pdf.format.toUpperCase(),
            margin: {
              top: `${this.options.pdf.margin}mm`,
              right: `${this.options.pdf.margin}mm`,
              bottom: `${this.options.pdf.margin}mm`,
              left: `${this.options.pdf.margin}mm`
            }
          }
        })
      })

      clearInterval(progressInterval)
      this.options.onProgress?.(85)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      // Get the PDF blob from the response
      const pdfBlob = await response.blob()
      
      this.options.onProgress?.(95)

      // Download the PDF
      saveAs(pdfBlob, `document-${Date.now()}.pdf`)

      this.options.onProgress?.(100)
      this.options.onExportComplete?.('pdf', true)
      
      // Reset timing
      delete this.startTime
    } catch (error) {
      console.error('PDF export failed:', error)
      this.options.onExportComplete?.('pdf', false)
      delete this.startTime
      throw error
    }
  }

  private startTime?: number

  private async convertHTMLToRTF(html: string): Promise<string> {
    // Improved HTML to RTF conversion with proper image embedding
    let rtf = '{\\rtf1\\ansi\\deff0\\ansicpg1252{\\fonttbl\\f0\\fswiss\\fcharset0 Arial;}{\\colortbl;\\red0\\green0\\blue0;}\\f0\\fs24\\cf1 '
    
    // Convert HTML to text with basic formatting
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    // Helper function to escape RTF special characters
    const escapeRTF = (text: string): string => {
      if (!text) return ''
      return text
        .replace(/\\/g, '\\\\')     // Escape backslashes first
        .replace(/\{/g, '\\{')      // Escape opening braces
        .replace(/\}/g, '\\}')      // Escape closing braces
        .replace(/\r\n/g, '\\par ') // Windows line endings
        .replace(/\n/g, '\\par ')   // Unix line endings
        .replace(/\r/g, '\\par ')   // Mac line endings
        .replace(/[\u0080-\uFFFF]/g, (match) => {
          // Convert Unicode characters to RTF escape sequences
          const code = match.charCodeAt(0)
          return `\\u${code}?`
        })
    }

    // Helper function to download and convert image to RTF format
    const convertImageToRTF = async (imgSrc: string, altText: string): Promise<string> => {
      try {
        // Handle relative URLs by making them absolute
        let imageUrl = imgSrc
        if (imgSrc.startsWith('/') || imgSrc.startsWith('./')) {
          imageUrl = new URL(imgSrc, window.location.origin).href
        }

        // Fetch the image
        const response = await fetch(imageUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Convert to hex string
        const hexString = Array.from(uint8Array)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('')

        // Determine image type from content type or URL extension
        const contentType = response.headers.get('content-type') || ''
        let imageType = 'pngblip' // Default to PNG
        
        if (contentType.includes('jpeg') || contentType.includes('jpg') || imgSrc.toLowerCase().includes('.jpg') || imgSrc.toLowerCase().includes('.jpeg')) {
          imageType = 'jpegblip'
        } else if (contentType.includes('png') || imgSrc.toLowerCase().includes('.png')) {
          imageType = 'pngblip'
        } else if (contentType.includes('gif') || imgSrc.toLowerCase().includes('.gif')) {
          imageType = 'pngblip' // RTF doesn't have native GIF support, treat as PNG
        }

        // Get actual image dimensions and calculate display size to match Tiptap editor
        const imageInfo = await new Promise<{width: number, height: number, displayWidth: number, displayHeight: number}>((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            // Calculate how the image would display in Tiptap editor (max-width: 100% of 640px container)
            const EDITOR_MAX_WIDTH = 640 // Max width of Tiptap editor content
            let displayWidth = img.width
            let displayHeight = img.height
            
            // Scale down if image is wider than editor container, maintaining aspect ratio
            if (displayWidth > EDITOR_MAX_WIDTH) {
              const scale = EDITOR_MAX_WIDTH / displayWidth
              displayWidth = EDITOR_MAX_WIDTH
              displayHeight = Math.round(displayHeight * scale)
            }
            
            console.log(`RTF Image: original ${img.width}x${img.height}px, editor display ${displayWidth}x${displayHeight}px`)
            resolve({ 
              width: img.width, 
              height: img.height,
              displayWidth,
              displayHeight
            })
          }
          img.onerror = () => reject(new Error('Failed to load image for dimension detection'))
          img.src = imageUrl
        })

        // Convert editor display size to RTF dimensions
        // RTF uses twips (1440 twips = 1 inch) and 96 DPI for screen display
        const TWIPS_PER_INCH = 1440
        const DPI = 96
        
        // Calculate display size in inches, then convert to twips
        const displayWidthInches = imageInfo.displayWidth / DPI
        const displayHeightInches = imageInfo.displayHeight / DPI
        
        // RTF requires both source dimensions (picw/pich) and goal dimensions (picwgoal/pichgoal)
        const sourceWidthTwips = Math.round((imageInfo.width / DPI) * TWIPS_PER_INCH)
        const sourceHeightTwips = Math.round((imageInfo.height / DPI) * TWIPS_PER_INCH)
        const goalWidthTwips = Math.round(displayWidthInches * TWIPS_PER_INCH)
        const goalHeightTwips = Math.round(displayHeightInches * TWIPS_PER_INCH)

        console.log(`RTF Image final: ${imageInfo.displayWidth}x${imageInfo.displayHeight}px = ${goalWidthTwips}x${goalHeightTwips} twips`)

        // Create RTF image with proper sizing using both source and goal dimensions
        return `\\par{\\pict\\${imageType}\\picw${sourceWidthTwips}\\pich${sourceHeightTwips}\\picwgoal${goalWidthTwips}\\pichgoal${goalHeightTwips} ${hexString}}\\par `
      } catch (error) {
        console.warn('Failed to embed image in RTF:', error)
        // Fallback to descriptive text
        return `\\par [IMAGE: ${altText} - Could not embed image]\\par `
      }
    }
    
    // Process the content recursively
    const processNode = async (node: Node): Promise<string> => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        return escapeRTF(text)
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        let content = ''
        
        // Process child nodes first (except for img tags which we handle specially)
        if (element.tagName?.toLowerCase() !== 'img') {
          for (const child of Array.from(element.childNodes)) {
            content += await processNode(child)
          }
        }
        
        // Apply formatting based on tag
        switch (element.tagName?.toLowerCase()) {
          case 'h1':
            return `\\par\\fs36\\b ${content}\\b0\\fs24\\par `
          case 'h2':
            return `\\par\\fs32\\b ${content}\\b0\\fs24\\par `
          case 'h3':
            return `\\par\\fs28\\b ${content}\\b0\\fs24\\par `
          case 'h4':
            return `\\par\\fs26\\b ${content}\\b0\\fs24\\par `
          case 'h5':
            return `\\par\\fs24\\b ${content}\\b0\\fs24\\par `
          case 'h6':
            return `\\par\\fs22\\b ${content}\\b0\\fs24\\par `
          case 'p':
            return `${content}\\par `
          case 'br':
            return '\\par '
          case 'strong':
          case 'b':
            return `\\b ${content}\\b0 `
          case 'em':
          case 'i':
            return `\\i ${content}\\i0 `
          case 'u':
            return `\\ul ${content}\\ul0 `
          case 'ul':
            return `\\par ${content}`
          case 'ol':
            return `\\par ${content}`
          case 'li':
            return `\\par\\bullet\\tab ${content}`
          case 'blockquote':
            return `\\par\\li720 ${content}\\li0\\par `
          case 'code':
            return `\\f1\\fs20 ${content}\\f0\\fs24 `
          case 'pre':
            return `\\par\\f1\\fs20 ${content}\\f0\\fs24\\par `
          case 'div':
            return `${content}\\par `
          case 'img':
            // Embed actual image in RTF
            const imgElement = element as HTMLImageElement
            const altText = imgElement.alt || 'Image'
            const src = imgElement.src || ''
            
            if (src) {
              return await convertImageToRTF(src, altText)
            } else {
              return `\\par [IMAGE: ${altText}]\\par `
            }
          case 'figure':
            // Handle figure elements with images
            const img = element.querySelector('img')
            const figcaption = element.querySelector('figcaption')
            let result = content
            
            if (img && img.src) {
              const altText = img.alt || 'Image'
              const imageRTF = await convertImageToRTF(img.src, altText)
              result = imageRTF
              
              // Add caption if present
              if (figcaption?.textContent) {
                result += `\\par\\i Caption: ${escapeRTF(figcaption.textContent)}\\i0\\par `
              }
            }
            
            return result
          default:
            return content
        }
      }
      
      return ''
    }
    
    // Process the content
    const content = await processNode(tempDiv)
    
    // Ensure we have content
    if (!content.trim()) {
      // If no content, add the HTML as plain text as fallback
      const plainText = tempDiv.textContent || tempDiv.innerText || 'No content'
      rtf += escapeRTF(plainText)
    } else {
      rtf += content
    }
    
    rtf += '}'
    
    return rtf
  }

  async exportToDOCX(): Promise<void> {
    if (!this.options.allowedExportFormats.includes('docx')) {
      throw new Error('DOCX export is not enabled')
    }

    try {
      this.options.onExportStart?.('docx')
      this.options.onProgress?.(10)

      const html = this.editor.getHTML()
      
      this.options.onProgress?.(30)

      // Create RTF content (which can be opened by Word) - now async for image embedding
      const rtfContent = await this.convertHTMLToRTF(html)
      
      this.options.onProgress?.(80)

      // Create blob with proper MIME type for RTF
      const blob = new Blob([rtfContent], { 
        type: 'application/rtf;charset=utf-8' 
      })
      saveAs(blob, `document-${Date.now()}.rtf`)

      this.options.onProgress?.(100)
      this.options.onExportComplete?.('docx', true)
    } catch (error) {
      console.error('DOCX export failed:', error)
      this.options.onExportComplete?.('docx', false)
      throw error
    }
  }

  async exportToMarkdown(): Promise<void> {
    if (!this.options.allowedExportFormats.includes('markdown')) {
      throw new Error('Markdown export is not enabled')
    }

    try {
      this.options.onExportStart?.('markdown')
      this.options.onProgress?.(10)

      const html = this.editor.getHTML()
      
      this.options.onProgress?.(30)

      const turndownService = new TurndownService({
        bulletListMarker: this.options.markdown.bulletListMarker,
        codeBlockStyle: this.options.markdown.codeBlockStyle,
        headingStyle: 'atx',
        hr: '---',
        emDelimiter: '*',
        strongDelimiter: '**'
      })

      if (this.options.markdown.gfm) {
        turndownService.addRule('strikethrough', {
          filter: ['del', 's'],
          replacement: content => `~~${content}~~`
        })

        turndownService.addRule('taskList', {
          filter: (node): boolean => {
            return node.nodeName === 'LI' && 
                   !!node.parentNode && node.parentNode.nodeName === 'UL' && 
                   !!(node as Element).querySelector('input[type="checkbox"]')
          },
          replacement: (content, node) => {
            const checkbox = (node as Element).querySelector('input[type="checkbox"]')
            const isChecked = checkbox?.getAttribute('checked') !== null
            const cleanContent = content.replace(/^\s*\[[ x]\]\s*/, '')
            return `- [${isChecked ? 'x' : ' '}] ${cleanContent}\n`
          }
        })
      }

      // Enhanced image handling for markdown
      turndownService.addRule('images', {
        filter: 'img',
        replacement: (content, node) => {
          const element = node as HTMLImageElement
          const alt = element.alt || 'Image'
          const src = element.src || ''
          const title = element.title ? ` "${element.title}"` : ''
          return `![${alt}](${src}${title})`
        }
      })

      // Handle figure elements with images and captions
      turndownService.addRule('figures', {
        filter: 'figure',
        replacement: (content, node) => {
          const element = node as Element
          const img = element.querySelector('img')
          const figcaption = element.querySelector('figcaption')
          
          if (img) {
            const alt = img.alt || 'Image'
            const src = img.src || ''
            const title = img.title ? ` "${img.title}"` : ''
            const caption = figcaption?.textContent || ''
            
            let result = `![${alt}](${src}${title})`
            if (caption) {
              result += `\n\n*${caption}*`
            }
            return `\n\n${result}\n\n`
          }
          
          return content
        }
      })

      this.options.onProgress?.(70)

      const markdown = turndownService.turndown(html)
      
      this.options.onProgress?.(90)

      // Ensure proper UTF-8 encoding
      const blob = new Blob([markdown], { 
        type: 'text/markdown;charset=utf-8' 
      })
      saveAs(blob, `document-${Date.now()}.md`)

      this.options.onProgress?.(100)
      this.options.onExportComplete?.('markdown', true)
    } catch (error) {
      console.error('Markdown export failed:', error)
      this.options.onExportComplete?.('markdown', false)
      throw error
    }
  }

  async exportToHTML(): Promise<void> {
    if (!this.options.allowedExportFormats.includes('html')) {
      throw new Error('HTML export is not enabled')
    }

    try {
      this.options.onExportStart?.('html')
      this.options.onProgress?.(20)

      const html = this.editor.getHTML()
      
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Export</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.17em; }
        p {
            margin-bottom: 1em;
        }
        ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
        }
        li {
            margin-bottom: 0.25em;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 1em 0;
            padding-left: 1em;
            color: #666;
            font-style: italic;
        }
        code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
        }
        pre {
            background: #f4f4f4;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        pre code {
            background: none;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: 600;
        }
        strong, b {
            font-weight: 600;
        }
        em, i {
            font-style: italic;
        }
        u {
            text-decoration: underline;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        
        /* Images - responsive sizing and proper layout */
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1.5em auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Figure elements for image containers */
        figure {
            margin: 2em 0;
            text-align: center;
        }
        
        figure img {
            margin: 0 auto 0.5em auto;
        }
        
        figcaption {
            font-size: 0.9em;
            color: #666;
            font-style: italic;
            margin-top: 0.5em;
        }
        
        /* Ensure images don't overflow containers */
        p img, 
        div img {
            max-width: 100%;
            height: auto;
        }
        
        /* Image alignment classes */
        .image-left {
            float: left;
            margin: 0 1em 1em 0;
            max-width: 50%;
        }
        
        .image-right {
            float: right;
            margin: 0 0 1em 1em;
            max-width: 50%;
        }
        
        .image-center {
            display: block;
            margin: 1.5em auto;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`

      this.options.onProgress?.(80)

      // Ensure proper UTF-8 encoding
      const blob = new Blob([fullHtml], { 
        type: 'text/html;charset=utf-8' 
      })
      saveAs(blob, `document-${Date.now()}.html`)

      this.options.onProgress?.(100)
      this.options.onExportComplete?.('html', true)
    } catch (error) {
      console.error('HTML export failed:', error)
      this.options.onExportComplete?.('html', false)
      throw error
    }
  }

  async exportToJSON(): Promise<void> {
    if (!this.options.allowedExportFormats.includes('json')) {
      throw new Error('JSON export is not enabled')
    }

    try {
      this.options.onExportStart?.('json')
      this.options.onProgress?.(20)

      const json = this.editor.getJSON()
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        editor: 'tiptap',
        content: json
      }

      this.options.onProgress?.(80)

      // Ensure proper UTF-8 encoding with pretty formatting
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { 
        type: 'application/json;charset=utf-8' 
      })
      saveAs(blob, `document-${Date.now()}.json`)

      this.options.onProgress?.(100)
      this.options.onExportComplete?.('json', true)
    } catch (error) {
      console.error('JSON export failed:', error)
      this.options.onExportComplete?.('json', false)
      throw error
    }
  }

  // Import Methods
  async importFromFile(file: File): Promise<void> {
    if (file.size > this.options.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.options.maxFileSize} bytes`)
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    this.options.onImportStart?.(file)

    try {
      switch (fileExtension) {
        case 'docx':
          await this.importFromDOCX(file)
          break
        case 'md':
        case 'markdown':
          await this.importFromMarkdown(file)
          break
        case 'html':
        case 'htm':
          await this.importFromHTML(file)
          break
        case 'json':
          await this.importFromJSON(file)
          break
        case 'txt':
          await this.importFromText(file)
          break
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`)
      }
      
      this.options.onImportComplete?.(true)
    } catch (error) {
      console.error('Import failed:', error)
      this.options.onImportComplete?.(false, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  private async importFromDOCX(file: File): Promise<void> {
    if (!this.options.allowedImportFormats.includes('docx')) {
      throw new Error('DOCX import is not enabled')
    }

    this.options.onProgress?.(10)

    // Create FormData to send file to server
    const formData = new FormData()
    formData.append('file', file)
    
    this.options.onProgress?.(30)

    // Send file to server-side API for conversion
    const response = await fetch('/api/convert-docx', {
      method: 'POST',
      body: formData,
    })

    this.options.onProgress?.(60)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to convert DOCX file')
    }

    const result = await response.json()
    
    this.options.onProgress?.(80)

    if (result.success && result.html) {
      this.editor.commands.setContent(result.html)
    } else {
      throw new Error('Invalid response from DOCX conversion service')
    }

    this.options.onProgress?.(100)

    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX import warnings:', result.messages)
    }
  }

  private async importFromMarkdown(file: File): Promise<void> {
    if (!this.options.allowedImportFormats.includes('markdown')) {
      throw new Error('Markdown import is not enabled')
    }

    this.options.onProgress?.(20)

    const text = await file.text()
    
    this.options.onProgress?.(50)

    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br>')

    html = html.replace(/<\/ul>\s*<ul>/g, '').replace(/<\/ol>\s*<ol>/g, '')

    this.options.onProgress?.(80)

    this.editor.commands.setContent(html)

    this.options.onProgress?.(100)
  }

  private async importFromHTML(file: File): Promise<void> {
    if (!this.options.allowedImportFormats.includes('html')) {
      throw new Error('HTML import is not enabled')
    }

    this.options.onProgress?.(20)

    const html = await file.text()
    
    this.options.onProgress?.(60)

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const content = bodyMatch ? bodyMatch[1] : html

    this.options.onProgress?.(80)

    this.editor.commands.setContent(content)

    this.options.onProgress?.(100)
  }

  private async importFromJSON(file: File): Promise<void> {
    if (!this.options.allowedImportFormats.includes('json')) {
      throw new Error('JSON import is not enabled')
    }

    this.options.onProgress?.(20)

    const jsonText = await file.text()
    
    this.options.onProgress?.(40)

    try {
      const data = JSON.parse(jsonText)
      
      this.options.onProgress?.(60)

      let content
      if (data.content) {
        content = data.content
      } else if (data.type && data.content) {
        content = data
      } else {
        throw new Error('Invalid JSON format')
      }

      this.options.onProgress?.(80)

      this.editor.commands.setContent(content)

      this.options.onProgress?.(100)
    } catch {
      throw new Error('Invalid JSON file format')
    }
  }

  private async importFromText(file: File): Promise<void> {
    if (!this.options.allowedImportFormats.includes('txt')) {
      throw new Error('Text import is not enabled')
    }

    this.options.onProgress?.(20)

    const text = await file.text()
    
    this.options.onProgress?.(60)

    const html = text
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('')

    this.options.onProgress?.(80)

    this.editor.commands.setContent(html)

    this.options.onProgress?.(100)
  }
}

export const DocumentConverterExtension = Extension.create<DocumentConverterOptions>({
  name: 'documentConverter',

  addOptions() {
    return {
      allowedExportFormats: ['pdf', 'docx', 'markdown', 'html', 'json'],
      allowedImportFormats: ['docx', 'markdown', 'html', 'json', 'txt'],
      pdf: {
        format: 'a4',
        orientation: 'portrait',
        margin: 20,
        fontSize: 12,
        fontFamily: 'helvetica'
      },
      docx: {
        pageSize: 'a4',
        margins: {
          top: 720,
          right: 720,
          bottom: 720,
          left: 720
        },
        // RTF image sizing options
        imageMaxWidth: 2.5, // Maximum image width in inches (much smaller for RTF)
        imageMaxHeight: 3, // Maximum image height in inches (much smaller for RTF)
        imageMinSize: 0.3 // Minimum image size in inches
      },
      markdown: {
        gfm: true,
        bulletListMarker: '-',
        codeBlockStyle: 'fenced'
      },
      maxFileSize: 10 * 1024 * 1024, // 10MB
      onExportStart: undefined,
      onExportComplete: undefined,
      onImportStart: undefined,
      onImportComplete: undefined,
      onProgress: undefined
    }
  },

  addStorage() {
    return {
      converter: null as DocumentConverter | null
    }
  },

  onCreate() {
    this.storage.converter = new DocumentConverter(this.editor, this.options)
    
    if (typeof window !== 'undefined') {
      window.documentConverter = this.storage.converter
    }
  },

  onDestroy() {
    if (typeof window !== 'undefined') {
      delete window.documentConverter
    }
  },

  addCommands() {
    return {
      exportDocument: (format: 'pdf' | 'docx' | 'markdown' | 'html' | 'json') => async ({ editor }: { editor: Editor }) => {
        const converter = this.storage.converter as DocumentConverter
        if (!converter) {
            this.storage.converter = new DocumentConverter(editor, this.options as DocumentConverterOptions)
        }
        
        try {
          switch (format) {
            case 'pdf':
              await this.storage.converter.exportToPDF()
              break
            case 'docx':
              await this.storage.converter.exportToDOCX()
              break
            case 'markdown':
              await this.storage.converter.exportToMarkdown()
              break
            case 'html':
              await this.storage.converter.exportToHTML()
              break
            case 'json':
              await this.storage.converter.exportToJSON()
              break
            default:
              console.warn(`Unsupported export format: ${format}`)
              return false
          }
          return true
        } catch (error) {
          console.error(`Export failed for format: ${format}`, error)
          return false
        }
      },
      importDocument: (file: File) => async ({ editor }: { editor: Editor }) => {
        const converter = this.storage.converter as DocumentConverter
        if (!converter) {
            this.storage.converter = new DocumentConverter(editor, this.options as DocumentConverterOptions)
        }

        try {
          await this.storage.converter.importFromFile(file)
          return true
        } catch (error) {
          console.error('Import failed:', error)
          return false
        }
      }
    }
  }
})

export default DocumentConverterExtension 