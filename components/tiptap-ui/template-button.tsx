"use client"

import { useState, useCallback, memo } from 'react'
import { useTiptapEditor } from '@/hooks/use-tiptap-editor'
import { Button } from '@/components/tiptap-ui-primitive/button'
import { FileText, Sparkles } from 'lucide-react'
import { TemplatePicker } from '@/components/template-picker'
import { Template } from '@/lib/pocketbase'
import { toast } from 'sonner'

interface TemplateButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor?: any // TipTap editor instance
  text?: string
  className?: string
}

function TemplateButtonComponent({ editor: providedEditor, text = 'Templates', className }: TemplateButtonProps) {
  const editor = useTiptapEditor(providedEditor)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  
  const handleSelectTemplate = useCallback((template: Template) => {
    if (!editor) {
      console.warn('No editor available for template insertion')
      toast.error('Editor not available')
      return
    }

    try {
      // Check if we should replace content or insert at cursor
      const shouldReplaceAll = editor.isEmpty
      
      if (shouldReplaceAll) {
        // Editor is empty, replace all content
        editor
          .chain()
          .focus()
          .setContent(template.content || '')
          .run()
        
        toast.success(`Template "${template.name}" applied`)
      } else {
        // Editor has content, ask user what to do
        const replaceAll = confirm(
          `Do you want to replace all current content with the template "${template.name}"?\n\n` +
          'Click "OK" to replace all content, or "Cancel" to insert at cursor position.'
        )
        
        if (replaceAll) {
          // Replace all content
          editor
            .chain()
            .focus()
            .setContent(template.content || '')
            .run()
          
          toast.success(`Content replaced with template "${template.name}"`)
        } else {
          // Insert at cursor position
          editor
            .chain()
            .focus()
            .insertContent(template.content || '')
            .run()
          
          toast.success(`Template "${template.name}" inserted`)
        }
      }
      
      // Set focus back to editor after a short delay
      setTimeout(() => {
        editor?.commands.focus()
      }, 100)
      
    } catch (error) {
      console.error('Failed to apply template:', error)
      toast.error('Failed to apply template')
    }
  }, [editor])

  const handleOpenTemplatePicker = useCallback(() => {
    setShowTemplatePicker(true)
  }, [])

  const handleCloseTemplatePicker = useCallback((open: boolean) => {
    setShowTemplatePicker(open)
  }, [])

  return (
    <>
      <Button
        onClick={handleOpenTemplatePicker}
        data-style="default"
        className={className}
        disabled={!editor}
        tooltip="Insert template"
      >
        {text === 'Templates' ? (
          <>
            <Sparkles className="tiptap-button-icon" />
            <span className="tiptap-button-text">{text}</span>
          </>
        ) : (
          <>
            <FileText className="tiptap-button-icon" />
            <span className="tiptap-button-text">{text}</span>
          </>
        )}
      </Button>

      <TemplatePicker
        open={showTemplatePicker}
        onOpenChange={handleCloseTemplatePicker}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  )
}

export const TemplateButton = memo(TemplateButtonComponent) 