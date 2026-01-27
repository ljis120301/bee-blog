'use client'

import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export function useMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }

        // Set initial value
        checkMobile()

        // Listen for resize events
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}
