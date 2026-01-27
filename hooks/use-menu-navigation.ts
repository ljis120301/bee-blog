import { useEffect, useState, useCallback } from "react"

interface UseMenuNavigationProps<T> {
    containerRef: React.RefObject<HTMLElement>
    items: T[]
    orientation?: "vertical" | "horizontal" | "both"
    onSelect?: (item: T) => void
    onClose?: () => void
    autoSelectFirstItem?: boolean
}

export function useMenuNavigation<T>({
    containerRef,
    items,
    orientation = "vertical",
    onSelect,
    onClose,
    autoSelectFirstItem = false,
}: UseMenuNavigationProps<T>) {
    const [selectedIndex, setSelectedIndex] = useState(
        autoSelectFirstItem ? 0 : -1
    )

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!containerRef.current) return

            // Only handle events if the container or a child has focus
            const isFocused =
                containerRef.current === document.activeElement ||
                containerRef.current.contains(document.activeElement)

            if (!isFocused) return

            switch (event.key) {
                case "ArrowDown":
                    if (orientation === "horizontal") return
                    event.preventDefault()
                    setSelectedIndex((prev) =>
                        prev < items.length - 1 ? prev + 1 : 0
                    )
                    break
                case "ArrowUp":
                    if (orientation === "horizontal") return
                    event.preventDefault()
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : items.length - 1
                    )
                    break
                case "ArrowRight":
                    if (orientation === "vertical") return
                    event.preventDefault()
                    setSelectedIndex((prev) =>
                        prev < items.length - 1 ? prev + 1 : 0
                    )
                    break
                case "ArrowLeft":
                    if (orientation === "vertical") return
                    event.preventDefault()
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : items.length - 1
                    )
                    break
                case "Home":
                    event.preventDefault()
                    setSelectedIndex(0)
                    break
                case "End":
                    event.preventDefault()
                    setSelectedIndex(items.length - 1)
                    break
                case "Enter":
                case " ":
                    if (selectedIndex >= 0 && selectedIndex < items.length) {
                        event.preventDefault()
                        onSelect?.(items[selectedIndex])
                    }
                    break
                case "Escape":
                    event.preventDefault()
                    setSelectedIndex(-1)
                    onClose?.()
                    break
                default:
                    break
            }
        },
        [containerRef, items, orientation, onSelect, onClose, selectedIndex]
    )

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Attach event listener to the container (assuming it can receive focus)
        // OR document if we want global trap (usually menu nav is focused)

        // Better to attach to keydown on the container if it's focusable
        container.addEventListener("keydown", handleKeyDown)
        return () => {
            container.removeEventListener("keydown", handleKeyDown)
        }
    }, [handleKeyDown, containerRef])

    return { selectedIndex, setSelectedIndex }
}
