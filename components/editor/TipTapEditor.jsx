"use client";

import React, { useEffect, useRef } from "react";
import { Selection } from "@tiptap/pm/state";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Video from "./extensions/Video";
import TableManagementExtension from "./extensions/TableManagementExtension";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import "@/components/tiptap-node/table-node/table-node.scss";

export default function TipTapEditor({ value, onChange, onEditorReady, placeholder = "Write your post...", onRequestUpload, minHeightClass = "min-h-[300px]" }) {
  const lastHtmlRef = useRef(value || "");
  const isApplyingExternalRef = useRef(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TableManagementExtension.configure({ showHints: true, preventNestedTables: true }),
      Video,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert text-base max-w-none ${minHeightClass} focus:outline-none text-cat-frappe-base dark:text-cat-frappe-text`,
      },
      handleDOMEvents: {
        // Ensure right-click inside table sets the selection under the cursor
        contextmenu: (view, event) => {
          const e = event;
          const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });
          if (pos && typeof pos.pos === "number") {
            const resolved = view.state.doc.resolve(pos.pos);
            const tr = view.state.tr.setSelection(Selection.near(resolved));
            view.dispatch(tr);
          }
          return false;
        },
      },
      handlePaste: (view, event) => {
        if (!onRequestUpload) return false;
        const item = event.clipboardData?.items?.[0];
        if (item && item.kind === 'file') {
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) return true;
          // Ensure selection stays where paste occurred
          const selection = view.state.selection;
          if (selection) {
            view.dispatch(view.state.tr.setSelection(selection));
          }
          (async () => {
            try {
              const uploaded = await onRequestUpload(file);
              if (uploaded?.type?.startsWith('video/')) {
                const streamUrl = `/api/files?id=${uploaded.id}${uploaded.token ? `&token=${encodeURIComponent(uploaded.token)}` : ''}`;
                view.dispatch(view.state.tr);
                editor.chain().focus().setVideo({ src: streamUrl, type: uploaded.type }).run();
              } else if (uploaded?.type?.startsWith('image/')) {
                editor.chain().focus().setImage({ src: uploaded.url }).run();
              }
            } catch {}
          })();
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        if (!onRequestUpload) return false;
        const dt = event.dataTransfer;
        if (!dt || !dt.files || dt.files.length === 0) return false;
        event.preventDefault();
        const file = dt.files[0];
        // Set selection at drop position so insertion occurs exactly where dropped
        const coords = { left: event.clientX, top: event.clientY };
        const pos = view.posAtCoords(coords);
        if (pos && typeof pos.pos === 'number') {
          const resolved = view.state.doc.resolve(pos.pos);
          const tr = view.state.tr.setSelection(Selection.near(resolved));
          view.dispatch(tr);
        }
        (async () => {
          try {
            const uploaded = await onRequestUpload(file);
            if (uploaded?.type?.startsWith('video/')) {
              const streamUrl = `/api/files?id=${uploaded.id}${uploaded.token ? `&token=${encodeURIComponent(uploaded.token)}` : ''}`;
              editor.chain().focus().setVideo({ src: streamUrl, type: uploaded.type }).run();
            } else if (uploaded?.type?.startsWith('image/')) {
              editor.chain().focus().setImage({ src: uploaded.url }).run();
            }
          } catch {}
        })();
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastHtmlRef.current = html;
      onChange?.(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && typeof onEditorReady === "function") {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Apply external value changes into the editor when they differ
  useEffect(() => {
    if (!editor) return;
    if (typeof value !== "string") return;
    if (value === lastHtmlRef.current) return;
    try {
      isApplyingExternalRef.current = true;
      editor.commands.setContent(value, false);
      lastHtmlRef.current = value;
    } finally {
      isApplyingExternalRef.current = false;
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 rounded-md overflow-hidden bg-[#f8e8e0] dark:bg-cat-frappe-base relative">
      <Toolbar editor={editor} />
      <div className="p-3 sm:p-4 bg-[#f8e8e0] dark:bg-cat-frappe-base" onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); }}>
        <ContextMenu>
          <ContextMenuTrigger>
            <EditorContent editor={editor}
          onPaste={async (e) => {
            if (!onRequestUpload) return;
            const item = e.clipboardData?.items?.[0];
            if (item && item.kind === 'file') {
              e.preventDefault();
              const file = item.getAsFile();
              if (!file) return;
              try {
                const uploaded = await onRequestUpload(file);
                if (uploaded?.type?.startsWith('video/')) {
                  const streamUrl = `/api/files?id=${uploaded.id}${uploaded.token ? `&token=${encodeURIComponent(uploaded.token)}` : ''}`;
                  editor.chain().focus().setVideo({ src: streamUrl, type: uploaded.type }).run();
                } else if (uploaded?.type?.startsWith('image/')) {
                  editor.chain().focus().setImage({ src: uploaded.url }).run();
                }
              } catch {}
            }
          }}
          onDrop={async (e) => {
          if (!onRequestUpload) return;
          const dt = e.dataTransfer;
          if (!dt || !dt.files || dt.files.length === 0) return;
          e.preventDefault();
            const file = dt.files[0];
            try {
              const uploaded = await onRequestUpload(file);
              if (uploaded?.type?.startsWith('video/')) {
                const streamUrl = `/api/files?id=${uploaded.id}${uploaded.token ? `&token=${encodeURIComponent(uploaded.token)}` : ''}`;
                editor.chain().focus().setVideo({ src: streamUrl, type: uploaded.type }).run();
              } else if (uploaded?.type?.startsWith('image/')) {
                editor.chain().focus().setImage({ src: uploaded.url }).run();
              }
            } catch {}
            }} />
          </ContextMenuTrigger>
          {editor?.isActive('table') && (
            <ContextMenuContent className="w-64 border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-[#F6EEE5] dark:bg-cat-frappe-base text-cat-frappe-base dark:text-cat-frappe-text shadow-lg">
              <ContextMenuSub>
                <ContextMenuSubTrigger className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50">Row Operations</ContextMenuSubTrigger>
                <ContextMenuSubContent className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-[#F6EEE5] dark:bg-cat-frappe-base text-cat-frappe-base dark:text-cat-frappe-text">
                  <ContextMenuItem className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => editor.chain().focus().addRowBefore().run()}>Add Row Above</ContextMenuItem>
                  <ContextMenuItem className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => editor.chain().focus().addRowAfter().run()}>Add Row Below</ContextMenuItem>
                  <ContextMenuSeparator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />
                  <ContextMenuItem className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => editor.chain().focus().deleteRow().run()}>Delete Row</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSub>
                <ContextMenuSubTrigger className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50">Column Operations</ContextMenuSubTrigger>
                <ContextMenuSubContent className="border border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-[#F6EEE5] dark:bg-cat-frappe-base text-cat-frappe-base dark:text-cat-frappe-text">
                  <ContextMenuItem className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => editor.chain().focus().addColumnBefore().run()}>Add Column Left</ContextMenuItem>
                  <ContextMenuItem className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => editor.chain().focus().addColumnAfter().run()}>Add Column Right</ContextMenuItem>
                  <ContextMenuSeparator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />
                  <ContextMenuItem className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => editor.chain().focus().deleteColumn().run()}>Delete Column</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />
              <ContextMenuItem className="hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Toggle Header Row</ContextMenuItem>
              <ContextMenuSeparator className="bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0" />
              <ContextMenuItem className="text-cat-frappe-red hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50" onClick={() => (editor.commands.deleteCurrentTable ? editor.chain().focus().deleteCurrentTable().run() : editor.chain().focus().deleteTable().run())}>Delete Table</ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenu>
      </div>
      {/* Legacy custom context menu removed in favor of shadcn ContextMenu above */}
    </div>
  );
}

function Toolbar({ editor }) {
  const btn = (active, extra = "") =>
    `px-2 py-1 text-sm rounded-md border transition-colors ${
      active
        ? "bg-cat-frappe-yellow text-cat-frappe-base border-cat-frappe-yellow"
        : "bg-transparent text-cat-frappe-base dark:text-cat-frappe-subtext0 border-cat-frappe-surface1 dark:border-cat-frappe-surface0 hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50"
    } ${extra}`;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-cat-frappe-surface1 dark:border-cat-frappe-surface0 bg-[#eff1f5] dark:bg-cat-frappe-surface0">
      <button className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} type="button">B</button>
      <button className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} type="button"><span className="italic">I</span></button>
      <button className={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} type="button"><span className="line-through">S</span></button>
      <span className="w-px h-6 bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0 mx-1" />
      {[1, 2, 3].map((level) => (
        <button
          key={level}
          className={btn(editor.isActive("heading", { level }))}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          type="button"
        >
          H{level}
        </button>
      ))}
      <button className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} type="button">• List</button>
      <button className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} type="button">1. List</button>
      <button className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} type="button">❝ ❞</button>
      <button className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} type="button">{`</>`}</button>
      <button className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} type="button">HR</button>
      <span className="w-px h-6 bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0 mx-1" />
      <button
        className={btn(editor.isActive('link'))}
        onClick={() => {
          const prev = editor.getAttributes('link').href || '';
          const input = typeof window !== 'undefined' ? window.prompt('Enter URL', prev) : prev;
          if (input === null) return;
          const trimmed = (input || '').trim();
          if (!trimmed) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
          }
          const normalized = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
          const { empty } = editor.state.selection;
          const chain = editor.chain().focus().extendMarkRange('link');
          if (empty) {
            chain.insertContent({
              type: 'text',
              text: normalized,
              marks: [{ type: 'link', attrs: { href: normalized } }],
            }).run();
          } else {
            chain.setLink({ href: normalized }).run();
          }
        }}
        type="button"
      >
        Link
      </button>
      <button
        className={btn(false)}
        onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
        type="button"
      >
        Unlink
      </button>
      <span className="w-px h-6 bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0 mx-1" />
      <div className="inline-flex items-center gap-1">
        <button
          className={btn(editor.isActive('table'))}
          onClick={() => {
            const chain = editor.chain().focus();
            // Fallback to native insertTable if extension command isn't present
            chain.insertTable({ rows: 3, cols: 4, withHeaderRow: true }).run();
          }}
          type="button"
        >
          Insert Table
        </button>
        <button className={btn(false)} onClick={() => { if (editor.isActive('table')) editor.chain().focus().toggleHeaderRow().run() }} type="button">Toggle Header</button>
        <button className={btn(false)} onClick={() => { if (editor.isActive('table')) editor.chain().focus().addRowAfter().run() }} type="button">Row +</button>
        <button className={btn(false)} onClick={() => { if (editor.isActive('table')) editor.chain().focus().addColumnAfter().run() }} type="button">Col +</button>
        <button className={btn(false)} onClick={() => { if (editor.isActive('table')) editor.chain().focus().deleteRow().run() }} type="button">Row -</button>
        <button className={btn(false)} onClick={() => { if (editor.isActive('table')) editor.chain().focus().deleteColumn().run() }} type="button">Col -</button>
        <button
          className={btn(false)}
          onClick={() => {
            const hasCustom = typeof editor.commands.deleteCurrentTable === 'function'
            if (hasCustom) {
              editor.chain().focus().deleteCurrentTable().run()
            } else {
              editor.chain().focus().deleteTable().run()
            }
          }}
          type="button"
        >
          Remove
        </button>
        <button
          className={btn(false)}
          onClick={() => {
            const hasSelect = typeof editor.commands.selectCurrentTable === 'function'
            if (hasSelect) {
              editor.chain().focus().selectCurrentTable().run()
            }
          }}
          type="button"
        >
          Select
        </button>
      </div>
      <span className="w-px h-6 bg-cat-frappe-surface1 dark:bg-cat-frappe-surface0 mx-1" />
      <button className={btn(false)} onClick={() => editor.chain().focus().undo().run()} type="button">Undo</button>
      <button className={btn(false)} onClick={() => editor.chain().focus().redo().run()} type="button">Redo</button>
    </div>
  );
}


