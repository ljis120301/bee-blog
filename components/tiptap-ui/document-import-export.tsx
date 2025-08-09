"use client"

import * as React from "react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Button as UIButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { cn } from "@/lib/tiptap-utils"
import { toast } from "sonner"
import { 
  Download, 
  Upload, 
  FileText, 
  FileImage, 
  File, 
  CheckCircle,
  ChevronDown,
  FolderOpen
} from "lucide-react"

interface DocumentImportExportProps {
  className?: string
}

type ExportFormat = 'pdf' | 'docx' | 'markdown' | 'html' | 'json'

const exportFormatConfig = {
  pdf: { label: 'PDF', icon: FileText, description: 'Portable Document Format' },
  docx: { label: 'Word (RTF)', icon: FileImage, description: 'Rich Text Format (opens in Word)' },
  markdown: { label: 'Markdown', icon: File, description: 'Markdown Text File' },
  html: { label: 'HTML', icon: File, description: 'HTML Web Page' },
  json: { label: 'JSON', icon: File, description: 'Tiptap JSON Format' }
}

const importFormatConfig = {
  docx: { label: 'Word (.docx)', extensions: ['.docx'], description: 'Microsoft Word Document' },
  markdown: { label: 'Markdown (.md)', extensions: ['.md', '.markdown'], description: 'Markdown Text File' },
  html: { label: 'HTML (.html)', extensions: ['.html', '.htm'], description: 'HTML Web Page' },
  json: { label: 'JSON (.json)', extensions: ['.json'], description: 'Tiptap JSON Format' },
  txt: { label: 'Text (.txt)', extensions: ['.txt'], description: 'Plain Text File' }
}

