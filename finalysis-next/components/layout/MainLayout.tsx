import { ReactNode } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Box, Container, Flex, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useDarkMode } from '../../contexts/DarkModeContext';
import ClientOnly from '../common/ClientOnly';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Small inline icons to avoid pulling the whole react-icons bundle into the client
  const SunIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 4V2M12 22v-2M4.22 4.22L2.81 2.81M21.19 21.19l-1.41-1.41M4 12H2m20 0h-2M4.22 19.78L2.81 21.19M21.19 2.81l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  const lightTheme = {
    bg: 'gray.50',
    color: 'gray.800',
    headerBg: 'white',
    borderColor: 'gray.200',
    logoColor: 'brand.600',
    logoHover: 'brand.500',
  };

  const darkTheme = {
    bg: '#0a1a0f', // Very dark green
    color: 'gray.100',
    headerBg: '#0d2117', // Dark green header
    borderColor: 'green.800',
    logoColor: 'green.300',
    logoHover: 'green.200',
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const LogoMark = () => (
    <HStack gap={3} align="center">
      <Image
        src="/favicon.ico"
        alt="Fin-alysis logo"
        width={32}
        height={32}
        priority
        unoptimized
      />
      <Text
        fontSize="lg"
        fontWeight="700"
        color={theme.logoColor}
        letterSpacing="wide"
      >
        Fin
        <Box as="span" color={theme.logoHover}>
          -alysis
        </Box>
      </Text>
    </HStack>
  );

  return (
    <>
      <Head>
        <title>Fin-alysis</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ClientOnly
        fallback={
          <Box minH="100vh" bg="white" color="gray.800">
            <Box
              as="header"
              py={4}
              borderBottomWidth={1}
              borderColor="gray.200"
              bg="white"
            >
              <Container maxW="container.xl">
                <Flex align="center" justify="space-between">
                  <Link
                    href="/"
                    style={{ textDecoration: 'none' }}
                    aria-label="Go to Fin-alysis home"
                  >
                    <LogoMark />
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
                      color: 'brand.500',
                    }}
                    transition="color 0.2s"
                  >
                    <MoonIcon />
                    <Text fontSize="sm">Dark</Text>
                  </Flex>
                </Flex>
              </Container>
            </Box>
            <Container maxW="container.xl" py={8}>
              {children}
            </Container>
          </Box>
        }
      >
        <Box minH="100vh" bg={theme.bg} color={theme.color}>
          <Box
            as="header"
            py={4}
            borderBottomWidth={1}
            borderColor={theme.borderColor}
            bg={theme.headerBg}
          >
            <Container maxW="container.xl">
              <Flex align="center" justify="space-between">
                <Link
                  href="/"
                  style={{ textDecoration: 'none' }}
                  aria-label="Go to Fin-alysis home"
                >
                  <LogoMark />
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
                    color: theme.logoHover,
                  }}
                  transition="color 0.2s"
                >
                  {isDarkMode ? <SunIcon /> : <MoonIcon />}
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
    </>
  );
}
