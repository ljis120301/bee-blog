"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { FontFamilyIcon } from "@/components/tiptap-icons/font-family-icon"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

// --- Tiptap UI ---
import {
  FontFamilyButton,
  fontFamilyOptions,
  getActiveFontFamily,
  canApplyFontFamily,
} from "@/components/tiptap-ui/font-family-button/font-family-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

export interface FontFamilyDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

// Memoized font family option component to prevent re-renders
const FontFamilyOption = React.memo(({ 
  option, 
  editor 
}: { 
  option: typeof fontFamilyOptions[0], 
  editor: Editor | null 
}) => (
  <DropdownMenuItem key={`font-${option.value}`} asChild>
    <FontFamilyButton
      editor={editor}
      fontFamily={option.value}
      text={option.label}
      tooltip=""
      style={{ fontFamily: option.cssFamily }}
    />
  </DropdownMenuItem>
))

FontFamilyOption.displayName = "FontFamilyOption"

export function FontFamilyDropdownMenu({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: FontFamilyDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)

  const textStyleInSchema = React.useMemo(() => 
    isMarkInSchema("textStyle", editor), 
    [editor]
  )

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  // Memoize active font calculation to prevent recalculation on every render
  const activeFontInfo = React.useMemo(() => {
    if (!editor) return { activeFont: "default", activeLabel: "Font", hasActiveFont: false }

    const activeFont = getActiveFontFamily(editor)
    const activeOption = fontFamilyOptions.find(opt => opt.value === activeFont)
    
    return {
      activeFont,
      activeLabel: activeOption?.label || "Font",
      hasActiveFont: activeFont !== "default"
    }
  }, [editor]) // Only recalculate when editor changes

  const isDisabled = React.useMemo(() => 
    !canApplyFontFamily(editor), 
    [editor] // Only recalculate when editor changes
  )

  const shouldShow = React.useMemo(() => {
    if (!textStyleInSchema || !editor) {
      return false
    }

    if (hideWhenUnavailable && !canApplyFontFamily(editor)) {
      return false
    }

    return true
  }, [textStyleInSchema, editor, hideWhenUnavailable])

  // Memoize font options to prevent re-creation
  const renderedOptions = React.useMemo(() => 
    fontFamilyOptions.map((option) => (
      <FontFamilyOption
        key={option.value}
        option={option}
        editor={editor}
      />
    )), 
    [editor]
  )

  if (!shouldShow || !editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          disabled={isDisabled}
          data-style="ghost"
          data-active-state={activeFontInfo.hasActiveFont ? "on" : "off"}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Change font family"
          aria-pressed={activeFontInfo.hasActiveFont}
          tooltip="Font Family"
          {...props}
        >
          <FontFamilyIcon className="tiptap-button-icon" />
          <span className="tiptap-button-text">{activeFontInfo.activeLabel}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="start">
        <DropdownMenuGroup>
          {renderedOptions}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default React.memo(FontFamilyDropdownMenu, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.editor === nextProps.editor &&
    prevProps.hideWhenUnavailable === nextProps.hideWhenUnavailable &&
    prevProps.onOpenChange === nextProps.onOpenChange
  )
}) 