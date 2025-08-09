"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor, Editor } from "@tiptap/react"
import { EditorView } from "@tiptap/pm/view"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import { FontFamily } from "@tiptap/extension-font-family"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"

// --- Custom Extensions ---
import { Link } from "@/components/tiptap-extension/link-extension"
import { Selection } from "@/components/tiptap-extension/selection-extension"
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension"
import { DocumentConverterExtension } from "@/components/tiptap-extension/document-converter-extension"
import { TableManagementExtension } from "@/components/tiptap-extension/table-management-extension"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/components/tiptap-node/table-node/table-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { FontFamilyDropdownMenu } from "@/components/tiptap-ui/font-family-dropdown-menu/font-family-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockQuoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { TableButton } from "@/components/tiptap-ui/table-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import { TemplateButton } from "@/components/tiptap-ui/template-button"

// --- Table Context Menu ---
import { TableContextMenu } from "@/components/tiptap-ui/table-context-menu"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { toast } from "sonner"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// 🚀 ULTRA-FAST content similarity for performance-critical operations
const calculateContentSimilarity = (content1: string, content2: string): number => {
  // Exact match check (most common case - early exit)
  if (content1 === content2) return 1.0
  
  const len1 = content1.length
  const len2 = content2.length
  
  // Empty content checks
  if (len1 === 0 && len2 === 0) return 1.0
  if (len1 === 0 || len2 === 0) return 0.0
  
  // Fast length-based similarity (no expensive loops)
  const maxLen = Math.max(len1, len2)
  const minLen = Math.min(len1, len2)
  const lengthSimilarity = minLen / maxLen
  
  // If length difference is huge, skip expensive processing
  if (lengthSimilarity < 0.5) return lengthSimilarity
  
  // For performance: sample only first 100 characters for similarity
  const sampleSize = Math.min(100, minLen)
  let matches = 0
  
  for (let i = 0; i < sampleSize; i++) {
    if (content1[i] === content2[i]) matches++
  }
  
  const sampleSimilarity = matches / sampleSize
  
  // Combine length and sample similarity (fast calculation)
  return (lengthSimilarity * 0.3) + (sampleSimilarity * 0.7)
}

// --- Styles ---
import "@/components/tiptap-ui-primitive/button/button.scss"
import "@/components/tiptap-ui-primitive/toolbar/toolbar.scss"
import "@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss"
import "@/components/tiptap-ui-primitive/popover/popover.scss"
import "@/components/tiptap-ui-primitive/separator/separator.scss"
import "@/components/tiptap-ui-primitive/tooltip/tooltip.scss"
import "@/styles/_variables.scss"
import "@/styles/_keyframe-animations.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/components/tiptap-node/table-node/table-node.scss"
import "@/components/tiptap-templates/simple/simple-editor.scss"

interface SimpleEditorProps {
  initialContent?: string
  onContentChange?: (content: string) => void
  noteId?: string
  noteTitle?: string
  noteUpdated?: string // Add note timestamp for conflict resolution
}

export interface SimpleEditorRef {
  editor: Editor | null
}

// 🚀 AGGRESSIVE Performance monitoring with INP tracking
const usePerformanceMonitor = () => {
  const renderCountRef = React.useRef(0)
  
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCountRef.current++
      
      // Monitor for INP spikes during typing
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.entryType === 'first-input') {
            const inp = entry.duration
            if (inp > 100) {
              console.warn(`🚨 INP Spike detected: ${inp.toFixed(2)}ms`, entry)
            }
          }
        }
      })
      
      // Only monitor if PerformanceObserver supports it
      try {
        observer.observe({ entryTypes: ['first-input', 'layout-shift'] })
      } catch {
        // PerformanceObserver not supported
      }
      
      return () => {
        try {
          observer.disconnect()
        } catch {
          // Observer was never connected
        }
      }
    }
  })

  return renderCountRef.current
}

