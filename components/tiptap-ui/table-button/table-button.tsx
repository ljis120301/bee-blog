import * as React from "react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

// Add custom styles for the delete button
const deleteButtonStyles = `
.delete-table-button.tiptap-button:hover {
  --tt-button-hover-text-color: rgb(239 68 68) !important;
  --tt-button-hover-icon-color: rgb(239 68 68) !important;
}
.delete-table-button.tiptap-button:hover .tiptap-button-icon {
  color: rgb(239 68 68) !important;
}
`

const MAX_ROWS = 10
const MAX_COLS = 10

export const TableButton = () => {
  const editor = useTiptapEditor()
  const [isOpen, setIsOpen] = React.useState(false)
  const [gridSize, setGridSize] = React.useState({ rows: 0, cols: 0 })

  // Reactive check if cursor is currently inside a table to prevent nested tables
  const [isInsideTable, setIsInsideTable] = React.useState(false)

  // Update table detection when editor state changes
  React.useEffect(() => {
    if (!editor) return

    const updateTableState = () => {
      // More comprehensive table detection
      const { selection } = editor.state
      const { $from } = selection
      
      let inTable = false
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth)
        if (node.type.name === 'table') {
          inTable = true
          break
        }
      }
      
      setIsInsideTable(inTable)
    }

    // Initial check
    updateTableState()

    // Listen for selection changes
    editor.on('selectionUpdate', updateTableState)
    editor.on('transaction', updateTableState)
    editor.on('update', updateTableState)

    return () => {
      editor.off('selectionUpdate', updateTableState)
      editor.off('transaction', updateTableState)
      editor.off('update', updateTableState)
    }
  }, [editor])

  const handleSelect = (rows: number, cols: number) => {
    if (editor && !isInsideTable) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
      setIsOpen(false)
    }
  }

  const handleDeleteTable = () => {
    if (editor && isInsideTable) {
      editor.commands.deleteCurrentTable()
      setIsOpen(false)
    }
  }

  const handleSelectTable = () => {
    if (editor && isInsideTable) {
      editor.commands.selectCurrentTable()
      setIsOpen(false)
    }
  }

  const cells = Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, index) => {
    const rowIndex = Math.floor(index / MAX_COLS)
    const colIndex = index % MAX_COLS
    
    const isHighlighted = rowIndex < gridSize.rows && colIndex < gridSize.cols
    
    return (
      <div
        key={index}
        onMouseOver={() => !isInsideTable && setGridSize({ rows: rowIndex + 1, cols: colIndex + 1 })}
        onClick={() => handleSelect(rowIndex + 1, colIndex + 1)}
        className={`w-5 h-5 border border-border transition-colors ${
          isInsideTable 
            ? "opacity-30 cursor-not-allowed bg-muted" 
            : `cursor-pointer hover:border-primary/50 ${
                isHighlighted 
                  ? "bg-primary/20 border-primary" 
                  : "bg-background hover:bg-accent"
              }`
        }`}
      />
    )
  })

  return (
    <>
      <style>{deleteButtonStyles}</style>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
        <Button
          data-active={editor?.isActive("table")}
          aria-label={isInsideTable ? "Table operations" : "Insert table"}
        >
          <TableIcon className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0" 
        onMouseLeave={() => setGridSize({ rows: 0, cols: 0 })}
        align="start"
      >
        {isInsideTable ? (
          <div className="p-4">
            {/* Header with proper hierarchy */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <TableIcon className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Table Options</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage your table settings
              </p>
            </div>
            
            <Separator className="mb-4" />
            
            {/* Action buttons with proper spacing and styling */}
            <div className="space-y-2 mb-4">
              <Button
                onClick={handleSelectTable}
                data-style="ghost"
                className="w-full justify-start h-10 px-3"
                aria-label="Select entire table"
              >
                <TableIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-sm">Select Table</span>
              </Button>
              <Button
                onClick={handleDeleteTable}
                data-style="ghost"
                className="w-full justify-start h-10 px-3 delete-table-button"
                aria-label="Delete entire table"
              >
                <TrashIcon className="w-4 h-4 mr-3" />
                <span className="text-sm">Delete Table</span>
              </Button>
            </div>
            
            <Separator className="mb-4" />
            
            {/* Tips section with refined styling */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 hover:bg-primary/20">
                  <span className="text-[10px] text-primary">💡</span>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-1">Quick Tip</div>
                  <div>Right-click inside the table for additional row and column operations</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 hover:bg-primary/20">
                  <span className="text-[10px] text-primary">⌨️</span>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-1">Keyboard Shortcut</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span>Press</span>
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-[10px] font-mono">
                      Esc
                    </kbd>
                    <span>then</span>
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-[10px] font-mono">
                      Del
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Insert Table</h4>
              <p className="text-xs text-muted-foreground">
                Select the table size you want to create
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-10 gap-1 p-2 bg-muted/30 rounded-md">
                {cells}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">
                  {gridSize.rows > 0 && gridSize.cols > 0
                    ? `${gridSize.cols} × ${gridSize.rows}`
                    : "Hover to preview"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {gridSize.rows > 0 && gridSize.cols > 0
                    ? "Click to insert table"
                    : "Select table dimensions"}
                </div>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
    </>
  )
} 