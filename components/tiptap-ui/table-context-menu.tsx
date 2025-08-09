import * as React from "react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import { TableIcon } from "@/components/tiptap-icons/table-icon"

// Custom styles for delete context menu items
const deleteContextMenuStyles = `
.delete-context-item[data-highlighted] {
  color: rgb(220 38 38) !important; /* red-600 */
  background-color: rgba(220 38 38 / 0.1) !important;
}
.dark .delete-context-item[data-highlighted] {
  color: rgb(248 113 113) !important; /* red-400 */
  background-color: rgba(248 113 113 / 0.1) !important;
}
.delete-context-item[data-highlighted] svg {
  color: inherit !important;
}
`

interface TableContextMenuProps {
  children: React.ReactNode
}

export const TableContextMenu: React.FC<TableContextMenuProps> = ({ children }) => {
  const editor = useTiptapEditor()

  // Force content change to trigger auto-save before table modifications
  const saveContentBeforeModification = React.useCallback(() => {
    if (editor) {
      // Trigger a transaction to ensure current content is saved
      const { tr } = editor.state
      const newTr = tr.setMeta('addToHistory', false)
      editor.view.dispatch(newTr)
      
      // Small delay to ensure save operations complete
      return new Promise(resolve => setTimeout(resolve, 50))
    }
    return Promise.resolve()
  }, [editor])

  const handleAddRowAbove = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().addRowBefore().run()
  }, [editor, saveContentBeforeModification])

  const handleAddRowBelow = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().addRowAfter().run()
  }, [editor, saveContentBeforeModification])

  const handleDeleteRow = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().deleteRow().run()
  }, [editor, saveContentBeforeModification])

  const handleAddColumnLeft = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().addColumnBefore().run()
  }, [editor, saveContentBeforeModification])

  const handleAddColumnRight = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().addColumnAfter().run()
  }, [editor, saveContentBeforeModification])

  const handleDeleteColumn = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().deleteColumn().run()
  }, [editor, saveContentBeforeModification])

  const handleDeleteTable = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.commands.deleteCurrentTable()
  }, [editor, saveContentBeforeModification])

  const handleMergeCells = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().mergeCells().run()
  }, [editor, saveContentBeforeModification])

  const handleSplitCell = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().splitCell().run()
  }, [editor, saveContentBeforeModification])

  const handleToggleHeaderRow = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().toggleHeaderRow().run()
  }, [editor, saveContentBeforeModification])

  const handleToggleHeaderColumn = React.useCallback(async () => {
    await saveContentBeforeModification()
    editor?.chain().focus().toggleHeaderColumn().run()
  }, [editor, saveContentBeforeModification])

  // Check if we're inside a table
  const isInsideTable = editor?.isActive("table") || false

  if (!isInsideTable) {
    return <>{children}</>
  }

  return (
    <>
      <style>{deleteContextMenuStyles}</style>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
        {/* Row Operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <TableIcon className="w-4 h-4 mr-2" />
            Row Operations
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleAddRowAbove}>
              Add Row Above
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddRowBelow}>
              Add Row Below
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDeleteRow} className="delete-context-item">
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Row
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Column Operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <TableIcon className="w-4 h-4 mr-2" />
            Column Operations
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleAddColumnLeft}>
              Add Column Left
            </ContextMenuItem>
            <ContextMenuItem onClick={handleAddColumnRight}>
              Add Column Right
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleDeleteColumn} className="delete-context-item">
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Column
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Cell Operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            Cell Operations
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleMergeCells}>
              Merge Cells
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSplitCell}>
              Split Cell
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Header Operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            Header Options
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleToggleHeaderRow}>
              Toggle Header Row
            </ContextMenuItem>
            <ContextMenuItem onClick={handleToggleHeaderColumn}>
              Toggle Header Column
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Table Operations */}
        <ContextMenuItem onClick={handleDeleteTable} className="delete-context-item">
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete Entire Table
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    </>
  )
} 