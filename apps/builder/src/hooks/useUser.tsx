import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import posthog from 'posthog-js'
import { useDispatch, useSelector } from 'react-redux'
import { useDebouncedCallback } from 'use-debounce'
import { User } from '@quickbot.io/schemas'
import { useToast } from '@urbiport/ui'
import { RootState } from '@/store/store'
import { setAccount } from '@/store/account/accountReducer'
import { updateUserQuery } from '@/features/account/queries/updateUserQuery'
import { isArrayOfStrings, isRecordOfBooleans } from '@quickbot.io/lib'
import { useColorMode } from '@chakra-ui/react'
import { useLoadingSave } from './useLoadingSave'

export function sanitizeUser(rawUser: Partial<User>): User {
  return {
    ...rawUser,
    displayedInAppNotifications: isRecordOfBooleans(rawUser.displayedInAppNotifications)
      ? rawUser.displayedInAppNotifications
      : null,
    onboardingCategories: isArrayOfStrings(rawUser.onboardingCategories)
      ? rawUser.onboardingCategories
      : [],
  } as User
}

export const useUser = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { showToast } = useToast()
  const { setColorMode } = useColorMode()
  const setLoadingSave = useLoadingSave()
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'

  const user = useSelector((state: RootState) => state.account.user)

  const resolvedUser = session?.user ? sanitizeUser(session?.user as Partial<User>) : undefined

  // Ya no necesitamos rutas hardcodeadas - los layouts de auth evitan el loop
  const isSignInPath = false

  const isPathPublicFriendly = useMemo(
    () => /\/bot\/.+\/(flow|theme|settings)/.test(router.pathname),
    [router.pathname],
  )

  useEffect(() => {
    if (!router.isReady || status === 'loading' || isSignInPath || isPathPublicFriendly) return

    if (!user && status === 'unauthenticated') {
      router.replace({
        pathname: '/signin',
        query: { redirectPath: router.asPath },
      })
    }
  }, [router.isReady, status, user, isSignInPath, isPathPublicFriendly, router])

  useEffect(() => {
    if (resolvedUser && user?.id !== resolvedUser.id) {
      dispatch(setAccount(resolvedUser))
    }
  }, [resolvedUser, user, dispatch])

  // Sync chakra-ui locale storage with user preference
  useEffect(() => {
    if (!user?.preferredAppAppearance) return

    setColorMode(user.preferredAppAppearance)
  }, [user?.preferredAppAppearance, setColorMode])

  const updateUser = useDebouncedCallback(async (userData: Partial<User>) => {
    if (!user?.id) return
    const { error } = await updateUserQuery(user.id, userData)

    setLoadingSave()
    if (error) {
      showToast({
        title: error.name,
        description: error.message,
        status: 'error',
      })
      return
    }
    dispatch(setAccount({ ...user, ...userData }))
  }, 200)

  const signOutUser = async () => {
    await posthog.capture('user_logout', {
      user_id: user?.id,
      email: user?.email,
      name: user?.name,
      source: 'frontend',
    })

    await signOut({ redirect: false })
    dispatch(setAccount(undefined))
    router.push('/signin')
  }

  return {
    user,
    isLoading,
    updateUser,
    signOutUser,
  }
}
