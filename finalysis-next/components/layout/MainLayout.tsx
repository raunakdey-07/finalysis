import { ReactNode } from 'react'
import { Box, Container, Flex, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useDarkMode } from '../../contexts/DarkModeContext'
import ClientOnly from '../common/ClientOnly'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  
  const lightTheme = {
    bg: 'gray.50',
    color: 'gray.800',
    headerBg: 'white',
    borderColor: 'gray.200',
    logoColor: 'brand.600',
    logoHover: 'brand.500'
  }
  
  const darkTheme = {
    bg: '#0a1a0f', // Very dark green
    color: 'gray.100',
    headerBg: '#0d2117', // Dark green header
    borderColor: 'green.800',
    logoColor: 'green.300',
    logoHover: 'green.200'
  }
  
  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <ClientOnly fallback={
      <Box minH="100vh" bg="white" color="gray.800">
        <Box as="header" py={4} borderBottomWidth={1} borderColor="gray.200" bg="white">
          <Container maxW="container.xl">
            <Flex align="center" justify="space-between">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.600" _hover={{ color: 'brand.500' }}>
                    Finalysis
                  </Text>
                </Box>
              </Link>
              <Flex
                as="button"
                align="center"
                gap={2}
                p={2}
                borderRadius="md"
                cursor="pointer"
                bg="white"
                color="brand.600"
                fontSize="sm"
                _hover={{ 
                  color: "brand.500"
                }}
                transition="color 0.2s"
              >
                <FiMoon />
                <Text fontSize="sm">Dark</Text>
              </Flex>
            </Flex>
          </Container>
        </Box>
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
    }>
      <Box minH="100vh" bg={theme.bg} color={theme.color}>
        <Box as="header" py={4} borderBottomWidth={1} borderColor={theme.borderColor} bg={theme.headerBg}>
        <Container maxW="container.xl">
          <Flex align="center" justify="space-between">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Text 
                fontWeight="bold" 
                fontSize="xl" 
                cursor="pointer"
                color={theme.logoColor}
                _hover={{ 
                  color: theme.logoHover,
                  textDecoration: 'none'
                }}
                transition="color 0.2s"
              >
                Finalysis
              </Text>
            </Link>
            <Flex
              as="button"
              onClick={toggleDarkMode}
              align="center"
              gap={2}
              p={2}
              borderRadius="md"
              cursor="pointer"
              bg={theme.headerBg}
              color={theme.logoColor}
              fontSize="sm"
              _hover={{ 
                color: theme.logoHover
              }}
              transition="color 0.2s"
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
              <Text fontSize="sm">{isDarkMode ? 'Light' : 'Dark'}</Text>
            </Flex>
          </Flex>
        </Container>
      </Box>
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
    </ClientOnly>
  )
}
