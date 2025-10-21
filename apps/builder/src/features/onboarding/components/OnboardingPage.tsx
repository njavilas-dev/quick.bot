import { ChevronRightIcon } from '@urbiport/icons'
import { Button, Flex, HStack, StackProps, VStack, chakra } from '@chakra-ui/react'
import { Standard } from '@urbiport/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useUser } from '@/hooks/useUser'
import { useTranslate } from '@tolgee/react'
import { env } from '@quickbot.io/env'

const totalSteps = 5

export const OnboardingPage = () => {
  const { t } = useTranslate()
  const { replace, query } = useRouter()
  const confettiCanvaContainer = useRef<HTMLCanvasElement | null>(null)
  const confettiCanon = useRef<confetti.CreateTypes>()
  const { user, updateUser } = useUser()
  const [currentStep, setCurrentStep] = useState<number>(user?.name ? 2 : 1)
  const [onboardingReplies, setOnboardingReplies] = useState<{
    name?: string
    company?: string
    onboardingCategories?: string[]
    referral?: string
  }>({})

  const isNewUser =
    user &&
    new Date(user.createdAt as unknown as string).toDateString() === new Date().toDateString()

  useEffect(() => {
    initConfettis()
  })

  useEffect(() => {
    if (!user?.createdAt) return
    if (isNewUser === false || !env.NEXT_PUBLIC_ONBOARDING_BOT_ID)
      replace({ pathname: '/bots', query })
  }, [isNewUser, query, replace, user?.createdAt])

  const initConfettis = () => {
    if (!confettiCanvaContainer.current || confettiCanon.current) return
    confettiCanon.current = confetti.create(confettiCanvaContainer.current, {
      resize: true,
      useWorker: true,
    })
  }

  const setOnboardingAnswer = async (answer: { message: string; blockId: string }) => {
    const isName = answer.blockId === 'cl126820m000g2e6dfleq78bt'
    const isCompany = answer.blockId === 'cl126jioz000v2e6dwrk1f2cb'
    const isCategories = answer.blockId === 'cl126lb8v00142e6duv5qe08l'
    const isOtherCategory = answer.blockId === 'cl126pv7n001o2e6dajltc4qz'
    const isReferral = answer.blockId === 'phcb0s1e9qgp0f8l2amcu7xr'
    const isOtherReferral = answer.blockId === 'saw904bfzgspmt0l24achtiy'
    if (isName) setOnboardingReplies((prev) => ({ ...prev, name: answer.message }))
    if (isCategories) {
      const onboardingCategories = answer.message.split(', ')
      setOnboardingReplies((prev) => ({
        ...prev,
        onboardingCategories,
      }))
    }
    if (isOtherCategory)
      setOnboardingReplies((prev) => ({
        ...prev,
        onboardingCategories: prev.onboardingCategories
          ? [...prev.onboardingCategories, answer.message]
          : [answer.message],
      }))
    if (isCompany) {
      setOnboardingReplies((prev) => ({ ...prev, company: answer.message }))
      if (confettiCanon.current) shootConfettis(confettiCanon.current)
    }
    if (isReferral) setOnboardingReplies((prev) => ({ ...prev, referral: answer.message }))
    if (isOtherReferral) setOnboardingReplies((prev) => ({ ...prev, referral: answer.message }))
    setCurrentStep((prev) => prev + 1)
  }

  const skipOnboarding = () => {
    updateUser(onboardingReplies)
    replace({ pathname: '/bots', query })
  }

  const updateUserAndProceedToBotCreation = () => {
    updateUser(onboardingReplies)
    setTimeout(() => {
      replace({
        pathname: '/bot',
        query: { ...query },
      })
    }, 2000)
  }

  if (!isNewUser) return null
  return (
    <VStack h="100vh" flexDir="column" justifyContent="center" spacing="10">
      <Button
        rightIcon={<ChevronRightIcon />}
        pos="fixed"
        top="5"
        right="5"
        variant="ghost"
        size="sm"
        onClick={skipOnboarding}
      >
        {t('skip')}
      </Button>
      <Dots currentStep={currentStep} pos="fixed" top="9" />
      <Flex w="full" maxW="800px" h="full" maxH="70vh" borderRadius="lg">
        <Standard
          bot={env.NEXT_PUBLIC_ONBOARDING_BOT_ID}
          style={{ borderRadius: 'sm' }}
          prefilledVariables={{ Name: user?.name, Email: user?.email }}
          onEnd={updateUserAndProceedToBotCreation}
          onAnswer={setOnboardingAnswer}
        />
      </Flex>
      <chakra.canvas
        ref={confettiCanvaContainer}
        pos="fixed"
        top="0"
        left="0"
        w="full"
        h="full"
        zIndex={9999}
        pointerEvents="none"
      />
    </VStack>
  )
}

const Dots = ({ currentStep, ...props }: { currentStep: number } & StackProps) => {
  return (
    <HStack spacing="10" {...props}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <chakra.div
          key={index}
          boxSize={'2'}
          bgColor={currentStep === index + 1 ? 'bg.darken' : 'blocksGray'}
          borderRadius="full"
          transition="background-color 0.2s ease"
        />
      ))}
    </HStack>
  )
}

const shootConfettis = (confettiCanon: confetti.CreateTypes) => {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
  }

  const fire = (
    particleRatio: number,
    opts: {
      spread: number
      startVelocity?: number
      decay?: number
      scalar?: number
    },
  ) => {
    confettiCanon(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      }),
    )
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}
