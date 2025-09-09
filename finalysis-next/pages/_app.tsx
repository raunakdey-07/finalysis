import type { AppProps } from 'next/app'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import '../styles/globals.css'
import MainLayout from '../components/layout/MainLayout'
import { DarkModeProvider } from '../contexts/DarkModeContext'

// Create a proper Chakra UI system with custom colors
const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f7f6' },
          100: { value: '#cceff0' },
          200: { value: '#99e0de' },
          300: { value: '#66d1cc' },
          400: { value: '#33c2ba' },
          500: { value: '#0EA5A4' },
          600: { value: '#0b8e8d' },
          700: { value: '#086f6f' },
          800: { value: '#054f50' },
          900: { value: '#033f40' }
        }
      }
    }
  }
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={system}>
      <DarkModeProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </DarkModeProvider>
    </ChakraProvider>
  )
}
