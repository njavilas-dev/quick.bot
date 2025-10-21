'use client'

import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Container,
  Grid,
  Badge,
  Stack,
  Divider,
  Link,
  Input,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react"
import {
  ChevronRightIcon as ArrowRight,
  ChatIcon as MessageSquare,
  ThunderIcon as Zap,
  BarChartIcon as BarChart3,
  RobotIcon as Bot,
  FilterIcon as Workflow,
  GlobeIcon as Globe,
  CredentialsIcon as Shield,
  StarIcon as Sparkles,
  PlayIcon as Play,
  CheckIcon as Check,
  LogoIcon,
  UserIcon,
  BuildingIcon,
  BagIcon,
  CloseIcon,
  StarIcon,
  EmailIcon,
} from "@urbiport/icons"
import { Button as UrbiButton, Card as UrbiCard, H1, H2, H3, H4 } from "@urbiport/ui"
import { motion } from "framer-motion"
import { useState } from "react"

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const toast = useToast()

  const bgGradient = "linear(to-br, gray.50, bg.normal, green.50)"
  const headerBg = "whiteAlpha.800"
  const headerBorderColor = "divider.light"
  const textColor = "text.light"
  const textHoverColor = "text.normal"
  const cardBorderColor = "divider.light"
  const footerTextColor = "text.lighter"

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEmailError('')

    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Something went wrong')

      toast({
        title: 'Successfully subscribed!',
        description: "You'll be the first to know about our updates.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setEmail('')
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Box position="absolute" inset={0} overflow="hidden" pointerEvents="none">
        <Box position="absolute" top="20" right="20" w={2} h={2} bg="green.400" rounded="full" opacity={0.3} />
        <Box position="absolute" bottom="40" left="20" w={2} h={2} bg="blue.400" rounded="full" opacity={0.2} />
        <Box position="absolute" top="50%" left="80%" w={1} h={1} bg="green.300" rounded="full" opacity={0.25} />
      </Box>

      <Box
        as="header"
        bg={headerBg}
        backdropFilter="blur(20px)"
        position="sticky"
        top={0}
        zIndex={100}
        shadow="md"
        _hover={{ shadow: "lg" }}
        transition="all 0.3s ease"
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Flex h={16} align="center" justify="space-between">
            <HStack spacing={3}>
              <LogoIcon width="9" height="9" />
              <H3
                as="span"
                bgGradient="linear(135deg, gray.700, gray.800)"
                bgClip="text"
                fontWeight="bold"
              >
                quick.bot
              </H3>
            </HStack>
            <HStack as="nav" spacing={6} display={{ base: "none", lg: "flex" }}>
              <Link
                href="#home"
                color={textColor}
                _hover={{ color: textHoverColor }}
                fontWeight="bold"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Home
              </Link>
              <Link
                href="#features"
                color={textColor}
                _hover={{ color: textHoverColor }}
                fontWeight="bold"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                color={textColor}
                _hover={{ color: textHoverColor }}
                fontWeight="bold"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Reviews
              </Link>
              <Link
                href="#pricing"
                color={textColor}
                _hover={{ color: textHoverColor }}
                fontWeight="bold"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Pricing
              </Link>
              <Button
                as="a"
                href="https://app.quick.bot/signin"
                variant="outline"
                fontWeight="bold"
                display={{ base: "none", xl: "flex" }}
                rightIcon={<UserIcon />}
              >
                Sign In
              </Button>
              <Button
                as="a"
                href="https://docs.quick.bot/app/getting-started/welcome"
                bg="brand.primary"
                _hover={{ bg: "brand.primary" }}
                color="white"
                shadow="md"
                fontWeight="semibold"
                rightIcon={<ArrowRight />}
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Box
        as="section"
        id="home"
        py={{ base: 20, lg: 32 }}
        position="relative"
        overflow="hidden"
        bgGradient="linear(135deg, brand.primary 0%, brand.primary 50%, purple.600 100%)"
        minH={{ base: "90vh", lg: "95vh" }}
        display="flex"
        alignItems="center"
      >
        <Box position="absolute" inset={0} bg="blackAlpha.200" />
        <Box
          as={motion.div}
          position="absolute"
          top={-20}
          right={-20}
          w={80}
          h={80}
          bg="whiteAlpha.200"
          rounded="full"
          filter="blur(60px)"
          opacity={0.4}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.1, 1]
          }}
        />
        <Box
          as={motion.div}
          position="absolute"
          bottom={-10}
          left={-10}
          w={60}
          h={60}
          bg="green.300"
          rounded="full"
          filter="blur(40px)"
          opacity={0.3}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
        />
        <Box
          as={motion.div}
          position="absolute"
          top="30%"
          left="10%"
          w={4}
          h={4}
          bg="white"
          rounded="full"
          opacity={0.6}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1]
          }}
        />
        <Box
          as={motion.div}
          position="absolute"
          top="60%"
          right="15%"
          w={3}
          h={3}
          bg="green.200"
          rounded="full"
          opacity={0.5}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1]
          }}
        />
        <Box
          as={motion.div}
          position="absolute"
          top="20%"
          right="30%"
          w={2}
          h={2}
          bg="white"
          rounded="full"
          opacity={0.7}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1]
          }}
        />

        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} position="relative" zIndex={10}>
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="center">
            <VStack spacing={8} align="flex-start">
              <VStack spacing={4} align="flex-start">
                <Badge
                  px={6}
                  py={2}
                  rounded="full"
                  border="2px solid"
                  borderColor="whiteAlpha.400"
                  bg="brand.primary"
                  backdropFilter="blur(10px)"
                  color="white"
                  fontWeight="semibold"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  shadow="lg"
                  alignItems="center"
                  display="flex"
                  gap="2"
                >
                  <Sparkles h={5} w={5} />
                  AI-Powered Chatbot Builder
                </Badge>

                <H1
                  fontSize={{ base: "4xl", lg: "6xl", xl: "7xl" }}
                  color="white"
                  lineHeight="1.2"
                  fontWeight="black"
                  textShadow="0 8px 32px rgba(0,0,0,0.4)"
                  position="relative"
                  _after={{
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    bgGradient: "linear(135deg, transparent, whiteAlpha.100, transparent)",
                    zIndex: -1,
                    filter: "blur(20px)"
                  }}
                >
                  <Text as="span" fontWeight="black">Build Smart</Text>
                  <Text
                    as="span"
                    display="block"
                    fontWeight="black"
                    bgGradient="linear(to-r, white, green.200, white)"
                    bgClip="text"
                    backgroundSize="200% 200%"
                    animation="gradient-shift 4s ease infinite"
                    sx={{
                      '@keyframes gradient-shift': {
                        '0%, 100%': {
                          backgroundPosition: '0% 50%'
                        },
                        '50%': {
                          backgroundPosition: '100% 50%'
                        }
                      }
                    }}
                  >
                    Conversations
                  </Text>
                  <Text as="span" color="whiteAlpha.900" fontWeight="black">
                    in Minutes
                  </Text>
                </H1>

                <Text
                  fontSize={{ base: "lg", lg: "xl" }}
                  color="whiteAlpha.900"
                  lineHeight="relaxed"
                  maxW="xl"
                  fontWeight="500"
                  textShadow="0 4px 16px rgba(0,0,0,0.3)"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    left: "-4px",
                    top: "0",
                    bottom: "0",
                    width: "4px",
                    bgGradient: "linear(to-b, green.400, cyan.400, blue.400)",
                    borderRadius: "full",
                    opacity: 0.6
                  }}
                  pl={6}
                >
                  Create intelligent chatbots with our visual flow builder. No coding required – just drag, drop, and
                  deploy AI-powered conversations that convert visitors into customers and boost engagement.
                </Text>
              </VStack>

              <Stack direction={{ base: "column", sm: "row" }} spacing={4} w={{ base: "full", sm: "auto" }}>
                <Button
                  as="a"
                  href="https://docs.quick.bot/app/getting-started/welcome"
                  size={{ base: "lg", sm: "xl" }}
                  fontSize={{ base: "md", sm: "lg" }}
                  px={{ base: 8, sm: 12 }}
                  py={7}
                  bg="white"
                  color="brand.primary"
                  _hover={{
                    bg: "green.50",
                    transform: "translateY(-4px) scale(1.05)",
                    shadow: "0 20px 40px rgba(0,0,0,0.15)"
                  }}
                  shadow="0 10px 30px rgba(0,0,0,0.1)"
                  fontWeight="bold"
                  rightIcon={<ArrowRight h={5} w={5} />}
                  w={{ base: "full", sm: "auto" }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  borderRadius="full"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    bgGradient: "linear(45deg, transparent, whiteAlpha.300, transparent)",
                    transform: "translateX(-100%)",
                    _hover: {
                      transform: "translateX(100%)",
                      transition: "transform 0.6s ease"
                    }
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  size={{ base: "lg", sm: "xl" }}
                  fontSize={{ base: "md", sm: "lg" }}
                  px={{ base: 8, sm: 12 }}
                  py={7}
                  bg="whiteAlpha.200"
                  borderColor="whiteAlpha.400"
                  borderWidth="2px"
                  color="white"
                  _hover={{
                    bg: "whiteAlpha.300",
                    shadow: "0 20px 40px rgba(255,255,255,0.1)",
                    transform: "translateY(-4px) scale(1.05)",
                    borderColor: "whiteAlpha.700"
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  fontWeight="bold"
                  leftIcon={<Play h={5} w={5} />}
                  w={{ base: "full", sm: "auto" }}
                  borderRadius="full"
                  backdropFilter="blur(15px)"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    bgGradient: "linear(45deg, transparent, whiteAlpha.200, transparent)",
                    transform: "translateX(-100%)",
                    _hover: {
                      transform: "translateX(100%)",
                      transition: "transform 0.6s ease"
                    }
                  }}
                >
                  Watch Demo
                </Button>
              </Stack>

              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={{ base: 4, sm: 8 }}
                fontSize="sm"
                color="whiteAlpha.900"
                align={{ base: "flex-start", sm: "center" }}
                mt={2}
              >
                <HStack spacing={3}>
                  <Flex
                    align="center"
                    justify="center"
                    w={6}
                    h={6}
                    bg="green.400"
                    rounded="full"
                    shadow="md"
                  >
                    <Check h={4} w={4} color="white" />
                  </Flex>
                  <Text fontWeight="600" textShadow="0 2px 4px rgba(0,0,0,0.2)">14-day free trial</Text>
                </HStack>
                <HStack spacing={3}>
                  <Flex
                    align="center"
                    justify="center"
                    w={6}
                    h={6}
                    bg="green.400"
                    rounded="full"
                    shadow="md"
                  >
                    <Check h={4} w={4} color="white" />
                  </Flex>
                  <Text fontWeight="600" textShadow="0 2px 4px rgba(0,0,0,0.2)">No credit card required</Text>
                </HStack>
                <HStack spacing={3} display={{ base: "flex", sm: "flex" }}>
                  <Flex
                    align="center"
                    justify="center"
                    w={6}
                    h={6}
                    bg="green.400"
                    rounded="full"
                    shadow="md"
                  >
                    <Check h={4} w={4} color="white" />
                  </Flex>
                  <Text fontWeight="600" textShadow="0 2px 4px rgba(0,0,0,0.2)">Setup in 5 minutes</Text>
                </HStack>
              </Stack>
            </VStack>

            <Box position="relative">
              <Box
                position="relative"
                bg="white"
                rounded="3xl"
                shadow="2xl"
                border="1px"
                borderColor="whiteAlpha.200"
                overflow="hidden"
                transform="perspective(1000px) rotateY(-5deg) rotateX(5deg)"
                _hover={{
                  transform: "perspective(1000px) rotateY(0deg) rotateX(0deg)",
                  shadow: "3xl"
                }}
                transition="all 0.6s ease"
              >
                <Box
                  bgGradient="linear(to-r, gray.100, gray.50)"
                  px={6}
                  py={4}
                  borderBottom="1px"
                  borderColor="gray.200"
                >
                  <HStack spacing={3}>
                    <HStack spacing={2}>
                      <Box w={3} h={3} rounded="full" bg="red.400" />
                      <Box w={3} h={3} rounded="full" bg="yellow.400" />
                      <Box w={3} h={3} rounded="full" bg="green.400" />
                    </HStack>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Flow Builder
                    </Text>
                  </HStack>
                </Box>
                <Box p={8} bgGradient="linear(to-br, gray.50, white)" position="relative" overflow="hidden">
                  <VStack spacing={6}>
                    <HStack justify="space-between" w="full" position="relative">
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        bg="green.100"
                        rounded="xl"
                        border="2px"
                        borderColor="green.200"
                        shadow="md"
                        position="relative"
                        h={16}
                        w={16}
                        sx={{
                          '@keyframes pulse-border-start': {
                            '0%, 85%, 100%': {
                              opacity: 0.3
                            },
                            '15%': {
                              opacity: 0.8
                            }
                          }
                        }}
                      >
                        <MessageSquare h={6} w={6} color="green.600" />
                      </Flex>

                      <Box flex={1} mx={4} position="relative" h="2px">
                        <Box
                          h="2px"
                          w="full"
                          bg="gray.200"
                          rounded="full"
                          position="absolute"
                        />
                        <Box
                          h="2px"
                          w="30px"
                          bgGradient="linear(to-r, green.400, blue.400)"
                          rounded="full"
                          position="absolute"
                          animation="flow-data 6s ease-in-out infinite"
                          sx={{
                            '@keyframes flow-data': {
                              '0%, 50%, 100%': {
                                left: '0%',
                                opacity: 0,
                                transform: 'scale(0.8)'
                              },
                              '10%': {
                                opacity: 1,
                                transform: 'scale(1)'
                              },
                              '40%': {
                                left: 'calc(100% - 30px)',
                                opacity: 1,
                                transform: 'scale(1.1)'
                              },
                              '50%': {
                                left: 'calc(100% - 30px)',
                                opacity: 0,
                                transform: 'scale(0.8)'
                              }
                            }
                          }}
                        />
                        <Box
                          position="absolute"
                          right="0"
                          top="-5px"
                          w="0"
                          h="0"
                          borderLeft="8px solid"
                          borderLeftColor="blue.400"
                          borderTop="6px solid transparent"
                          borderBottom="6px solid transparent"
                          animation="arrow-pulse 6s ease-in-out infinite"
                          sx={{
                            '@keyframes arrow-pulse': {
                              '0%, 35%, 55%, 100%': {
                                transform: 'scale(1)',
                                opacity: 0.4
                              },
                              '40%, 50%': {
                                transform: 'scale(1.3)',
                                opacity: 1
                              }
                            }
                          }}
                        />
                      </Box>

                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        bg="blue.100"
                        rounded="xl"
                        border="2px"
                        borderColor="blue.200"
                        shadow="md"
                        position="relative"
                        h={16}
                        w={16}
                        sx={{
                          '@keyframes pulse-border-start': {
                            '0%, 85%, 100%': {
                              opacity: 0.3
                            },
                            '15%': {
                              opacity: 0.8
                            }
                          }
                        }}
                      >
                        <Zap h={6} w={6} color="blue.600" />
                      </Flex>
                    </HStack>

                    <Flex justify="center" position="relative">
                      <Box
                        w={20}
                        h={20}
                        bgGradient="linear(135deg, green.500, green.600, blue.500, blue.600)"
                        rounded="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        shadow="2xl"
                        border="4px solid"
                        borderColor="white"
                        position="relative"
                        _before={{
                          content: '""',
                          position: "absolute",
                          inset: "-2px",
                          borderRadius: "full",
                          bgGradient: "conic-gradient(from 0deg, green.400, blue.400, purple.400, green.400)",
                          animation: "rotate-border 10s linear infinite",
                          zIndex: -1
                        }}
                        _after={{
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          borderRadius: "full",
                          bgGradient: "radial-gradient(circle at 30% 30%, whiteAlpha.400, transparent 70%)",
                          animation: "shimmer-bot 8s ease-in-out infinite"
                        }}
                        sx={{
                          '@keyframes rotate-border': {
                            '0%': {
                              transform: 'rotate(0deg)'
                            },
                            '100%': {
                              transform: 'rotate(360deg)'
                            }
                          },
                          '@keyframes shimmer-bot': {
                            '0%, 70%, 100%': {
                              opacity: 0.3
                            },
                            '20%': {
                              opacity: 0.7
                            },
                            '40%': {
                              opacity: 0.9
                            },
                            '60%': {
                              opacity: 0.6
                            }
                          }
                        }}
                      >
                        <Bot h={8} w={8} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                      </Box>
                    </Flex>

                    <Grid templateColumns="1fr 1fr" gap={4} w="full">
                      <Box
                        bg="white"
                        rounded="lg"
                        p={4}
                        textAlign="center"
                        border="2px solid"
                        borderColor="gray.200"
                        shadow="sm"
                        position="relative"
                        _hover={{
                          borderColor: "green.300",
                          shadow: "md",
                          transform: "translateY(-2px) scale(1.02)"
                        }}
                        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                        _before={{
                          content: '"1"',
                          position: "absolute",
                          top: "-8px",
                          left: "-8px",
                          w: "20px",
                          h: "20px",
                          bg: "green.400",
                          color: "white",
                          rounded: "full",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "xs",
                          fontWeight: "bold"
                        }}
                      >
                        <Text fontSize="sm" color="gray.700" fontWeight="medium">
                          &quot;Welcome! How can I help?&quot;
                        </Text>
                      </Box>
                      <Box
                        bg="white"
                        rounded="lg"
                        p={4}
                        textAlign="center"
                        border="2px solid"
                        borderColor="gray.200"
                        shadow="sm"
                        position="relative"
                        _hover={{
                          borderColor: "blue.300",
                          shadow: "md",
                          transform: "translateY(-2px) scale(1.02)"
                        }}
                        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                        _before={{
                          content: '"2"',
                          position: "absolute",
                          top: "-8px",
                          left: "-8px",
                          w: "20px",
                          h: "20px",
                          bg: "blue.400",
                          color: "white",
                          rounded: "full",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "xs",
                          fontWeight: "bold"
                        }}
                      >
                        <Text fontSize="sm" color="gray.700" fontWeight="medium">
                          &quot;Let me connect you...&quot;
                        </Text>
                      </Box>
                    </Grid>
                  </VStack>
                </Box>
              </Box>
              <Box
                position="absolute"
                top={-4}
                right={-4}
                w={12}
                h={12}
                bg="white"
                rounded="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
                border="2px solid"
                borderColor="green.100"
                animation="bounce 3s ease-in-out infinite"
                _hover={{
                  borderColor: "green.300",
                  shadow: "xl"
                }}
                transition="all 0.3s ease"
              >
                <Sparkles h={5} w={5} color="green.500" />
              </Box>
              <Box
                position="absolute"
                bottom={-4}
                left={-4}
                w={12}
                h={12}
                bg="white"
                rounded="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
                border="2px solid"
                borderColor="green.100"
                animation="pulse 4s ease-in-out infinite"
                _hover={{
                  borderColor: "green.300",
                  shadow: "xl"
                }}
                transition="all 0.3s ease"
              >
                <Workflow h={5} w={5} color="green.500" />
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Box
        as="section"
        py={12}
        bg="whiteAlpha.700"
        backdropFilter="blur(8px)"
        borderY="1px"
        borderColor={headerBorderColor}
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Text
            textAlign="center"
            fontSize="sm"
            color="green.500"
            mb={8}
            fontWeight="500"
          >
            Trusted by 10,000+ businesses worldwide
          </Text>
          <Box
            w="full"
            overflow="hidden"
            position="relative"
          >
            <HStack
              spacing={8}
              alignItems="center"
              w="fit-content"
              animation="slide 20s linear infinite"
              sx={{
                '@keyframes slide': {
                  '0%': {
                    transform: 'translateX(0)'
                  },
                  '100%': {
                    transform: 'translateX(-1584px)'
                  }
                }
              }}
            >
              {[
                { name: "TechCorp", initials: "TC" },
                { name: "StartupXYZ", initials: "SX" },
                { name: "InnovateCo", initials: "IC" },
                { name: "GrowthLab", initials: "GL" },
                { name: "DataFlow", initials: "DF" },
                { name: "CloudTech", initials: "CT" },
                { name: "TechCorp", initials: "TC" },
                { name: "StartupXYZ", initials: "SX" },
                { name: "InnovateCo", initials: "IC" },
                { name: "GrowthLab", initials: "GL" },
                { name: "DataFlow", initials: "DF" },
                { name: "CloudTech", initials: "CT" }
              ].map((brand, index) => (
                <Box
                  key={`${brand.name}-${index}`}
                  as={motion.div}
                  whileHover={{
                    scale: 1.05,
                    opacity: 1
                  }}
                  // @ts-expect-error motion component type incompatibility
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Box
                    opacity={0.8}
                    _hover={{
                      opacity: 1,
                      transform: "translateY(-4px)"
                    }}
                    transition="all 0.3s ease"
                    minW="150px"
                    w="150px"
                    h="80px"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xl"
                    fontWeight="bold"
                    color="gray.700"
                    shadow="md"
                    cursor="pointer"
                  >
                    {brand.name}
                  </Box>
                </Box>
              ))}
            </HStack>
          </Box>
        </Container>
      </Box>

      <Box
        as="section"
        id="features"
        py={20}
        bgGradient="linear(to-br, emerald.50, teal.50, cyan.50)"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" inset={0}>
          <Box
            as={motion.div}
            position="absolute"
            top="15%"
            left="5%"
            w={24}
            h={24}
            bg="emerald.200"
            rounded="full"
            filter="blur(20px)"
            opacity={0.3}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
          />
          <Box
            as={motion.div}
            position="absolute"
            bottom="25%"
            right="8%"
            w={36}
            h={36}
            bg="teal.200"
            rounded="full"
            filter="blur(25px)"
            opacity={0.2}
            animate={{
              x: [0, 30, 0],
              rotate: [0, 90, 180]
            }}
          />
          <Box
            as={motion.div}
            position="absolute"
            top="40%"
            right="20%"
            w={16}
            h={16}
            bg="cyan.300"
            rounded="full"
            filter="blur(15px)"
            opacity={0.25}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.25, 0.4, 0.25]
            }}
          />
        </Box>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} position="relative" zIndex={10}>
          <VStack textAlign="center" mb={16} spacing={4}>
            <Badge
              px={6}
              py={2}
              rounded="full"
              border="2px solid"
              borderColor="whiteAlpha.400"
              bg="brand.primary"
              backdropFilter="blur(10px)"
              color="white"
              fontWeight="semibold"
              letterSpacing="wider"
              textTransform="uppercase"
              shadow="lg"
              alignItems="center"
              display="flex"
              gap="2"
            >
              Features
            </Badge>
            <H2
              fontSize={{ base: "3xl", lg: "4xl" }}

            >
              Everything You Need to Build
              <Text
                as="span"
                display="block"
                bgGradient="linear(135deg, brand.primary, brand.primary)"
                bgClip="text"
              >
                Amazing Chatbots
              </Text>
            </H2>
            <Text
              fontSize="xl"
              color={textColor}
              maxW="3xl"
              mx="auto"
              lineHeight="relaxed"
            >
              Powerful features designed to help you create engaging conversational experiences that convert visitors
              into customers
            </Text>
          </VStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8} position="relative" zIndex={10}>
            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start" h="full">
                <Flex
                  w="60px"
                  h="60px"
                  bg="green.100"
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Workflow h={8} w={8} color="green.600" />
                </Flex>
                <H3 fontSize="xl" color="gray.800">
                  Visual Flow Builder
                </H3>
                <Text color="gray.600" lineHeight="relaxed" fontSize="md">
                  Design complex conversation flows with our intuitive drag-and-drop interface. No technical skills
                  required.
                </Text>
              </VStack>
            </UrbiCard>

            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start" h="full">
                <Flex
                  w="60px"
                  h="60px"
                  bg="blue.100"
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Bot h={8} w={8} color="blue.600" />
                </Flex>
                <H3 fontSize="xl" color="gray.800">
                  AI-Powered Responses
                </H3>
                <Text color="gray.600" lineHeight="relaxed" fontSize="md">
                  Leverage advanced NLP for intelligent, context-aware responses that feel natural and human-like.
                </Text>
              </VStack>
            </UrbiCard>

            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start" h="full">
                <Flex
                  w="60px"
                  h="60px"
                  bg="purple.100"
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="center"
                >
                  <BarChart3 h={8} w={8} color="purple.600" />
                </Flex>
                <H3 fontSize="xl" color="gray.800">
                  Advanced Analytics
                </H3>
                <Text color="gray.600" lineHeight="relaxed" fontSize="md">
                  Track performance, user engagement, and conversion rates with detailed analytics and insights.
                </Text>
              </VStack>
            </UrbiCard>

            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start" h="full">
                <Flex
                  w="60px"
                  h="60px"
                  bg="cyan.100"
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Globe h={8} w={8} color="cyan.600" />
                </Flex>
                <H3 fontSize="xl" color="gray.800">
                  Multi-Platform Deploy
                </H3>
                <Text color="gray.600" lineHeight="relaxed" fontSize="md">
                  Deploy across websites, messaging apps, and social platforms with one-click integration.
                </Text>
              </VStack>
            </UrbiCard>

            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start" h="full">
                <Flex
                  w="60px"
                  h="60px"
                  bg="yellow.100"
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Zap h={8} w={8} color="yellow.600" />
                </Flex>
                <H3 fontSize="xl" color="gray.800">
                  Smart Integrations
                </H3>
                <Text color="gray.600" lineHeight="relaxed" fontSize="md">
                  Connect with CRMs, email tools, and business apps seamlessly with our extensive integration library.
                </Text>
              </VStack>
            </UrbiCard>

            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start" h="full">
                <Flex
                  w="60px"
                  h="60px"
                  bg="gray.100"
                  borderRadius="md"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Shield h={8} w={8} color="gray.600" />
                </Flex>
                <H3 fontSize="xl" color="gray.800">
                  Enterprise Security
                </H3>
                <Text color="gray.600" lineHeight="relaxed" fontSize="md">
                  Bank-level security with SOC 2 compliance, data encryption, and privacy controls you can trust.
                </Text>
              </VStack>
            </UrbiCard>
          </Grid>
        </Container>
      </Box>

      <Box
        as="section"
        id="testimonials"
        py={20}
        bgGradient="linear(to-br, blue.50, purple.50, pink.50)"
        position="relative"
        overflow="hidden"
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="purple.100"
      >
        <Box position="absolute" inset={0} zIndex={-1}>
          <Box
            as={motion.div}
            position="absolute"
            top="10%"
            right="5%"
            w={40}
            h={40}
            bg="blue.200"
            rounded="full"
            filter="blur(30px)"
            opacity={0.2}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
          />
          <Box
            as={motion.div}
            position="absolute"
            bottom="20%"
            left="10%"
            w={32}
            h={32}
            bg="purple.200"
            rounded="full"
            filter="blur(25px)"
            opacity={0.15}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
          />
        </Box>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <VStack textAlign="center" mb={16} spacing={4}>
            <Badge
              px={6}
              py={2}
              rounded="full"
              border="2px solid"
              borderColor="whiteAlpha.400"
              bg="brand.primary"
              backdropFilter="blur(10px)"
              color="white"
              fontWeight="semibold"
              letterSpacing="wider"
              textTransform="uppercase"
              shadow="lg"
              alignItems="center"
              display="flex"
              gap="2"
            >
              Support
            </Badge>
            <H2
              fontSize={{ base: "3xl", lg: "4xl" }}

            >
              Trusted by 10,000+ Businesses
              <Text
                as="span"
                display="block"
                bgGradient="linear(135deg, brand.primary, brand.primary)"
                bgClip="text"
              >
                Worldwide
              </Text>
            </H2>
          </VStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={8} mb={16} position="relative" zIndex={10}>
            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start">
                <HStack spacing={1}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      as={motion.span}
                      color="yellow.400"
                      fontSize="lg"
                      animate={{
                        scale: [1, 1.1, 1]
                      }}
                    >
                      <StarIcon />
                    </Box>
                  ))}
                </HStack>
                <Text
                  color="gray.700"
                  lineHeight="relaxed"
                  fontSize="lg"
                  fontWeight="medium"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    left: "-12px",
                    top: "-8px",
                    fontSize: "4xl",
                    color: "green.300",
                    opacity: 0.3
                  }}
                >
                  Quick.bot transformed our customer support. We reduced response time by 70% and increased satisfaction scores significantly.
                </Text>
                <HStack spacing={4}>
                  <Box
                    w={14}
                    h={14}
                    bg="green.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    color="white"
                    fontSize="sm"
                  >
                    SM
                  </Box>
                  <VStack spacing={0} align="flex-start">
                    <Text fontWeight="semibold" fontSize="lg">
                      Sarah Martinez
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Head of Support, TechFlow
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </UrbiCard>

            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start">
                <HStack spacing={1}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      as={motion.span}
                      color="yellow.400"
                      fontSize="lg"
                      animate={{
                        scale: [1, 1.1, 1]
                      }}
                    >
                      <StarIcon />
                    </Box>
                  ))}
                </HStack>
                <Text
                  color="gray.700"
                  lineHeight="relaxed"
                  fontSize="lg"
                  fontWeight="medium"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    left: "-12px",
                    top: "-8px",
                    fontSize: "4xl",
                    color: "blue.300",
                    opacity: 0.3
                  }}
                >
                  The visual flow builder is incredibly intuitive. Our marketing team built complex chatbots without any coding knowledge.
                </Text>
                <HStack spacing={4}>
                  <Box
                    w={14}
                    h={14}
                    bg="blue.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    color="white"
                    fontSize="sm"
                  >
                    MJ
                  </Box>
                  <VStack spacing={0} align="flex-start">
                    <Text fontWeight="semibold" fontSize="lg">
                      Michael Johnson
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Marketing Director, GrowthLab
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </UrbiCard>

            <UrbiCard
              borderRadius="lg"
              border="1px solid"
              borderColor={cardBorderColor}
              boxShadow="md"
              p={8}
              position="relative"
              overflow="hidden"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <VStack spacing={6} align="flex-start">
                <HStack spacing={1}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      as={motion.span}
                      color="yellow.400"
                      fontSize="lg"
                      animate={{
                        scale: [1, 1.1, 1]
                      }}
                    >
                      <StarIcon />
                    </Box>
                  ))}
                </HStack>
                <Text
                  color="gray.700"
                  lineHeight="relaxed"
                  fontSize="lg"
                  fontWeight="medium"
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    left: "-12px",
                    top: "-8px",
                    fontSize: "4xl",
                    color: "purple.300",
                    opacity: 0.3
                  }}
                >
                  ROI was immediate. Our chatbots now handle 80% of inquiries and generate 25% more qualified leads monthly.
                </Text>
                <HStack spacing={4}>
                  <Box
                    w={14}
                    h={14}
                    bg="purple.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    color="white"
                    fontSize="sm"
                  >
                    AW
                  </Box>
                  <VStack spacing={0} align="flex-start">
                    <Text fontWeight="semibold" fontSize="lg">
                      Anna Williams
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      CEO, InnovateCo
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </UrbiCard>
          </Grid>

          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            gap={8}
            opacity={0.8}
          >
            <VStack spacing={2} textAlign="center">
              <Text fontWeight="bold" fontSize={{ base: "2xl", md: "3xl" }} color="brand.primary">
                99.9%
              </Text>
              <Text fontSize="sm" color={footerTextColor} fontWeight="medium">
                Uptime
              </Text>
            </VStack>
            <VStack spacing={2} textAlign="center">
              <Text fontWeight="bold" fontSize={{ base: "2xl", md: "3xl" }} color="brand.primary">
                {"<50ms"}
              </Text>
              <Text fontSize="sm" color={footerTextColor} fontWeight="medium">
                Response Time
              </Text>
            </VStack>
            <VStack spacing={2} textAlign="center">
              <Text fontWeight="bold" fontSize={{ base: "2xl", md: "3xl" }} color="brand.primary">
                24/7
              </Text>
              <Text fontSize="sm" color={footerTextColor} fontWeight="medium">
                Support
              </Text>
            </VStack>
            <VStack spacing={2} textAlign="center">
              <Text fontWeight="bold" fontSize={{ base: "2xl", md: "3xl" }} color="brand.primary">
                150+
              </Text>
              <Text fontSize="sm" color={footerTextColor} fontWeight="medium">
                Integrations
              </Text>
            </VStack>
          </Grid>
        </Container>
      </Box>

      <Box
        as="section"
        id="pricing"
        py={20}
        bgGradient="linear(to-b, white, gray.50)"
        position="relative"
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <VStack textAlign="center" mb={16} spacing={4}>
            <Badge
              px={6}
              py={2}
              rounded="full"
              border="2px solid"
              borderColor="whiteAlpha.400"
              bg="brand.primary"
              backdropFilter="blur(10px)"
              color="white"
              fontWeight="semibold"
              letterSpacing="wider"
              textTransform="uppercase"
              shadow="lg"
              alignItems="center"
              display="flex"
              gap="2"
            >
              Pricing
            </Badge>
            <H2
              fontSize={{ base: "3xl", lg: "4xl" }}

            >
              Simple, Transparent
              <Text
                as="span"
                display="block"
                bgGradient="linear(135deg, brand.primary, brand.primary)"
                bgClip="text"
              >
                Pricing Plans
              </Text>
            </H2>
            <Text
              fontSize="xl"
              color={textColor}
              maxW="3xl"
              mx="auto"
              lineHeight="relaxed"
            >
              Choose the perfect plan for your business needs. Start free and scale as you grow.
            </Text>
          </VStack>

          <Stack direction={{ base: "column", lg: "row" }} spacing={8} alignItems="stretch" justifyContent="center">
            {[
              {
                name: 'Free',
                description: 'Perfect for getting started with basic chatbot functionality and exploring our platform features',
                price: 0,
                chatsLimit: 200,
                botsLimit: 1,
                membersLimit: 1,
                allowCustomDomain: false,
                allowWhatsapp: false,
                allowAnalytics: false,
                allowGuests: false,
                allowResults: false,
                allowRemoveBrand: false,
                isPopular: false,
                icon: UserIcon
              },
              {
                name: 'Personal',
                description: 'Ideal for individuals and small projects who need more conversations and team collaboration',
                price: 49,
                chatsLimit: 2000,
                botsLimit: 1,
                membersLimit: 2,
                allowCustomDomain: false,
                allowWhatsapp: true,
                allowAnalytics: false,
                allowGuests: false,
                allowResults: false,
                allowRemoveBrand: false,
                isPopular: false,
                icon: UserIcon
              },
              {
                name: 'Business',
                description: 'Designed for growing businesses with advanced features like custom domains, WhatsApp integration, and analytics',
                price: 99,
                chatsLimit: 10000,
                botsLimit: 5,
                membersLimit: 5,
                allowCustomDomain: false,
                allowWhatsapp: true,
                allowAnalytics: true,
                allowGuests: false,
                allowResults: true,
                allowRemoveBrand: true,
                isPopular: true,
                icon: BuildingIcon
              },
              {
                name: 'Enterprise',
                description: 'Comprehensive solution for large organizations requiring high-volume conversations and extensive team management',
                price: 149,
                chatsLimit: 50000,
                botsLimit: 9999,
                membersLimit: 9999,
                allowCustomDomain: true,
                allowWhatsapp: true,
                allowAnalytics: true,
                allowGuests: true,
                allowResults: true,
                allowRemoveBrand: true,
                isPopular: false,
                icon: BagIcon
              }
            ].map((plan) => {
              const PlanIcon = plan.icon
              return (
                <UrbiCard
                  key={plan.name}
                  w={{ base: "full", lg: "350px" }}
                  h="auto"
                  borderRadius="lg"
                  border={plan.isPopular ? '2px solid' : '1px solid'}
                  borderColor={plan.isPopular ? 'green.500' : cardBorderColor}
                  boxShadow={plan.isPopular ? 'xl' : 'md'}
                  p={8}
                  position="relative"
                  overflow="hidden"
                  _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
                  transition="all 0.3s"
                >
                  {plan.isPopular && (
                    <Box
                      position="absolute"
                      top="35px"
                      right="-45px"
                      transform="rotate(45deg)"
                      bg="brand.primary"
                      color="white"
                      fontSize="xs"
                      fontWeight="bold"
                      px="10"
                      py="1"
                      boxShadow="md"
                      zIndex={2}
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      Most Popular
                    </Box>
                  )}

                  <VStack spacing={6} align="stretch">
                    <HStack spacing={4} mb={2}>
                      <Flex
                        w="60px"
                        h="60px"
                        bg="green.100"
                        borderRadius="md"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <PlanIcon h={8} w={8} color="brand.primary" />
                      </Flex>
                      <Text
                        fontSize="2xl"
                        fontWeight="semibold"

                      >
                        {plan.name}
                      </Text>
                    </HStack>

                    <Box minH="140px">
                      <Text fontSize="md" color={textColor} fontWeight="medium" mb={4}>
                        {plan.description}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="5xl" fontWeight="bold" >
                        ${plan.price}
                        <Text as="span" fontSize="xl" fontWeight="medium" color={textColor}>
                          /month
                        </Text>
                      </Text>
                    </Box>

                    <VStack spacing={3} align="stretch" py={4}>
                      <HStack>
                        <Check h={4} w={4} color="green.500" />
                        <Text fontSize="sm" color={textColor}>
                          {plan.membersLimit} team member{plan.membersLimit > 1 ? 's' : ''}
                        </Text>
                      </HStack>
                      <HStack>
                        <Check h={4} w={4} color="green.500" />
                        <Text fontSize="sm" color={textColor}>
                          {plan.botsLimit} bot{plan.botsLimit > 1 ? 's' : ''}
                        </Text>
                      </HStack>
                      <HStack>
                        <Check h={4} w={4} color="green.500" />
                        <Text fontSize="sm" color={textColor}>
                          {plan.chatsLimit.toLocaleString()} conversations/month
                        </Text>
                      </HStack>
                    </VStack>

                    <UrbiButton
                      size="lg"
                      bg={plan.isPopular ? "brand.primary" : "white"}
                      color={plan.isPopular ? "white" : "brand.primary"}
                      border={plan.isPopular ? "none" : "2px solid"}
                      borderColor={plan.isPopular ? "transparent" : "brand.primary"}
                      _hover={{
                        bg: plan.isPopular ? "brand.primary" : "green.50",
                        transform: "translateY(-2px)"
                      }}
                      shadow="md"
                      fontWeight="semibold"
                      w="full"
                    >
                      {plan.price === 0 ? "Start Free" : "Get Started"}
                    </UrbiButton>

                    <VStack spacing={2} align="stretch" fontSize="sm" color={textColor}>
                      <HStack>
                        {plan.allowWhatsapp ? (
                          <Check h={4} w={4} color="green.500" />
                        ) : (
                          <CloseIcon h={4} w={4} color="red" />
                        )}
                        <Text>WhatsApp Integration</Text>
                      </HStack>
                      <HStack>
                        {plan.allowAnalytics ? (
                          <Check h={4} w={4} color="green.500" />
                        ) : (
                          <CloseIcon h={4} w={4} color="red" />
                        )}
                        <Text>Advanced Analytics</Text>
                      </HStack>
                      <HStack>
                        {plan.allowRemoveBrand ? (
                          <Check h={4} w={4} color="green.500" />
                        ) : (
                          <CloseIcon h={4} w={4} color="red" />
                        )}
                        <Text>Remove Branding</Text>
                      </HStack>
                      <HStack>
                        {plan.allowCustomDomain ? (
                          <Check h={4} w={4} color="green.500" />
                        ) : (
                          <CloseIcon h={4} w={4} color="red" />
                        )}
                        <Text>Custom Domain</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </UrbiCard>
              )
            })}
          </Stack>

          <Box textAlign="center" mt={12}>
            <Text fontSize="sm" color={footerTextColor} mb={4}>
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </Text>
            <Button variant="link" color="brand.primary" fontWeight="semibold">
              Compare all features →
            </Button>
          </Box>
        </Container>
      </Box>

      <Box
        as="section"
        py={20}
        bgGradient="linear(to-br, green.50, emerald.50, teal.50)"
        position="relative"
        overflow="hidden"
        borderTop="1px solid"
        borderColor={headerBorderColor}
      >
        <Box position="absolute" inset={0}>
          <Box
            as={motion.div}
            position="absolute"
            top="20%"
            left="10%"
            w={32}
            h={32}
            bg="green.200"
            rounded="full"
            filter="blur(25px)"
            opacity={0.3}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
          />
          <Box
            as={motion.div}
            position="absolute"
            bottom="30%"
            right="15%"
            w={24}
            h={24}
            bg="emerald.200"
            rounded="full"
            filter="blur(20px)"
            opacity={0.25}
            animate={{
              x: [0, 30, 0],
              rotate: [0, 180, 360]
            }}
          />
        </Box>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} position="relative" zIndex={10}>
          <VStack spacing={12} textAlign="center">
            <VStack spacing={6}>
              <Badge
                px={6}
                py={2}
                rounded="full"
                border="2px solid"
                borderColor="whiteAlpha.400"
                bg="brand.primary"
                backdropFilter="blur(10px)"
                color="white"
                fontWeight="semibold"
                letterSpacing="wider"
                textTransform="uppercase"
                shadow="lg"
                alignItems="center"
                display="flex"
                gap="2"
              >
                Newsletter
              </Badge>
              <H2
                fontSize={{ base: "3xl", lg: "4xl" }}
                textAlign="center"
              >
                Stay Updated with
                <Text
                  as="span"
                  display="block"
                  bgGradient="linear(135deg, brand.primary, brand.primary)"
                  bgClip="text"
                >
                  Latest Features
                </Text>
              </H2>
              <Text
                fontSize="xl"
                color={textColor}
                maxW="2xl"
                mx="auto"
                lineHeight="relaxed"
              >
                Be the first to know about new features, product updates, and expert tips to maximize your chatbot&apos;s potential.
              </Text>
            </VStack>

            <Box
              as="form"
              id="newsletter-form"
              onSubmit={handleNewsletterSubmit}
              w="full"
              maxW="500px"
              mx="auto"
            >
              <FormControl isInvalid={!!emailError}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" m="4px">
                    <EmailIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    bg="white"
                    border="2px solid"
                    borderColor={emailError ? 'red.400' : 'gray.200'}
                    focusBorderColor={emailError ? 'red.500' : 'brand.primary'}
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                      borderColor: emailError ? 'red.400' : 'gray.300',
                    }}
                    shadow="md"
                    fontSize="md"
                    h="56px"
                    borderRadius="full"
                    pr="140px"
                  />
                  <Box position="absolute" right="4px" top="4px" zIndex={10}>
                    <Button
                      type="submit"
                      form="newsletter-form"
                      isLoading={isLoading}
                      loadingText="Subscribing..."
                      bg="brand.primary"
                      color="white"
                      _hover={{ bg: "brand.primary" }}
                      size="md"
                      h="48px"
                      px={8}
                      borderRadius="full"
                      fontWeight="semibold"
                      shadow="md"
                      _loading={{
                        bg: "brand.primary",
                        color: "white"
                      }}
                    >
                      Subscribe
                    </Button>
                  </Box>
                </InputGroup>
                {emailError && <FormErrorMessage mt={2}>{emailError}</FormErrorMessage>}
              </FormControl>
            </Box>

            <Stack
              direction={{ base: "column", sm: "row" }}
              spacing={{ base: 4, sm: 8 }}
              fontSize="sm"
              color={textColor}
              align="center"
              opacity={0.8}
            >
              <HStack spacing={3}>
                <Flex
                  align="center"
                  justify="center"
                  w={5}
                  h={5}
                  bg="green.400"
                  rounded="full"
                  shadow="sm"
                >
                  <Check h={3} w={3} color="white" />
                </Flex>
                <Text fontWeight="500">Weekly updates</Text>
              </HStack>
              <HStack spacing={3}>
                <Flex
                  align="center"
                  justify="center"
                  w={5}
                  h={5}
                  bg="green.400"
                  rounded="full"
                  shadow="sm"
                >
                  <Check h={3} w={3} color="white" />
                </Flex>
                <Text fontWeight="500">No spam, ever</Text>
              </HStack>
              <HStack spacing={3}>
                <Flex
                  align="center"
                  justify="center"
                  w={5}
                  h={5}
                  bg="green.400"
                  rounded="full"
                  shadow="sm"
                >
                  <Check h={3} w={3} color="white" />
                </Flex>
                <Text fontWeight="500">Unsubscribe anytime</Text>
              </HStack>
            </Stack>
          </VStack>
        </Container>
      </Box>

      <Box as="footer" py={16} borderTop="1px" borderColor={headerBorderColor} bgGradient="linear(to-b, white, gray.50)">
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr 1fr 1fr" }} gap={8}>
            <VStack spacing={6} align="flex-start">
              <HStack spacing={3}>
                <LogoIcon width="9" height="9" />
                <H3
                  as="span"
                  fontSize="2xl"
                  bgGradient="linear(135deg, gray.700, gray.800)"
                  bgClip="text"
                  fontWeight="bold"
                >
                  quick.bot
                </H3>
              </HStack>
              <Text color={textColor} lineHeight="relaxed" maxW="md">
                Build intelligent chatbots with ease. Transform your customer experience with AI-powered conversations
                that convert.
              </Text>
            </VStack>

            <VStack align="flex-start" spacing={6}>
              <H4 fontSize="lg">
                Product
              </H4>
              <VStack align="flex-start" spacing={4} color={textColor}>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Features
                </Link>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Pricing
                </Link>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Templates
                </Link>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Integrations
                </Link>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  API
                </Link>
              </VStack>
            </VStack>

            <VStack align="flex-start" spacing={6}>
              <H4 fontSize="lg">
                Support
              </H4>
              <VStack align="flex-start" spacing={4} color={textColor}>
                <Link href="https://docs.quick.bot/builder/getting-started/overview" _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Documentation
                </Link>
                <Link href="https://docs.quick.bot/support/faq" _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Help Center
                </Link>
                <Link href="https://docs.quick.bot/support/contact" _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Contact Us
                </Link>
                <Link href="https://status.quick.bot/" _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Status
                </Link>
                <Link href="https://discord.gg/Jbz7bKVz" _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Community
                </Link>
              </VStack>
            </VStack>

            <VStack align="flex-start" spacing={6}>
              <H4 fontSize="lg">
                Company
              </H4>
              <VStack align="flex-start" spacing={4} color={textColor}>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  About
                </Link>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Blog
                </Link>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Careers
                </Link>
                <Link href="https://docs.quick.bot/privacy-policies" _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Privacy
                </Link>
                <Link _hover={{ color: textHoverColor }} transition="color 0.2s">
                  Terms
                </Link>
              </VStack>
            </VStack>
          </Grid>

          <Divider my={12} borderColor={headerBorderColor} />

          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text color={footerTextColor}>
              © 2025 Quick.bot. All rights reserved.
            </Text>
            <HStack spacing={6} fontSize="sm" color={footerTextColor}>
              <Link href="https://docs.quick.bot/privacy-policies" _hover={{ color: "gray.700" }} transition="color 0.2s">
                Privacy Policy
              </Link>
              <Link _hover={{ color: "gray.700" }} transition="color 0.2s">
                Terms of Service
              </Link>
              <Link _hover={{ color: "gray.700" }} transition="color 0.2s">
                Cookie Policy
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}