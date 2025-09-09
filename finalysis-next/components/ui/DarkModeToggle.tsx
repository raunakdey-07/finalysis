import { Box } from '@chakra-ui/react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useDarkMode } from '../../contexts/DarkModeContext'

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <Box
      as="button"
      onClick={toggleDarkMode}
      p={2}
      borderRadius="md"
      cursor="pointer"
      color={isDarkMode ? 'yellow.400' : 'gray.600'}
      _hover={{ 
        bg: isDarkMode ? 'green.800' : 'gray.100',
        color: isDarkMode ? 'yellow.300' : 'gray.800'
      }}
      transition="all 0.2s"
    >
      {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
    </Box>
  )
}
