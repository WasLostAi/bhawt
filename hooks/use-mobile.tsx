"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return // Skip if running on the server
    }

    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Function to handle changes
    const handleChange = () => {
      setMatches(mediaQuery.matches)
    }

    // Add listener
    mediaQuery.addEventListener("change", handleChange)

    // Remove listener on cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}
