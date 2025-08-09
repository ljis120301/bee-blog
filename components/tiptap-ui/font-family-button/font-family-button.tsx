"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { FontFamilyIcon } from "@/components/tiptap-icons/font-family-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

export type FontFamily = 
  | "default"
  | "inter" 
  | "dm-sans"
  | "open-sans"
  | "roboto"
  | "playfair"
  | "source-sans"
  | "lora"
  | "poppins"
  | "merriweather"
  | "mono"

export interface FontFamilyOption {
  value: FontFamily
  label: string
  cssFamily: string
  preview?: string
}

export const fontFamilyOptions: FontFamilyOption[] = [
  { value: "default", label: "Default", cssFamily: "inherit", preview: "Aa" },
  { value: "inter", label: "Inter", cssFamily: "var(--font-inter)", preview: "Aa" },
  { value: "dm-sans", label: "DM Sans", cssFamily: "var(--font-dm-sans)", preview: "Aa" },
  { value: "open-sans", label: "Open Sans", cssFamily: "var(--font-open-sans)", preview: "Aa" },
  { value: "roboto", label: "Roboto", cssFamily: "var(--font-roboto)", preview: "Aa" },
  { value: "playfair", label: "Playfair Display", cssFamily: "var(--font-playfair)", preview: "Aa" },
  { value: "source-sans", label: "Source Sans Pro", cssFamily: "var(--font-source-sans)", preview: "Aa" },
  { value: "lora", label: "Lora", cssFamily: "var(--font-lora)", preview: "Aa" },
  { value: "poppins", label: "Poppins", cssFamily: "var(--font-poppins)", preview: "Aa" },
  { value: "merriweather", label: "Merriweather", cssFamily: "var(--font-merriweather)", preview: "Aa" },
  { value: "mono", label: "Monospace", cssFamily: "var(--font-mono)", preview: "Aa" },
]

export interface FontFamilyButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null
  /**
   * The font family to apply.
   */
  fontFamily: FontFamily
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Whether the button should hide when font family is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the font family is applied.
   */
  onApplied?: (fontFamily: FontFamily) => void
}

/**
 * Checks if the font family can be applied to the current selection.
 */
export function canApplyFontFamily(editor: Editor | null): boolean {
  if (!editor) return false

  try {
    return editor.can().setFontFamily("Arial") // Test with any font
  } catch {
    return false
  }
}

/**
 * Applies the specified font family to the current selection.
 */
export function setFontFamily(editor: Editor | null, fontFamily: FontFamily): void {
  if (!editor) return

  const option = fontFamilyOptions.find(opt => opt.value === fontFamily)
  if (!option) return

  if (fontFamily === "default") {
    editor.chain().focus().unsetFontFamily().run()
  } else {
    editor.chain().focus().setFontFamily(option.cssFamily).run()
  }
}

/**
 * Gets the currently active font family.
 */
export function getActiveFontFamily(editor: Editor | null): FontFamily {
  if (!editor) return "default"

  const currentFontFamily = editor.getAttributes("textStyle").fontFamily

  if (!currentFontFamily) return "default"

  const activeOption = fontFamilyOptions.find(
    opt => opt.cssFamily === currentFontFamily
  )

  return activeOption?.value || "default"
}

/**
 * Hook for managing font family state.
 */
export function useFontFamilyState(
  editor: Editor | null,
  fontFamily: FontFamily,
  disabled: boolean = false,
  hideWhenUnavailable: boolean = false
) {
  const textStyleInSchema = isMarkInSchema("textStyle", editor)

  const isDisabled = React.useMemo(() => {
    return disabled || !canApplyFontFamily(editor)
  }, [editor, disabled])

  const isActive = React.useMemo(() => {
    return getActiveFontFamily(editor) === fontFamily
  }, [editor, fontFamily])

  const shouldShow = React.useMemo(() => {
    if (!textStyleInSchema || !editor) {
      return false
    }

    if (hideWhenUnavailable && !canApplyFontFamily(editor)) {
      return false
    }

    return true
  }, [textStyleInSchema, editor, hideWhenUnavailable])

  const option = React.useMemo(() => {
    return fontFamilyOptions.find(opt => opt.value === fontFamily)
  }, [fontFamily])

  return {
    textStyleInSchema,
    isDisabled,
    isActive,
    shouldShow,
    option,
  }
}

/**
 * FontFamilyButton component for TipTap editor
 */
export const FontFamilyButton = React.forwardRef<
  HTMLButtonElement,
  FontFamilyButtonProps
>(
  (
    {
      editor: providedEditor,
      fontFamily,
      text,
      hideWhenUnavailable = false,
      className = "",
      disabled,
      onClick,
      onApplied,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const editor = useTiptapEditor(providedEditor)
    const { isDisabled, isActive, shouldShow, option } = useFontFamilyState(
      editor,
      fontFamily,
      disabled,
      hideWhenUnavailable
    )

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)

        if (!e.defaultPrevented && !isDisabled && editor) {
          setFontFamily(editor, fontFamily)
          onApplied?.(fontFamily)
        }
      },
      [fontFamily, editor, isDisabled, onClick, onApplied]
    )

    if (!shouldShow || !editor || !editor.isEditable) {
      return null
    }

    return (
      <Button
        type="button"
        className={className.trim()}
        disabled={isDisabled}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={isDisabled}
        role="button"
        tabIndex={-1}
        aria-label={option?.label || fontFamily}
        aria-pressed={isActive}
        tooltip={option?.label || fontFamily}
        onClick={handleClick}
        style={option ? { fontFamily: option.cssFamily } : undefined}
        {...buttonProps}
        ref={ref}
      >
        {children || (
          <>
            <FontFamilyIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

FontFamilyButton.displayName = "FontFamilyButton" 