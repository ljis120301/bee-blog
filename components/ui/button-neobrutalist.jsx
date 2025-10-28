import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Neo-brutalist Button Component
 * Based on neobrutalism.dev design principles
 * Features: Bold borders, offset shadows, flat colors, sharp interactions
 */
const ButtonNeobrutalist = React.forwardRef(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles - neo-brutalist core
          "inline-flex items-center justify-center font-bold",
          "border-2 border-black dark:border-cat-frappe-text",
          "transition-all duration-100",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:translate-x-[3px] active:translate-y-[3px]",
          
          // Variant styles
          variant === "default" && [
            "bg-cat-frappe-yellow dark:bg-cat-frappe-yellow",
            "text-cat-frappe-base dark:text-cat-frappe-base",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(115,121,148,1)]",
            "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(115,121,148,1)]",
            "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[0px_0px_0px_0px_rgba(115,121,148,1)]",
          ],
          variant === "peach" && [
            "bg-cat-frappe-peach dark:bg-cat-frappe-peach",
            "text-cat-frappe-base dark:text-cat-frappe-base",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(115,121,148,1)]",
            "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(115,121,148,1)]",
            "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[0px_0px_0px_0px_rgba(115,121,148,1)]",
          ],
          variant === "blue" && [
            "bg-cat-frappe-blue dark:bg-cat-frappe-blue",
            "text-cat-frappe-base dark:text-cat-frappe-crust",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(115,121,148,1)]",
            "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(115,121,148,1)]",
            "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[0px_0px_0px_0px_rgba(115,121,148,1)]",
          ],
          variant === "mauve" && [
            "bg-cat-frappe-mauve dark:bg-cat-frappe-mauve",
            "text-cat-frappe-base dark:text-cat-frappe-crust",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(115,121,148,1)]",
            "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(115,121,148,1)]",
            "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[0px_0px_0px_0px_rgba(115,121,148,1)]",
          ],
          variant === "outline" && [
            "bg-white dark:bg-cat-frappe-base",
            "text-cat-frappe-base dark:text-cat-frappe-text",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(115,121,148,1)]",
            "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(115,121,148,1)]",
            "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[0px_0px_0px_0px_rgba(115,121,148,1)]",
          ],
          
          // Size variants
          size === "default" && "h-12 px-6 text-base",
          size === "sm" && "h-10 px-4 text-sm",
          size === "lg" && "h-14 px-8 text-lg",
          size === "icon" && "h-12 w-12",
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ButtonNeobrutalist.displayName = "ButtonNeobrutalist"

export { ButtonNeobrutalist }


