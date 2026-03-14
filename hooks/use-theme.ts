"use client"

import { useEffect, useState } from "react"

export function useTheme() {
  const [isDark, setIsDark] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = stored ? stored === "dark" : prefersDark

    setIsDark(shouldBeDark)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      if (isDark) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
    }
  }, [isDark, isLoaded])

  const toggleTheme = () => setIsDark(!isDark)

  return { isDark, toggleTheme, isLoaded }
}
