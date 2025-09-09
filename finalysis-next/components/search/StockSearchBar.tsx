import { useState, useRef, useEffect } from 'react'
import { Box, Input, Spinner, Text, Flex, Button } from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { useDarkMode } from '../../contexts/DarkModeContext'

type Result = { id: string; title: string }

export default function StockSearchBar({ onSelect, placeholder = 'Search ticker or company' }: { onSelect: (ticker: string) => void; placeholder?: string }) {
  const { isDarkMode } = useDarkMode()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (!q) { setResults([]); return }
    timeoutRef.current = window.setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/searchStocks?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data)
      } catch (e) {
        setResults([])
      }
      setLoading(false)
    }, 300)
  }, [q])

  const lightTheme = {
    inputBg: 'white',
    inputColor: 'gray.800',
    iconColor: '#9CA3AF',
    dropdownBg: 'white',
    dropdownHover: 'gray.50',
    textColor: 'gray.800',
    borderColor: 'gray.200'
  }
  
  const darkTheme = {
    inputBg: '#0d2117', // Dark green
    inputColor: 'gray.100',
    iconColor: '#9CA3AF',
    dropdownBg: '#0d2117', // Dark green
    dropdownHover: 'green.800',
    textColor: 'gray.100',
    borderColor: 'green.700'
  }
  
  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <Box position="relative" width="100%">
      <Flex>
        <Box position="relative" flex="1">
          <Flex align="center" position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1}>
            <FiSearch color={theme.iconColor} />
          </Flex>
          <Input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder={placeholder} 
            size="lg"
            pl={10}
            borderRadius="full" 
            bg={theme.inputBg}
            color={theme.inputColor}
            borderColor={theme.borderColor}
            _placeholder={{ color: 'gray.400' }}
            _focus={{
              borderColor: 'green.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-green-400)'
            }}
          />
          {loading && (
            <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
              <Spinner size="sm" color="green.400" />
            </Box>
          )}
        </Box>
        <Button 
          ml={2} 
          onClick={() => q && onSelect(q)} 
          size="lg" 
          borderRadius="full"
          colorScheme="green"
        >
          <FiSearch />
        </Button>
      </Flex>
      {results.length > 0 && (
        <Box 
          position="absolute" 
          bg={theme.dropdownBg} 
          mt={2} 
          w="full" 
          borderRadius="md" 
          boxShadow="md" 
          zIndex={20}
          borderWidth={1}
          borderColor={theme.borderColor}
        >
          {results.map(r => (
            <Box 
              key={r.id} 
              p={3} 
              cursor="pointer" 
              onClick={() => onSelect(r.id)} 
              _hover={{ bg: theme.dropdownHover }}
            >
              <Text color={theme.textColor}>{r.title}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