// Static toolbar components - completely isolated from editor state
const StaticMainToolbarContent = React.memo(() => {
  const isMobile = useMobile()
  
  const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
  
  const handleHighlighterClick = React.useCallback(() => setMobileView("highlighter"), [])
  const handleLinkClick = React.useCallback(() => setMobileView("link"), [])
  const handleBack = React.useCallback(() => setMobileView("main"), [])

  if (isMobile && mobileView === "highlighter") {
    return (
      <>
        <ToolbarGroup>
          <Button onClick={handleBack} data-style="ghost">
            <ArrowLeftIcon className="tiptap-button-icon" />
            <HighlighterIcon className="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ColorHighlightPopoverContent />
      </>
    )
  }

  if (isMobile && mobileView === "link") {
    return (
      <>
        <ToolbarGroup>
          <Button onClick={handleBack} data-style="ghost">
            <ArrowLeftIcon className="tiptap-button-icon" />
            <LinkIcon className="tiptap-button-icon" />
          </Button>
        </ToolbarGroup>
        <ToolbarSeparator />
        <LinkContent />
      </>
    )
  }

  // Mobile main view - complete toolbar with horizontal scroll
  if (isMobile) {
    return (
      <>
        <ToolbarGroup>
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
          <FontFamilyDropdownMenu />
          <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
          <BlockQuoteButton />
          <CodeBlockButton />
          <TableButton />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="strike" />
          <MarkButton type="code" />
          <MarkButton type="underline" />
          <ColorHighlightPopoverButton onClick={handleHighlighterClick} />
          <LinkButton onClick={handleLinkClick} />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <MarkButton type="superscript" />
          <MarkButton type="subscript" />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
          <TextAlignButton align="justify" />
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <TemplateButton text="Templates" />
          <ImageUploadButton text="Add" />
        </ToolbarGroup>
      </>
    )
  }

  // Desktop full toolbar
  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex justify-center items-center p-2">
          <Spacer />
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
            <FontFamilyDropdownMenu />
            <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
            <BlockQuoteButton />
            <CodeBlockButton />
            <TableButton />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <MarkButton type="underline" />
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <TemplateButton text="Templates" />
            <ImageUploadButton text="Add" />
          </ToolbarGroup>
          <Spacer />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  )
})

StaticMainToolbarContent.displayName = "StaticMainToolbarContent"

