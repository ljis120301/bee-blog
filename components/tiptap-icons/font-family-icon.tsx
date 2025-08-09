import * as React from "react"

export const FontFamilyIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
        <path d="M6 7h12l-1 14H7L6 7Z" />
        <path d="M8 9h8" />
        <path d="M9 13h6" />
        <path d="M10 17h4" />
      </svg>
    )
  }
)

FontFamilyIcon.displayName = "FontFamilyIcon" 