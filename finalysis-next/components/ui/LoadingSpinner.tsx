import { Box, Text, Flex } from '@chakra-ui/react'
import { useDarkMode } from '../../contexts/DarkModeContext'
import ClientOnly from '../common/ClientOnly'

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  const { isDarkMode } = useDarkMode()
  
  const theme = {
    overlayBg: isDarkMode ? 'rgba(10, 26, 15, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    color: isDarkMode ? 'gray.100' : 'gray.800',
    spinnerColor: isDarkMode ? 'green.300' : 'green.500'
  }

  return (
    <ClientOnly fallback={
      <Flex
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        direction="column"
        align="center"
        justify="center"
        bg="rgba(255, 255, 255, 0.9)"
        color="gray.800"
        zIndex="9999"
      >
        <Box position="relative" mb={6}>
          <Box
            w="48px"
            h="48px"
            borderRadius="50%"
            border="4px solid"
            borderColor="transparent"
            borderTopColor="green.500"
            borderRightColor="green.500"
            animation="spin 1s linear infinite"
            css={{
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
        </Box>
        <Text fontSize="lg" fontWeight="medium" color="gray.800">
          {message}
        </Text>
        <Flex gap={1} mt={2}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="6px"
              h="6px"
              borderRadius="50%"
              bg="green.500"
              animation={`pulse 1.4s ease-in-out ${i * 0.16}s infinite both`}
              css={{
                '@keyframes pulse': {
                  '0%, 80%, 100%': { 
                    transform: 'scale(0.6)',
                    opacity: 0.5 
                  },
                  '40%': { 
                    transform: 'scale(1)',
                    opacity: 1 
                  }
                }
              }}
            />
          ))}
        </Flex>
      </Flex>
    }>
      <Flex
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        direction="column"
        align="center"
        justify="center"
        bg={theme.overlayBg}
        color={theme.color}
        zIndex="9999"
        backdropFilter="blur(2px)"
      >
      <Box position="relative" mb={6}>
        {/* Modern spinning loader */}
        <Box
          w="48px"
          h="48px"
          borderRadius="50%"
          border="4px solid"
          borderColor="transparent"
          borderTopColor={theme.spinnerColor}
          borderRightColor={theme.spinnerColor}
          animation="spin 1s linear infinite"
          css={{
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        />
      </Box>
      
        <Text fontSize="lg" fontWeight="medium" color={theme.color}>
          {message}
        </Text>
        
        {/* Pulsing dots */}
        <Flex gap={1} mt={2}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="6px"
              h="6px"
              borderRadius="50%"
              bg={theme.spinnerColor}
              animation={`pulse 1.4s ease-in-out ${i * 0.16}s infinite both`}
              css={{
                '@keyframes pulse': {
                  '0%, 80%, 100%': { 
                    transform: 'scale(0.6)',
                    opacity: 0.5 
                  },
                  '40%': { 
                    transform: 'scale(1)',
                    opacity: 1 
                  }
                }
              }}
            />
          ))}
        </Flex>
      </Flex>
    </ClientOnly>
  )
}
