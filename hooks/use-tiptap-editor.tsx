'use client'

import * as React from 'react'
import type { Editor } from '@tiptap/react'

/**
 * TipTap Editor Context
 * =====================
 * 
 * Provides the TipTap editor instance to nested components.
 */

interface TiptapEditorContextValue {
    editor: Editor | null
}

const TiptapEditorContext = React.createContext<TiptapEditorContextValue | null>(null)

export function TiptapEditorProvider({
    editor,
    children,
}: {
    editor: Editor | null
    children: React.ReactNode
}) {
    const value = React.useMemo(() => ({ editor }), [editor])
    return (
        <TiptapEditorContext.Provider value={value}>
            {children}
        </TiptapEditorContext.Provider>
    )
}

/**
 * useTiptapEditor hook
 * 
 * Returns the editor from context or the provided editor.
 * If a provided editor is given, it takes precedence over context.
 */
export function useTiptapEditor(providedEditor?: Editor | null): Editor | null {
    const context = React.useContext(TiptapEditorContext)

    // If an editor is explicitly provided, use it
    if (providedEditor !== undefined) {
        return providedEditor
    }

    // Otherwise, use the editor from context
    return context?.editor ?? null
}

export { TiptapEditorContext }
