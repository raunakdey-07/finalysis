import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
const ReactCountryFlag = dynamic(() => import('react-country-flag'), {
  ssr: false,
});
import StockSearchBar from '../components/search/StockSearchBar';
import { useDarkMode } from '../contexts/DarkModeContext';
import ClientOnly from '../components/common/ClientOnly';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Home() {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTicker, setLoadingTicker] = useState('');

  useEffect(() => {
    const handleStart = (url: string) => {
      console.log('Home: Route change start:', url);
      // Don't show loading for non-report routes
      if (!url.startsWith('/report/')) {
        setIsLoading(false);
        setLoadingTicker('');
      }
    };
    const handleComplete = () => {
      console.log('Home: Route change complete');
      setIsLoading(false);
      setLoadingTicker('');
    };
    const handleError = () => {
      console.log('Home: Route change error');
      setIsLoading(false);
      setLoadingTicker('');
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  const onSelect = (ticker: string) => {
    console.log('Navigating to:', ticker);
    setLoadingTicker(ticker);
    setIsLoading(true);
    router.push(`/report/${ticker}`);
  };

  // Company name mapping for better loading messages
  const getCompanyName = (ticker: string) => {
    const companies: Record<string, string> = {
      AAPL: 'Apple Inc.',
      MSFT: 'Microsoft Corporation',
      GOOGL: 'Alphabet Inc.',
      AMZN: 'Amazon.com Inc.',
      TSLA: 'Tesla Inc.',
      'TCS.NS': 'Tata Consultancy Services',
      'RELIANCE.NS': 'Reliance Industries',
      'ITC.NS': 'ITC Limited',
      'BP.L': 'BP plc',
      'VOD.L': 'Vodafone Group plc',
    };
    return companies[ticker] || ticker;
  };

  if (isLoading) {
    const companyName = getCompanyName(loadingTicker);
    return (
      <LoadingSpinner
        message={`Analyzing ${companyName} (${loadingTicker})...`}
      />
    );
  }

  const lightTheme = {
    titleColor: 'gray.800',
    subtitleColor: 'gray.500',
    labelColor: 'gray.500',
    exampleColor: 'gray.400',
  };

  const darkTheme = {
    titleColor: 'gray.100',
    subtitleColor: 'gray.300',
    labelColor: 'gray.300',
    exampleColor: 'gray.400',
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Flex direction="column" align="center" gap={12} mt={12}>
      <ClientOnly
        fallback={
          <Heading size="5xl" color="gray.800">
            Fin-alysis
          </Heading>
        }
      >
        <Heading size="5xl" color={theme.titleColor}>
          Fin-alysis
        </Heading>
      </ClientOnly>

      <ClientOnly
        fallback={
          <Box maxW="xl" textAlign="center">
            <Text color="gray.500" mb={1}>
              A smarter, faster way to analyze public companies.
            </Text>
            <Text color="gray.500">
              Type a ticker or company name to get started.
            </Text>
          </Box>
        }
      >
        <Box maxW="xl" textAlign="center">
          <Text color={theme.subtitleColor} mb={1}>
            A smarter, faster way to analyze public companies.
          </Text>
          <Text color={theme.subtitleColor}>
            Type a ticker or company name to get started.
          </Text>
        </Box>
      </ClientOnly>

      <Box width={{ base: '90%', md: '60%' }}>
        <StockSearchBar
          onSelect={onSelect}
          placeholder="Search ticker or company (e.g. AAPL)"
        />
      </Box>

      <Box textAlign="center">
        <ClientOnly
          fallback={
            <Text color="gray.500" fontSize="sm" mb={2}>
              Popular Stocks Across Global Markets:
            </Text>
          }
        >
          <Text color={theme.labelColor} fontSize="sm" mb={2}>
            Popular Stocks Across Global Markets:
          </Text>
        </ClientOnly>
        <ClientOnly
          fallback={
            <Text color="gray.400" fontSize="sm">
              <ReactCountryFlag
                svg
                countryCode="US"
                style={{
                  width: '1em',
                  height: '1em',
                  verticalAlign: 'middle',
                  transform: 'translateY(-0.125em)',
                }}
              />{' '}
              <Text as="span" color="blue.500" cursor="pointer">
                AAPL · MSFT · TSLA
              </Text>{' '}
              •
              <ReactCountryFlag
                svg
                countryCode="IN"
                style={{
                  width: '1em',
                  height: '1em',
                  verticalAlign: 'middle',
                  transform: 'translateY(-0.125em)',
                }}
              />{' '}
              <Text as="span" color="orange.500">
                ITC.NS · TCS.NS · RELIANCE.NS
              </Text>{' '}
              •
              <ReactCountryFlag
                svg
                countryCode="GB"
                style={{
                  width: '1em',
                  height: '1em',
                  verticalAlign: 'middle',
                  transform: 'translateY(-0.125em)',
                }}
              />{' '}
              <Text as="span" color="green.500">
                BP.L · VOD.L
              </Text>
            </Text>
          }
        >
          <Text color={theme.exampleColor} fontSize="sm">
            <ReactCountryFlag
              svg
              countryCode="US"
              style={{
                width: '1em',
                height: '1em',
                verticalAlign: 'middle',
                transform: 'translateY(-0.125em)',
              }}
            />{' '}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('AAPL')}
            >
              AAPL
            </Text>
            {' · '}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('MSFT')}
            >
              MSFT
            </Text>
            {' · '}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('TSLA')}
            >
              TSLA
            </Text>
            {' • '}
            <ReactCountryFlag
              svg
              countryCode="IN"
              style={{
                width: '1em',
                height: '1em',
                verticalAlign: 'middle',
                transform: 'translateY(-0.125em)',
              }}
            />{' '}
            <Text
              as="span"
              color="orange.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('ITC.NS')}
            >
              ITC.NS
            </Text>
            {' · '}
            <Text
              as="span"
              color="orange.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('TCS.NS')}
            >
              TCS.NS
            </Text>
            {' · '}
            <Text
              as="span"
              color="orange.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('RELIANCE.NS')}
            >
              RELIANCE.NS
            </Text>
            {' • '}
            <ReactCountryFlag
              svg
              countryCode="GB"
              style={{
                width: '1em',
                height: '1em',
                verticalAlign: 'middle',
                transform: 'translateY(-0.125em)',
              }}
            />{' '}
            <Text
              as="span"
              color="green.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('BP.L')}
            >
              BP.L
            </Text>
            {' · '}
            <Text
              as="span"
              color="green.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={() => onSelect('VOD.L')}
            >
              VOD.L
            </Text>
          </Text>
        </ClientOnly>
      </Box>
    </Flex>
  );
}

export const getServerSideProps = async () => {
  // Return an empty props object to force server-side rendering for this page
  return { props: {} };
};