export function DocumentImportExport({ className }: DocumentImportExportProps) {
  const editor = useTiptapEditor()
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false)
  const [importProgress, setImportProgress] = React.useState(0)
  const [isImporting, setIsImporting] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [exportingFormat, setExportingFormat] = React.useState<ExportFormat | null>(null)
  const [exportProgress, setExportProgress] = React.useState(0)
  const [isExportDropdownOpen, setIsExportDropdownOpen] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleExport = React.useCallback(async (format: ExportFormat) => {
    if (!editor) {
      toast.error('Editor not available')
      return
    }

    console.log(`🔄 Starting export for format: ${format}`)
    
    // Set immediate loading states
    setIsExporting(true)
    setExportingFormat(format)
    setExportProgress(0)
    
    // Create unique toast ID for this export
    const toastId = `export-${format}-${Date.now()}`
    
    try {
      // Show initial loading toast
      toast.loading(`Exporting to ${format.toUpperCase()}...`, {
        id: toastId,
        description: 'Preparing document...'
      })
      
      // Start with immediate feedback
      setExportProgress(5)
      
      console.log(`🔄 Calling editor.commands.exportDocument(${format})`)
      
      // Call the export command (this will trigger the actual PDF generation)
      const success = editor.commands.exportDocument(format)
      
      if (!success) {
        throw new Error(`Export command failed for ${format}`)
      }
      
      // Set up realistic progress tracking for PDF generation
      let currentProgress = 10
      setExportProgress(10)
      
      const progressInterval = setInterval(() => {
        // Increment progress gradually, but don't complete until we're sure
        currentProgress += Math.random() * 8 + 2 // 2-10% increments
        
        // Cap progress at 90% until we're ready to complete
        if (currentProgress > 90) {
          currentProgress = 90
        }
        
        setExportProgress(currentProgress)
        
        // Update toast descriptions based on progress
        let description = 'Processing content...'
        if (currentProgress >= 25 && currentProgress < 50) {
          description = 'Generating document...'
        } else if (currentProgress >= 50 && currentProgress < 75) {
          description = 'Rendering PDF...'
        } else if (currentProgress >= 75) {
          description = 'Finalizing export...'
        }
        
        // Only update description, don't recreate the toast
        toast.loading(`Exporting to ${format.toUpperCase()}... ${currentProgress.toFixed(0)}%`, {
          id: toastId,
          description
        })
      }, 400) // Slower updates for more realistic feel
      
      // For PDF, give it more time as it involves Puppeteer
      const expectedDuration = format === 'pdf' ? 6000 : 3000
      
      console.log(`⏱️ Setting expected duration for ${format}: ${expectedDuration}ms`)
      
      // Wait for expected duration, then complete
      setTimeout(() => {
        console.log(`🏁 Completing export for ${format}`)
        
        // CRITICAL: Clear interval first to stop toast updates
        clearInterval(progressInterval)
        
        // CRITICAL: Dismiss the loading toast explicitly before showing success
        toast.dismiss(toastId)
        
        // Complete the progress
        setExportProgress(100)
        
        // Small delay to ensure the loading toast is dismissed, then show success
        setTimeout(() => {
          toast.success(`Document exported as ${format.toUpperCase()}`, {
            id: toastId,
            description: 'Download should start automatically',
            duration: 3000 // Explicit duration to ensure it dismisses
          })
          
          console.log(`✅ Export completed successfully for ${format}`)
        }, 100)
        
        // Reset states after a brief delay to show completion
        setTimeout(() => {
          console.log(`🧹 Cleaning up states for ${format} export`)
          setIsExporting(false)
          setExportingFormat(null)
          setExportProgress(0)
          setIsExportDropdownOpen(false)
        }, 1500)
      }, expectedDuration)
      
    } catch (error) {
      console.error('Export failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // CRITICAL: Dismiss the loading toast first
      toast.dismiss(toastId)
      
      // Small delay then show error toast
      setTimeout(() => {
        toast.error(`Export failed: ${errorMessage}`, {
          id: toastId,
          description: 'Please try again',
          duration: 5000 // Explicit duration
        })
      }, 100)
      
      // Reset states immediately on error
      setIsExporting(false)
      setExportingFormat(null)
      setExportProgress(0)
      setIsExportDropdownOpen(false)
    }
  }, [editor])

  const handleFileSelect = React.useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !editor) return

    const file = files[0]
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    const isValidType = Object.values(importFormatConfig).some(config =>
      config.extensions.some(ext => ext === `.${fileExtension}`)
    )

    if (!isValidType) {
      toast.error(`Unsupported file format: .${fileExtension}`)
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setIsImportDialogOpen(true)

    const toastId = `import-${Date.now()}`

    try {
      // Show initial loading toast
      toast.loading(`Importing ${file.name}...`, {
        id: toastId,
        description: 'Processing file...'
      })

      // Start with immediate feedback
      setImportProgress(10)

      // Call the extension's import command
      const success = editor.commands.importDocument(file)
      
      if (!success) {
        throw new Error('Import command failed')
      }

      // Set up progress tracking
      let currentProgress = 20
      setImportProgress(20)
      
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15 + 5 // 5-20% increments
        
        if (currentProgress > 90) {
          currentProgress = 90
        }
        
        setImportProgress(currentProgress)
        
        // Update toast descriptions
        let description = 'Reading file content...'
        if (currentProgress >= 40 && currentProgress < 70) {
          description = 'Converting to editor format...'
        } else if (currentProgress >= 70) {
          description = 'Applying content...'
        }
        
        toast.loading(`Importing ${file.name}... ${currentProgress.toFixed(0)}%`, {
          id: toastId,
          description
        })
      }, 300)

      // Complete import after realistic duration
      setTimeout(() => {
        // Clear interval first
        clearInterval(progressInterval)
        
        // Dismiss loading toast
        toast.dismiss(toastId)
        
        setImportProgress(100)
        
        // Show success toast after small delay
        setTimeout(() => {
          toast.success('Document imported successfully', {
            id: toastId,
            description: 'Content has been added to the editor',
            duration: 3000
          })
        }, 100)
        
        // Reset states
        setTimeout(() => {
          setIsImporting(false)
          setIsImportDialogOpen(false)
          setImportProgress(0)
        }, 1500)
      }, 2000)

    } catch (error) {
      setIsImporting(false)
      setImportProgress(0)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Dismiss loading toast first
      toast.dismiss(toastId)
      
      // Show error toast after delay
      setTimeout(() => {
        toast.error(`Import failed: ${errorMessage}`, {
          id: toastId,
          description: 'Please check the file format and try again',
          duration: 5000
        })
      }, 100)
      
      console.error('Import failed:', error)
    }
  }, [editor])

  const handleDragEnter = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [handleFileSelect])

  const handleFileInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    e.target.value = ''
  }, [handleFileSelect])

  const triggerFileInput = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn("flex gap-1", className)}>
      {/* Export Dropdown */}
      <DropdownMenu 
        open={isExportDropdownOpen} 
        onOpenChange={(open) => {
          // Don't allow closing dropdown during export
          if (isExporting && !open) return
          setIsExportDropdownOpen(open)
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            data-style="ghost"
            className={cn(
              "h-8 px-3 gap-2",
              isExporting && "cursor-wait opacity-70"
            )}
            tooltip={isExporting ? `Exporting... ${exportProgress.toFixed(0)}%` : "Export document"}
            disabled={isExporting}
            onClick={() => !isExporting && setIsExportDropdownOpen(true)}
          >
            <Download className={cn(
              "h-4 w-4", 
              isExporting && "animate-pulse"
            )} />
            <span className="tiptap-button-text">
              {isExporting ? `${exportProgress.toFixed(0)}%` : "Export"}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Document</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(exportFormatConfig).map(([format, config]) => {
            const Icon = config.icon
            const isThisFormatExporting = isExporting && exportingFormat === format
            return (
              <DropdownMenuItem
                key={format}
                onClick={() => !isExporting && handleExport(format as ExportFormat)}
                className={cn(
                  "cursor-pointer",
                  isExporting && "opacity-50 cursor-not-allowed",
                  isThisFormatExporting && "bg-muted"
                )}
                disabled={isExporting}
              >
                <Icon className={cn(
                  "h-4 w-4 mr-2",
                  isThisFormatExporting && "animate-pulse text-primary"
                )} />
                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium",
                    isThisFormatExporting && "text-primary"
                  )}>
                    {config.label}
                    {isThisFormatExporting && ` (${exportProgress.toFixed(0)}%)`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isThisFormatExporting ? "Exporting..." : config.description}
                  </span>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Button */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button
            data-style="ghost"
            className={cn(
              "h-8 px-3 gap-2",
              isImporting && "cursor-wait opacity-70"
            )}
            tooltip="Import document"
            disabled={isImporting}
          >
            <Upload className={cn(
              "h-4 w-4",
              isImporting && "animate-pulse text-primary"
            )} />
            <span className="tiptap-button-text">Import</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Document</DialogTitle>
            <DialogDescription>
              Select a file to import into the editor
            </DialogDescription>
          </DialogHeader>
          
          {!isImporting ? (
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <FolderOpen className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports DOCX, Markdown, HTML, JSON, and TXT files (max 10MB)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Supported Formats:</h4>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(importFormatConfig).map(([format, config]) => (
                    <div
                      key={format}
                      className="flex items-center gap-3 p-2 rounded-md border bg-background"
                    >
                      <File className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{config.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {config.extensions.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-primary animate-pulse" />
                <DialogDescription className="text-base">
                  Importing your document...
                </DialogDescription>
              </div>
              <Progress value={importProgress} className="w-full" />
              <div className="text-center text-sm text-muted-foreground">
                {importProgress}% complete
              </div>
            </div>
          )}

          {!isImporting && importProgress === 100 && (
            <DialogFooter>
              <UIButton onClick={() => {
                setIsImportDialogOpen(false)
                setImportProgress(0)
              }}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Done
              </UIButton>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".docx,.md,.markdown,.html,.htm,.json,.txt"
        onChange={handleFileInputChange}
      />
    </div>
  )
} 