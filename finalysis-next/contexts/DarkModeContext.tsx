import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate and load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      setIsDarkMode(JSON.parse(savedMode))
    }
    setIsHydrated(true)
  }, [])

  // Save dark mode preference to localStorage when it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    }
  }, [isDarkMode, isHydrated])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode: isHydrated ? isDarkMode : false, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

// Hook to check if the component has hydrated
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  return isHydrated
}
