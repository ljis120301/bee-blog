/**
 * TipTap Utilities
 * =================
 * 
 * Helper functions for the TipTap editor.
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadProgress {
    progress: number;
}

type ProgressCallback = (progress: UploadProgress) => void;

/**
 * Upload an image file and return the URL
 */
export async function handleImageUpload(
    file: File,
    onProgress?: ProgressCallback
): Promise<string> {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    // Simulate initial progress
    onProgress?.({ progress: 10 });

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);

    onProgress?.({ progress: 30 });

    const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
    });

    onProgress?.({ progress: 90 });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();

    onProgress?.({ progress: 100 });

    return data.url;
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:', 'data:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Extract plain text from HTML
 */
export function htmlToText(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

/**
 * Check if a node type exists in the editor's schema
 */
export function isNodeInSchema(nodeName: string, editor: import('@tiptap/react').Editor | null): boolean {
    if (!editor) return false;
    return editor.extensionManager?.extensions?.some(
        (ext) => ext.name === nodeName
    ) ?? false;
}

/**
 * Check if a mark type exists in the editor's schema
 */
export function isMarkInSchema(markName: string, editor: import('@tiptap/react').Editor | null): boolean {
    if (!editor) return false;
    return !!editor.schema?.marks?.[markName];
}

/**
 * Check if a node is empty
 */
export function isEmptyNode(node: unknown): boolean {
    if (!node || typeof node !== 'object') return true;
    const n = node as { content?: { size?: number }; textContent?: string };
    if (n.content && typeof n.content.size === 'number') {
        return n.content.size === 0;
    }
    if (typeof n.textContent === 'string') {
        return n.textContent.trim().length === 0;
    }
    return true;
}

/**
 * Find the position of a node in the editor
 */
/**
 * Find the position of a node in the editor
 */
export function findNodePosition(editor: import('@tiptap/react').Editor | null, nodeType: string): number | null;
export function findNodePosition(args: { editor: import('@tiptap/react').Editor | null; node: import('@tiptap/pm/model').Node }): { pos: number } | null;
export function findNodePosition(
    editorOrArgs: import('@tiptap/react').Editor | null | { editor: import('@tiptap/react').Editor | null; node: import('@tiptap/pm/model').Node },
    nodeType?: string
): number | { pos: number } | null {
    if (!editorOrArgs) return null;

    // Handle object argument style
    if ('node' in editorOrArgs) {
        const { editor, node } = editorOrArgs;
        if (!editor || !node) return null;

        let found: { pos: number } | null = null;
        editor.state.doc.descendants((descendant, pos) => {
            if (found) return false;
            if (descendant === node) {
                found = { pos };
                return false;
            }
            return true;
        });
        return found;
    }

    // Handle standard style
    const editor = editorOrArgs as import('@tiptap/react').Editor;
    if (!editor || !nodeType) return null;

    let foundPos: number | null = null;
    editor.state.doc.descendants((node, pos) => {
        if (foundPos !== null) return false;
        if (node.type.name === nodeType) {
            foundPos = pos;
            return false;
        }
        return true;
    });

    return foundPos;
}

/**
 * Get text color from editor selection
 */
export function getTextColor(editor: import('@tiptap/react').Editor | null): string | null {
    if (!editor) return null;
    const { color } = editor.getAttributes('textStyle');
    return color || null;
}

/**
 * Get highlight color from editor selection
 */
export function getHighlightColor(editor: import('@tiptap/react').Editor | null): string | null {
    if (!editor) return null;
    const { color } = editor.getAttributes('highlight');
    return color || null;
}

/**
 * Set text color
 */
export function setTextColor(editor: import('@tiptap/react').Editor | null, color: string): boolean {
    if (!editor) return false;
    return editor.chain().focus().setColor(color).run();
}

/**
 * Set highlight color
 */
export function setHighlightColor(editor: import('@tiptap/react').Editor | null, color: string): boolean {
    if (!editor) return false;
    return editor.chain().focus().setHighlight({ color }).run();
}

/**
 * Remove text color
 */
export function removeTextColor(editor: import('@tiptap/react').Editor | null): boolean {
    if (!editor) return false;
    return editor.chain().focus().unsetColor().run();
}

/**
 * Remove highlight color
 */
export function removeHighlightColor(editor: import('@tiptap/react').Editor | null): boolean {
    if (!editor) return false;
    return editor.chain().focus().unsetHighlight().run();
}

/**
 * Get current font family from editor
 */
export function getFontFamily(editor: import('@tiptap/react').Editor | null): string | null {
    if (!editor) return null;
    const { fontFamily } = editor.getAttributes('textStyle');
    return fontFamily || null;
}

/**
 * Set font family
 */
export function setFontFamily(editor: import('@tiptap/react').Editor | null, fontFamily: string): boolean {
    if (!editor) return false;
    return editor.chain().focus().setFontFamily(fontFamily).run();
}

/**
 * Remove font family
 */
export function removeFontFamily(editor: import('@tiptap/react').Editor | null): boolean {
    if (!editor) return false;
    return editor.chain().focus().unsetFontFamily().run();
}
