'use client'

import { useEffect, useState } from 'react'

interface WindowSize {
    width: number
    height: number
}

export function useWindowSize() {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    })

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        // Set size on mount
        handleResize()

        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
}
