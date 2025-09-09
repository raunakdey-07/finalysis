import { Box, Text, Badge, Grid, GridItem, Flex, Button } from '@chakra-ui/react'
import { FiInfo } from 'react-icons/fi'
import { useState } from 'react'
import { useDarkMode } from '../../contexts/DarkModeContext'

interface ScoreCardData {
  title?: string
  overallScore: number
  riskLevel?: string
  scores: { [key: string]: number }
  summary: string
  scoreType?: 'altman' | 'piotroski' | 'beneish' | 'ohlson'
  explanation?: string
}

export default function ScoreCard({ data }: { data: ScoreCardData }) {
  const { isDarkMode } = useDarkMode()
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Get proper title based on score type
  const getTitle = () => {
    if (data.title) return data.title
    if (data.scoreType) {
      switch (data.scoreType) {
        case 'altman': return 'Altman Z-Score'
        case 'piotroski': return 'Piotroski F-Score' 
        case 'beneish': return 'Beneish M-Score'
        case 'ohlson': return 'Ohlson O-Score'
        default: return 'Financial Analysis'
      }
    }
    // Fallback: infer from score key
    const scoreKey = Object.keys(data.scores)[0]
    if (scoreKey?.includes('z-score')) return 'Altman Z-Score'
    if (scoreKey?.includes('f-score')) return 'Piotroski F-Score'
    if (scoreKey?.includes('m-score')) return 'Beneish M-Score'
    if (scoreKey?.includes('o-score')) return 'Ohlson O-Score'
    return 'Financial Analysis'
  }

  // Color coding based on actual financial score meanings
  const getScoreColor = (scoreValue: number, scoreType: string) => {
    if (scoreType.includes('z-score')) {
      // Altman Z-Score: >2.99 = safe, 1.81-2.99 = gray zone, <1.81 = distress
      if (scoreValue > 2.99) return 'green.500'
      if (scoreValue > 1.81) return 'yellow.500'
      return 'red.500'
    }
    if (scoreType.includes('f-score')) {
      // Piotroski F-Score: 0-10 scale, higher is better
      if (scoreValue >= 7) return 'green.500'
      if (scoreValue >= 4) return 'yellow.500'
      return 'red.500'
    }
    if (scoreType.includes('m-score')) {
      // Beneish M-Score: >-2.22 suggests manipulation, lower is better
      if (scoreValue < -2.22) return 'green.500'
      if (scoreValue < -1.5) return 'yellow.500'
      return 'red.500'
    }
    if (scoreType.includes('o-score')) {
      // Ohlson O-Score: >0.5 high bankruptcy risk, lower is better
      if (scoreValue < 0.5) return 'green.500'
      if (scoreValue < 1.0) return 'yellow.500'
      return 'red.500'
    }
    return 'gray.500'
  }
  
  const getScoreBadgeColor = (scoreValue: number, scoreType: string) => {
    const color = getScoreColor(scoreValue, scoreType)
    if (color.includes('green')) return 'green'
    if (color.includes('yellow')) return 'yellow'
    if (color.includes('red')) return 'red'
    return 'gray'
  }

  const getRiskLevel = (scoreValue: number, scoreType: string) => {
    if (scoreType.includes('z-score')) {
      if (scoreValue > 2.99) return { level: 'Low Risk', color: 'green' }
      if (scoreValue > 1.81) return { level: 'Gray Zone', color: 'yellow' }
      return { level: 'Distress Zone', color: 'red' }
    }
    if (scoreType.includes('f-score')) {
      if (scoreValue >= 7) return { level: 'Strong', color: 'green' }
      if (scoreValue >= 4) return { level: 'Average', color: 'yellow' }
      return { level: 'Weak', color: 'red' }
    }
    if (scoreType.includes('m-score')) {
      if (scoreValue < -2.22) return { level: 'Low Risk', color: 'green' }
      if (scoreValue < -1.5) return { level: 'Moderate Risk', color: 'yellow' }
      return { level: 'High Risk', color: 'red' }
    }
    if (scoreType.includes('o-score')) {
      if (scoreValue < 0.5) return { level: 'Low Risk', color: 'green' }
      if (scoreValue < 1.0) return { level: 'Moderate Risk', color: 'yellow' }
      return { level: 'High Risk', color: 'red' }
    }
    return { level: 'Unknown', color: 'gray' }
  }

  const lightTheme = {
    bg: 'white',
    borderColor: 'gray.200',
    titleColor: 'gray.800',
    labelColor: 'gray.600',
    secondaryColor: 'gray.500',
    progressBg: 'gray.300', // Darker for better visibility
    insightsBg: 'blue.50',
    insightsBorder: 'blue.200',
    insightsTitle: 'blue.800',
    insightsText: 'blue.700',
    tooltipBg: 'gray.700',
    tooltipColor: 'white',
    hoverBg: 'gray.100'
  }
  
  const darkTheme = {
    bg: '#0d2117', // Dark green background
    borderColor: 'green.800',
    titleColor: 'gray.100',
    labelColor: 'gray.300',
    secondaryColor: 'gray.400',
    progressBg: 'gray.700',
    insightsBg: 'green.900',
    insightsBorder: 'green.700',
    insightsTitle: 'green.200',
    insightsText: 'green.100',
    tooltipBg: 'gray.800',
    tooltipColor: 'gray.100',
    hoverBg: 'green.800'
  }
  
  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <Box 
      p={6} 
      borderRadius="lg" 
      bg={theme.bg} 
      shadow="md" 
      borderWidth={1} 
      borderColor={theme.borderColor}
    >
      <Flex align="center" mb={4} gap={2}>
        <Text fontSize="xl" fontWeight="bold" color={theme.titleColor}>
          {getTitle()}
        </Text>
        {data.explanation && (
          <Box position="relative">
            <Button
              aria-label="Score explanation"
              size="sm"
              variant="ghost"
              color={theme.labelColor}
              minW="auto"
              h="auto"
              p={1}
              _hover={{ 
                color: theme.titleColor,
                bg: theme.hoverBg 
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <FiInfo size={16} />
            </Button>
            {showTooltip && (
              <Box
                position="absolute"
                top={{ base: "100%", md: "-2px" }} // Below on mobile, beside on desktop
                left={{ base: "50%", md: "100%" }}
                transform={{ base: "translateX(-50%)", md: "none" }}
                mt={{ base: 2, md: 0 }}
                ml={{ base: 0, md: 2 }}
                bg={theme.tooltipBg}
                color={theme.tooltipColor}
                fontSize="sm"
                p={4}
                borderRadius="md"
                maxW={{ base: "280px", md: "400px", lg: "500px" }} // Responsive width
                minW="250px"
                zIndex={1000}
                boxShadow="lg"
                lineHeight="1.5"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: { base: '-6px', md: '50%' },
                  left: { base: '50%', md: '-6px' },
                  transform: { base: 'translateX(-50%)', md: 'translateY(-50%)' },
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: { base: '0 6px 6px 6px', md: '6px 6px 6px 0' },
                  borderColor: { 
                    base: `transparent transparent ${theme.tooltipBg} transparent`,
                    md: `transparent ${theme.tooltipBg} transparent transparent`
                  }
                }}
              >
                {data.explanation}
              </Box>
            )}
          </Box>
        )}
      </Flex>
      
      <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={6}>
        <GridItem>
          <Box>
            <Text fontSize="sm" color={theme.labelColor} fontWeight="medium" mb={2}>
              Score Value
            </Text>
            <Badge 
              colorScheme={getScoreBadgeColor(data.overallScore, Object.keys(data.scores)[0] || '')}
              fontSize="lg"
              px={3}
              py={1}
              borderRadius="full"
            >
              {typeof data.overallScore === 'number' ? data.overallScore.toFixed(2) : data.overallScore}
            </Badge>
          </Box>
        </GridItem>
        <GridItem>
          <Box>
            <Text fontSize="sm" color={theme.labelColor} fontWeight="medium" mb={2}>
              Assessment
            </Text>
            <Badge 
              colorScheme={getRiskLevel(data.overallScore, Object.keys(data.scores)[0] || '').color}
              fontSize="md"
              px={3}
              py={1}
              borderRadius="full"
            >
              {getRiskLevel(data.overallScore, Object.keys(data.scores)[0] || '').level}
            </Badge>
          </Box>
        </GridItem>
      </Grid>

      <Box>
        {Object.entries(data.scores).map(([category, score]) => {
          const normalizedWidth = category.includes('z-score') 
            ? Math.max(0, Math.min(100, ((score as number) + 1) / 5 * 100)) // Z-score can be negative
          : category.includes('f-score')
            ? Math.max(0, Math.min(100, (score as number) / 10 * 100)) // F-score 0-10
          : category.includes('m-score')
            ? Math.max(0, Math.min(100, Math.abs((score as number) + 5) / 8 * 100)) // M-score inverted
          : category.includes('o-score')
            ? Math.max(0, Math.min(100, (2 - Math.min(2, score as number)) / 2 * 100)) // O-score inverted
          : Math.max(0, Math.min(100, (score as number) * 10))
          
          return (
            <Box key={category} w="100%" mb={4}>
              <Text fontSize="sm" color={theme.labelColor} mb={2} fontWeight="medium">
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', '-')}
              </Text>
              <Box bg={theme.progressBg} borderRadius="full" h={3}>
                <Box
                  bg={getScoreColor(score as number, category)}
                  h="100%"
                  borderRadius="full"
                  width={`${normalizedWidth}%`}
                  transition="width 0.3s ease"
                />
              </Box>
              <Text fontSize="xs" color={theme.secondaryColor} mt={1}>
                {typeof score === 'number' ? score.toFixed(2) : score}
              </Text>
            </Box>
          )
        })}
      </Box>

      <Box mt={6} p={4} bg={theme.insightsBg} borderRadius="md" borderWidth={1} borderColor={theme.insightsBorder}>
        <Text fontSize="sm" color={theme.insightsTitle} fontWeight="medium" mb={2}>
          Key Insights
        </Text>
        <Text fontSize="sm" color={theme.insightsText}>
          {data.summary}
        </Text>
      </Box>
    </Box>
  )
}
