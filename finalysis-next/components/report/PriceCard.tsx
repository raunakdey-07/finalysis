import { Box, Heading, Text, Flex, Icon } from '@chakra-ui/react'
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'
import { useDarkMode } from '../../contexts/DarkModeContext'

interface PriceCardProps {
  ticker: string
  company?: string
  price: number
  change?: number | null
  changePercent?: number | null
  lastUpdated?: string | null
}

/**
 * Multi-Currency Support for Global Stock Markets
 * 
 * Supported Markets and Currencies:
 * 🇮🇳 India (.NS, .BO) → ₹ INR (Indian Rupee)
 * 🇺🇸 United States (no suffix) → $ USD (US Dollar)  
 * 🇬🇧 United Kingdom (.L) → £ GBP (British Pound)
 * 🇨🇦 Canada (.TO, .V) → C$ CAD (Canadian Dollar)
 * 🇭🇰 Hong Kong (.HK) → HK$ HKD (Hong Kong Dollar)
 * 🇨🇳 China (.SS, .SZ) → ¥ CNY (Chinese Yuan)
 * 🇯🇵 Japan (.T) → ¥ JPY (Japanese Yen)
 * 🇪🇺 Europe (.DE, .F, .BE, .PA) → € EUR (Euro)
 * 🇦🇺 Australia (.AX) → A$ AUD (Australian Dollar)
 */
function getCurrencyInfo(ticker: string): { symbol: string; name: string } {
  const upperTicker = ticker.toUpperCase()
  
  if (upperTicker.endsWith('.NS') || upperTicker.endsWith('.BO')) {
    return { symbol: '₹', name: 'INR' } // Indian Rupee
  } else if (upperTicker.endsWith('.L')) {
    return { symbol: '£', name: 'GBP' } // British Pound
  } else if (upperTicker.endsWith('.TO') || upperTicker.endsWith('.V')) {
    return { symbol: 'C$', name: 'CAD' } // Canadian Dollar
  } else if (upperTicker.endsWith('.HK')) {
    return { symbol: 'HK$', name: 'HKD' } // Hong Kong Dollar
  } else if (upperTicker.endsWith('.SS') || upperTicker.endsWith('.SZ')) {
    return { symbol: '¥', name: 'CNY' } // Chinese Yuan
  } else if (upperTicker.endsWith('.T')) {
    return { symbol: '¥', name: 'JPY' } // Japanese Yen
  } else if (upperTicker.endsWith('.DE') || upperTicker.endsWith('.F') || upperTicker.endsWith('.BE') || upperTicker.endsWith('.PA')) {
    return { symbol: '€', name: 'EUR' } // Euro
  } else if (upperTicker.endsWith('.AX')) {
    return { symbol: 'A$', name: 'AUD' } // Australian Dollar
  } else {
    return { symbol: '$', name: 'USD' } // Default to US Dollar
  }
}

export default function PriceCard({ ticker, company, price, change, changePercent, lastUpdated }: PriceCardProps) {
  const { isDarkMode } = useDarkMode()
  const currency = getCurrencyInfo(ticker)
  
  const getChangeColor = () => {
    if (typeof change !== 'number') return 'gray.400'
    return change >= 0 ? 'green.400' : 'red.400'
  }

  const getChangeIcon = () => {
    if (typeof change !== 'number') return FiMinus
    return change >= 0 ? FiTrendingUp : FiTrendingDown
  }

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const lightTheme = {
    bgGradient: "linear(to-br, white, gray.50)",
    hoverBgGradient: "linear(to-br, gray.50, gray.100)",
    color: "gray.800",
    companyColor: "gray.600",
    labelColor: "gray.600",
    priceColor: "gray.800",
    unavailableColor: "gray.500",
    updateColor: "gray.400",
    borderColor: "gray.200"
  }
  
  const darkTheme = {
    bgGradient: "linear(to-br, #0d2117, #0a1a0f)", // Dark green gradient
    hoverBgGradient: "linear(to-br, #0a1a0f, #0d2117)",
    color: "gray.100",
    companyColor: "gray.300",
    labelColor: "gray.300",
    priceColor: "gray.100",
    unavailableColor: "gray.400",
    updateColor: "gray.400",
    borderColor: "green.700"
  }
  
  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      bgGradient={theme.bgGradient}
      color={theme.color} 
      boxShadow="xl"
      borderWidth={1}
      borderColor={theme.borderColor}
      transition="all 0.2s"
      _hover={{ 
        boxShadow: "2xl",
        transform: "translateY(-2px)",
        bgGradient: theme.hoverBgGradient
      }}
    >
      <Flex align="center" justify="space-between" mb={4}>
        <Box>
          <Heading size="lg" fontWeight="bold">{ticker}</Heading>
          {company && <Text fontSize="sm" color={theme.companyColor} mt={1} fontWeight="medium">{company}</Text>}
        </Box>
      </Flex>
      
      <Box>
        <Text fontSize="sm" color={theme.labelColor} fontWeight="medium">Current Price ({currency.name})</Text>
        <Text fontSize="3xl" fontWeight="bold" color={theme.priceColor} mt={1}>
          {currency.symbol}{price.toFixed(2)}
        </Text>
        
        {typeof change === 'number' && (
          <Flex align="center" mt={2}>
            <Icon as={getChangeIcon()} color={getChangeColor()} mr={1} />
            <Text fontSize="md" color={getChangeColor()} fontWeight="medium">
              {change >= 0 ? '+' : ''}{currency.symbol}{Math.abs(change).toFixed(2)} ({changePercent?.toFixed(2)}%)
            </Text>
          </Flex>
        )}
        
        {typeof change !== 'number' && (
          <Text fontSize="sm" color={theme.unavailableColor} mt={2}>
            Change data unavailable
          </Text>
        )}
        
        {lastUpdated && (
          <Text 
            fontSize="xs" 
            color={theme.updateColor} 
            mt={3} 
            pt={2} 
            borderTop="1px solid" 
            borderTopColor={theme.borderColor}
          >
            Last updated: {formatLastUpdated(lastUpdated)}
          </Text>
        )}
      </Box>
    </Box>
  )
}