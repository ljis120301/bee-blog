import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { NodeSelection } from '@tiptap/pm/state'

export const TableManagementExtension = Extension.create({
  name: 'tableManagement',

  addOptions() {
    return {
      showHints: true,
      preventNestedTables: true,
    }
  },

  addCommands() {
    return {
      insertTableSafe:
        (options = {}) => ({ editor, state }) => {
          if (this.options.preventNestedTables) {
            const { $from } = state.selection
            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth)
              if (node.type.name === 'table') {
                return false
              }
            }
          }
          return editor.commands.insertTable(options)
        },

      deleteCurrentTable:
        () => ({ tr, dispatch }) => {
          const { selection } = tr
          const { $from } = selection
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

      selectCurrentTable:
        () => ({ tr, dispatch }) => {
          const { selection } = tr
          const { $from } = selection
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
      Delete: ({ editor }) => {
        const { selection } = editor.state
        if (selection instanceof NodeSelection && selection.node.type.name === 'table') {
          return editor.commands.deleteSelection()
        }
        return false
      },
      Backspace: ({ editor }) => {
        const { selection } = editor.state
        if (selection instanceof NodeSelection && selection.node.type.name === 'table') {
          return editor.commands.deleteSelection()
        }
        return false
      },
      Escape: ({ editor }) => {
        const { selection } = editor.state
        const { $from } = selection
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            return editor.commands.selectCurrentTable()
          }
        }
        return false
      },
      'Mod-Shift-d': ({ editor }) => editor.commands.deleteCurrentTable(),
      'Mod-Shift-a': ({ editor }) => editor.commands.selectCurrentTable(),
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tableManagement'),
        props: {
          handleDoubleClick: (view /** @type {EditorView} */, pos /** @type {number} */) => {
            const { doc } = view.state
            const resolvedPos = doc.resolve(pos)
            for (let depth = resolvedPos.depth; depth > 0; depth--) {
              const node = resolvedPos.node(depth)
              if (node.type.name === 'table') {
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
})

export default TableManagementExtension


