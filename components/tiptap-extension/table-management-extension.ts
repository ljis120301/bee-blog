import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { NodeSelection } from '@tiptap/pm/state'

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    tableManagement: {
      /**
       * Delete the current table
       */
      deleteCurrentTable: () => ReturnType
      /**
       * Select the entire current table
       */
      selectCurrentTable: () => ReturnType
      /**
       * Insert table with nested table prevention
       */
      insertTableSafe: (options?: { rows?: number; cols?: number; withHeaderRow?: boolean }) => ReturnType
    }
  }
}

export interface TableManagementOptions {
  /**
   * Whether to show helpful hints for table operations
   * @default true
   */
  showHints: boolean
  /**
   * Whether to prevent nested tables
   * @default true
   */
  preventNestedTables: boolean
}

export const TableManagementExtension = Extension.create<TableManagementOptions>({
  name: 'tableManagement',

  addOptions() {
    return {
      showHints: true,
      preventNestedTables: true,
    }
  },

  addCommands() {
    return {
      insertTableSafe: (options = {}) => ({ editor, state }) => {
        if (this.options.preventNestedTables) {
          // Check if cursor is inside a table
          const { $from } = state.selection
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth)
            if (node.type.name === 'table') {
              return false
            }
          }
        }
        
        // Use the original insertTable command if not inside a table
        return editor.commands.insertTable(options)
      },

      deleteCurrentTable: () => ({ tr, dispatch }) => {
        const { selection } = tr
        const { $from } = selection

        // Find the table node
        let tablePos = -1
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            tablePos = $from.start(depth) - 1
            break
          }
        }

        if (tablePos >= 0) {
          const tableNode = tr.doc.nodeAt(tablePos)
          if (tableNode) {
            if (dispatch) {
              tr.delete(tablePos, tablePos + tableNode.nodeSize)
              dispatch(tr)
            }
            return true
          }
        }

        return false
      },

      selectCurrentTable: () => ({ tr, dispatch }) => {
        const { selection } = tr
        const { $from } = selection

        // Find the table node
        let tablePos = -1
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            tablePos = $from.start(depth) - 1
            break
          }
        }

        if (tablePos >= 0) {
          const tableNode = tr.doc.nodeAt(tablePos)
          if (tableNode) {
            if (dispatch) {
              const nodeSelection = NodeSelection.create(tr.doc, tablePos)
              tr.setSelection(nodeSelection)
              dispatch(tr)
            }
            return true
          }
        }

        return false
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      // Delete table when table is selected
      'Delete': ({ editor }) => {
        const { selection } = editor.state
        
        // Check if we have a node selection and it's a table
        if (selection instanceof NodeSelection && selection.node.type.name === 'table') {
          return editor.commands.deleteSelection()
        }
        
        return false
      },

      // Backspace to delete table when table is selected
      'Backspace': ({ editor }) => {
        const { selection } = editor.state
        
        // Check if we have a node selection and it's a table
        if (selection instanceof NodeSelection && selection.node.type.name === 'table') {
          return editor.commands.deleteSelection()
        }
        
        return false
      },

      // Escape to select the current table
      'Escape': ({ editor }) => {
        const { selection } = editor.state
        const { $from } = selection

        // Only if we're inside a table
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            return editor.commands.selectCurrentTable()
          }
        }

        return false
      },

      // Ctrl/Cmd + Shift + D to delete current table
      'Mod-Shift-d': ({ editor }) => {
        return editor.commands.deleteCurrentTable()
      },

      // Ctrl/Cmd + Shift + A to select current table
      'Mod-Shift-a': ({ editor }) => {
        return editor.commands.selectCurrentTable()
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tableManagement'),
        props: {
          handleDoubleClick: (view: EditorView, pos: number) => {
            const { doc } = view.state
            const resolvedPos = doc.resolve(pos)

            // Check if double-click is on table border/edge to select entire table
            for (let depth = resolvedPos.depth; depth > 0; depth--) {
              const node = resolvedPos.node(depth)
              if (node.type.name === 'table') {
                // Double-click on table - select the entire table
                const tablePos = resolvedPos.start(depth) - 1
                const nodeSelection = NodeSelection.create(view.state.doc, tablePos)
                view.dispatch(view.state.tr.setSelection(nodeSelection))
                return true
              }
            }

            return false
          },
        },
      }),
    ]
  },

  // Override insertTable command to prevent nested tables
  onCreate() {
    if (this.editor && this.options.preventNestedTables) {
      // Override with our safe version
      this.editor.commands.insertTable = (options = {}) => {
        return this.editor.commands.insertTableSafe(options)
      }
    }
  },
}) 