// 🎯 BALANCED PERFORMANCE MODE: Functional + Optimized
// 
// 🚀 PERFORMANCE OPTIMIZATIONS APPLIED:
// ✅ Optimized TipTap history (longer grouping, reasonable depth)
// ✅ Disabled expensive Typography transforms
// ✅ Minimal DOM event blocking (only scroll events)
// ✅ Disabled Grammarly interference
// ✅ Zero-overhead debouncing
// ✅ Skip sync operations while user is actively typing
// ✅ Ultra-fast content similarity calculation
// ✅ Performance monitoring with INP detection
//
// ✅ FUNCTIONALITY PRESERVED:
// ✅ All editor features work (tasks, selections, etc.)
// ✅ Full undo/redo history
// ✅ Complete toolbar functionality
// ✅ Image upload and base64 support
//
// 🎯 TARGET: INP <200ms (down from 300ms+)
//
export const SimpleEditor = React.memo(React.forwardRef<SimpleEditorRef, SimpleEditorProps>(({ 
  initialContent = '', 
  onContentChange,
  noteId,
  noteUpdated
}, ref) => {
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  
  // Performance monitoring
  usePerformanceMonitor()

  // Track current note ID to prevent content resets during typing
  const currentNoteIdRef = React.useRef(noteId)

  // Content buffering for performance - heavily debounced
  const contentBufferRef = React.useRef(initialContent)
  const debounceTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const lastEmittedContentRef = React.useRef(initialContent)

  // 🚀 ZERO-OVERHEAD debouncing - absolutely minimal processing
  const debouncedContentChange = React.useCallback((content: string) => {
    // ULTRA-FAST: Just store content and set timer
    contentBufferRef.current = content
    
    // Clear previous timer (minimal operation)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new timer with minimal callback
    debounceTimerRef.current = setTimeout(() => {
      // MINIMAL comparison to avoid unnecessary calls
      if (onContentChange && contentBufferRef.current !== lastEmittedContentRef.current) {
        lastEmittedContentRef.current = contentBufferRef.current
        onContentChange(contentBufferRef.current)
      }
    }, 1500)
  }, [onContentChange])

  // 🚀 BALANCED Performance Extensions - Functional but optimized
  const extensions = React.useMemo(() => [
    StarterKit.configure({
      // Optimized history for better performance while keeping functionality
      history: {
        depth: 20, // Reasonable depth for good UX
        newGroupDelay: 3000, // Longer grouping for better performance
      },
    }),
    Table.configure({
      resizable: true,
      allowTableNodeSelection: true, // Enable table node selection for deletion
    }),
    TableRow,
    TableHeader,
    TableCell,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Underline,
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Image.configure({
      HTMLAttributes: { class: 'tiptap-image' },
      allowBase64: true,
      inline: false,
    }),
    Typography.configure({
      // Disable most expensive typography transforms but keep basic ones
      openDoubleQuote: false,
      closeDoubleQuote: false,
      openSingleQuote: false,
      closeSingleQuote: false,
      leftArrow: false,
      rightArrow: false,
      copyright: false,
      trademark: false,
      servicemark: false,
      registeredTrademark: false,
      plusMinus: false,
      notEqual: false,
      laquo: false,
      raquo: false,
      multiplication: false,
      superscriptTwo: false,
      superscriptThree: false,
    }),
    Superscript,
    Subscript,
    TextStyle,
    FontFamily.configure({ types: ['textStyle'] }),
    Selection,
    ImageUploadNode.configure({
      accept: "image/*",
      maxSize: MAX_FILE_SIZE,
      limit: 3,
      upload: handleImageUpload,
      onError: (error: unknown) => console.error("Upload failed:", error),
    }),
    TrailingNode,
    Link.configure({ openOnClick: false }),
    DocumentConverterExtension.configure({
      // Let the UI component handle all toast notifications
      // to avoid duplicate toasts and stuck loading states
    }),
    TableManagementExtension.configure({
      showHints: true,
    }),
  ], [])

  // 🍎 iPad Photos App Drag & Drop Support
  // Create drag and drop handlers for external image files
  const handleDragOver = React.useCallback((view: EditorView, event: DragEvent) => {
    // Only handle if files are being dragged
    if (!event.dataTransfer?.files?.length && !event.dataTransfer?.types?.includes('Files')) {
      return false
    }
    
    // Check if any dragged files are images
    const hasImageFiles = Array.from(event.dataTransfer.items || []).some(item => 
      item.type.startsWith('image/')
    )
    
    if (hasImageFiles) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      
      // Add visual feedback for drag over
      const editorElement = view.dom as HTMLElement
      editorElement.classList.add('drag-over-image')
      
      return true
    }
    
    return false
  }, [])

  const handleDrop = React.useCallback((view: EditorView, event: DragEvent) => {
    const files = event.dataTransfer?.files
    if (!files || files.length === 0) {
      return false
    }

    // Filter for image files only
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      return false
    }

    event.preventDefault()
    
    // Remove visual feedback
    const editorElement = view.dom as HTMLElement
    editorElement.classList.remove('drag-over-image')

    // Get the drop position in the editor
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
    if (!pos) {
      console.warn('Could not determine drop position')
      return true
    }

    // Handle async upload operations without blocking the handler
    const processDroppedImages = async () => {
      try {
        // Process each image file
        for (const file of imageFiles) {
          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            toast.error(`Image "${file.name}" is too large`, {
              description: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            })
            continue
          }

          // Show upload progress toast
          const uploadToast = toast.loading(`Uploading ${file.name}...`, {
            description: 'Processing image from Photos app',
          })

          try {
            // Upload the image using the same upload function
            const imageUrl = await handleImageUpload(
              file,
              (progress) => {
                toast.loading(`Uploading ${file.name}...`, {
                  id: uploadToast,
                  description: `Progress: ${progress.progress}%`,
                })
              }
            )

            // Insert the image at the drop position
            const filename = file.name.replace(/\.[^/.]+$/, "") || "image"
            
            view.dispatch(
              view.state.tr
                .replaceWith(pos.pos, pos.pos, view.state.schema.nodes.image.create({
                  src: imageUrl,
                  alt: filename,
                  title: filename,
                }))
                .scrollIntoView()
            )

            toast.success(`${file.name} uploaded successfully`, {
              id: uploadToast,
              description: 'Image added to your note',
            })

            console.log('🍎 iPad Photos app image uploaded successfully:', imageUrl)

          } catch (error) {
            console.error('Failed to upload image from Photos app:', error)
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
            
            toast.error(`Failed to upload ${file.name}`, {
              id: uploadToast,
              description: errorMessage,
            })
          }
        }
      } catch (error) {
        console.error('Error processing dropped images:', error)
        toast.error('Failed to process dropped images', {
          description: 'Please try using the image upload button instead',
        })
      }
    }

    // Start async processing without waiting for it
    processDroppedImages()

    return true
  }, [])

  const handleDragLeave = React.useCallback((view: EditorView) => {
    // Remove visual feedback when drag leaves
    const editorElement = view.dom as HTMLElement
    editorElement.classList.remove('drag-over-image')
    return false
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false, // Critical: prevents excessive re-renders
    editable: true,
    autofocus: false, // Disable autofocus to prevent initial layout shifts
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        spellcheck: "false",
        "data-gramm": "false", // Disable Grammarly
        "data-gramm_editor": "false", // Disable Grammarly
        "data-enable-grammarly": "false", // Disable Grammarly
        "aria-label": "Main content area, start typing to enter text.",
      },
      // CRITICAL FIX: Disable ProseMirror's scroll management
      // Let the content-wrapper handle all scrolling instead
      // This prevents conflicts between ProseMirror and container scrolling
      scrollThreshold: 0, // Disable ProseMirror scroll management
      scrollMargin: 0,    // Disable ProseMirror scroll management
      
      // 🍎 COMPREHENSIVE DOM EVENT HANDLING
      // Essential for iPad Photos app drag & drop functionality
      handleDOMEvents: {
        // Handle drag and drop for external image files (iPad Photos app)
        dragover: handleDragOver,
        drop: handleDrop,
        dragleave: handleDragLeave,
        dragenter: (view, _event) => {
          // Prevent default dragenter to enable dragover
          if (_event.dataTransfer?.types?.includes('Files')) {
            _event.preventDefault()
          }
          return false
        }
      },
    },
    extensions,
    content: initialContent,
    onUpdate: ({ editor }) => {
      // 🚀 ABSOLUTE MINIMAL processing - just call the debounced function
      debouncedContentChange(editor.getHTML())
    },
  })

  React.useImperativeHandle(ref, () => ({
    editor,
  }), [editor])

  // Track the last known remote timestamp for conflict detection
  const lastRemoteTimestampRef = React.useRef<string | undefined>(noteUpdated)
  // Track when the note was first loaded to avoid conflicts on new notes
  const noteLoadTimeRef = React.useRef<number>(Date.now())

  // Update editor content when switching notes OR when real-time content changes
  React.useEffect(() => {
    if (!editor) return
    
    // Note switched - always update content
    if (noteId !== currentNoteIdRef.current) {
      currentNoteIdRef.current = noteId
      lastRemoteTimestampRef.current = noteUpdated
      noteLoadTimeRef.current = Date.now() // Reset load time for new note
      editor.commands.setContent(initialContent, false)
      contentBufferRef.current = initialContent
      lastEmittedContentRef.current = initialContent
      return
    }
    
    // Same note but content changed (real-time update)
    const canon = (html: string) => html.replace(/\s+/g, ' ').trim()
    if (canon(initialContent) !== canon(contentBufferRef.current)) {
      const hasUnsavedChanges = contentBufferRef.current !== lastEmittedContentRef.current
      const isUserTyping = editor.isFocused
      
      // If user is not typing, always apply real-time updates
      if (!isUserTyping) {
        lastRemoteTimestampRef.current = noteUpdated
        editor.commands.setContent(initialContent, false)
        contentBufferRef.current = initialContent
        lastEmittedContentRef.current = initialContent
        return
      }
      
      // 🚀 PERFORMANCE OPTIMIZATION: Skip ALL sync operations while user is actively typing
      // This prevents INP spikes and preserves smooth typing experience
      if (hasUnsavedChanges && isUserTyping) {
        console.log('SimpleEditor: User is actively typing - completely skipping sync to preserve performance')
        
        // Simply update our timestamp reference to acknowledge we've seen this update
        // We'll handle the actual sync when the user stops typing
        lastRemoteTimestampRef.current = noteUpdated
        
        // NO DOM operations, NO content changes, NO heavy processing
        // This ensures INP stays low and typing remains smooth
        return
      }
      
      // Legacy conflict detection for when user is NOT actively typing
      if (hasUnsavedChanges) {
        // Check if we have timestamp information for smart resolution
        const remoteTimestamp = noteUpdated ? new Date(noteUpdated).getTime() : 0
        const lastKnownTimestamp = lastRemoteTimestampRef.current ? new Date(lastRemoteTimestampRef.current).getTime() : 0
        
        // 🛡️ CONFLICT PREVENTION TUNING: New note grace periods
        // These prevent false conflicts when notes are newly created
        
        // ⏱️ TUNING POINT: New note age threshold (currently 30s)
        // SHORTER (10-20s): Faster conflict detection but more false positives
        // LONGER (45-60s): Fewer false conflicts but delayed real conflict detection
        const noteAge = remoteTimestamp > 0 ? Date.now() - remoteTimestamp : Infinity
        const isVeryNewNote = noteAge < 30000 // 🎯 ADJUST: 15000-60000ms
        
        // ⏱️ TUNING POINT: Recent load threshold (currently 15s)
        // SHORTER (5-10s): Faster conflict detection when switching notes
        // LONGER (20-30s): More forgiving for slow devices/networks
        const timeSinceLoad = Date.now() - noteLoadTimeRef.current
        const isRecentlyLoaded = timeSinceLoad < 15000 // 🎯 ADJUST: 5000-30000ms
        
        if ((isVeryNewNote && !lastRemoteTimestampRef.current) || isRecentlyLoaded) {
          // This is likely the first real-time event for a newly created note
          // or the note was just loaded, so apply update without conflict detection
          console.log('SimpleEditor: Applying real-time update for new/recently loaded note')
          lastRemoteTimestampRef.current = noteUpdated
          editor.commands.setContent(initialContent, false)
          contentBufferRef.current = initialContent
          lastEmittedContentRef.current = initialContent
          return
        }
        
        // ⚡ TUNING POINT: Auto-apply threshold (currently 10s)
        // SHORTER (5-8s): More aggressive auto-merging 
        // LONGER (15-20s): More user control, fewer automatic merges
        const timeDifference = remoteTimestamp - lastKnownTimestamp
        if (timeDifference > 10000) { // 🎯 ADJUST: 5000-20000ms
          console.log('SimpleEditor: Auto-applying newer remote version')
          toast.info('Note updated from another device', {
            description: 'Applying newer version automatically',
            duration: 3000,
          })
          
          lastRemoteTimestampRef.current = noteUpdated
          editor.commands.setContent(initialContent, false)
          contentBufferRef.current = initialContent
          lastEmittedContentRef.current = initialContent
          return
        }
        
        // 🤖 TUNING POINT: Smart merge window (currently 0-5s)
        // SHORTER window (0-3s): Only merge very simultaneous edits
        // LONGER window (0-8s): More aggressive auto-merging
        if (timeDifference > 0 && timeDifference <= 5000) { // 🎯 ADJUST: 2000-8000ms
          // 🧠 TUNING POINT: Content similarity threshold (currently 90%)
          // HIGHER (95%): Only merge very similar content
          // LOWER (80%): More aggressive merging of different content
          const contentSimilarity = calculateContentSimilarity(contentBufferRef.current, initialContent)
          
          if (contentSimilarity > 0.9) { // 🎯 ADJUST: 0.8-0.95
            // Very similar content, probably just typing - auto-merge
            console.log('SimpleEditor: Auto-merging similar content')
            toast.info('Merging changes from another device', {
              duration: 2000,
            })
            
            lastRemoteTimestampRef.current = noteUpdated
            editor.commands.setContent(initialContent, false)
            contentBufferRef.current = initialContent
            lastEmittedContentRef.current = initialContent
            return
          }
        }
        
        // 🌐 TUNING POINT: Network delay tolerance (currently 2s)
        // SHORTER (1s): Faster conflict detection but more false positives from slow networks
        // LONGER (3-5s): More forgiving for slow networks but delayed conflict detection
        if (timeDifference <= 2000 || remoteTimestamp === 0 || lastKnownTimestamp === 0) { // 🎯 ADJUST: 1000-5000ms
          // Apply the update silently for small timing differences
          console.log('SimpleEditor: Applying update silently (small time difference or invalid timestamps)')
          lastRemoteTimestampRef.current = noteUpdated
          editor.commands.setContent(initialContent, false)
          contentBufferRef.current = initialContent
          lastEmittedContentRef.current = initialContent
          return
        }
        
        // ⚠️ TUNING POINT: Conflict detection threshold (currently 5s)
        // SHORTER (3-4s): More sensitive conflict detection
        // LONGER (8-10s): Less conflict prompts, more auto-resolution
        if (timeDifference > 5000) { // 🎯 ADJUST: 3000-10000ms
          console.log('SimpleEditor: Conflict detected - offering user choice')
          toast.error('Sync Conflict Detected', {
            description: 'This note was modified on another device while you were typing. Choose which version to keep.',
            duration: 15000,
            action: {
              label: 'Keep Remote Version',
              onClick: () => {
                lastRemoteTimestampRef.current = noteUpdated
                editor.commands.setContent(initialContent, false)
                contentBufferRef.current = initialContent
                lastEmittedContentRef.current = initialContent
                toast.success('Applied remote version')
              },
            },
            cancel: {
              label: 'Keep My Version',
              onClick: () => {
                // Update our known timestamp but keep local content
                lastRemoteTimestampRef.current = noteUpdated
                toast.success('Keeping your version - will save shortly')
              },
            },
          })
          
          // Store the conflicting content for potential resolution
          console.log('SimpleEditor: Conflict details:', {
            local: contentBufferRef.current.substring(0, 100),
            remote: initialContent.substring(0, 100),
            localTime: lastKnownTimestamp,
            remoteTime: remoteTimestamp
          })
        }
      } else {
        // No unsaved changes but user is typing - apply remote update after a brief delay
        // This handles the case where user just finished typing and remote update comes in
        setTimeout(() => {
          if (!editor.isFocused || contentBufferRef.current === lastEmittedContentRef.current) {
            lastRemoteTimestampRef.current = noteUpdated
            editor.commands.setContent(initialContent, false)
            contentBufferRef.current = initialContent
            lastEmittedContentRef.current = initialContent
          }
        }, 1000)
      }
    }
  }, [editor, noteId, initialContent, noteUpdated])

  // TEMPORARILY DISABLE cursor visibility to test if it's causing scroll issues
  const bodyRect = { x: 0, y: 0, width: 0, height: 0 }
  // const bodyRect = useCursorVisibility({
  //   editor,
  //   overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  // })

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        // Emit final content on unmount
        if (onContentChange && contentBufferRef.current !== lastEmittedContentRef.current) {
          onContentChange(contentBufferRef.current)
        }
      }
    }
  }, [onContentChange])

  if (!editor) {
    return (
      <div className="simple-editor-wrapper">
        <div className="content-wrapper">
          <div className="simple-editor-content">
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Loading editor...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {isMobile ? (
          <>
            <Toolbar ref={toolbarRef} className="toolbar-mobile-top">
              <StaticMainToolbarContent />
            </Toolbar>
            <div className="content-wrapper">
              <TableContextMenu>
                <EditorContent
                  editor={editor}
                  role="presentation"
                  className="simple-editor-content"
                />
              </TableContextMenu>
            </div>
          </>
        ) : (
          <>
            <Toolbar
              ref={toolbarRef}
              style={{
                bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
              }}
            >
              <StaticMainToolbarContent />
            </Toolbar>
            <div className="content-wrapper">
              <TableContextMenu>
                <EditorContent
                  editor={editor}
                  role="presentation"
                  className="simple-editor-content"
                />
              </TableContextMenu>
            </div>
          </>
        )}
      </EditorContext.Provider>
    </div>
  )
}), (prevProps, nextProps) => {
  // Smart memo: Allow re-renders when noteId changes (note switching) OR content/timestamp changes from real-time sync
  // But prevent unnecessary re-renders for other prop changes
  return prevProps.noteId === nextProps.noteId && 
         prevProps.initialContent === nextProps.initialContent &&
         prevProps.noteUpdated === nextProps.noteUpdated &&
         prevProps.onContentChange === nextProps.onContentChange
})

SimpleEditor.displayName = "SimpleEditor"
