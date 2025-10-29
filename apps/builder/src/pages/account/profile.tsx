import { AccountProfileForm } from '@/features/account/components/AccountProfileForm'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'
import React, { ReactNode } from 'react'
import { Stack, Text, Skeleton } from '@chakra-ui/react'
import { BoxCard, H2 } from '@urbiport/ui'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { validateResetPasswordToken } from '@/features/auth/helpers/validateResetPasswordToken'
import { SignInError } from '@/features/auth/components/SignInError'
import { AccountLayout } from '@/components/layouts/AccountLayout'

const ProfilePage = () => {
  const router = useRouter()
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    const token = router.query.resetToken as string | undefined

    if (token) {
      setIsValidating(true)
      setResetToken(token)

      validateResetPasswordToken(token)
        .then((isValid) => {
          setIsValidToken(isValid)
        })
        .finally(() => {
          setIsValidating(false)
        })
    } else {
      setResetToken(null)
    }
  }, [router.query])

  return (
    <BoxCard>
      {resetToken ? (
        <Stack spacing={1}>
          <H2>Reset Password</H2>
          <Text fontSize="sm" color="text.light">
            Enter your new password below.
          </Text>
          {isValidating && <Skeleton width="100%" height="20px" />}
          {!isValidating && !isValidToken && (
            <SignInError error={'Invalid or expired token'}></SignInError>
          )}
          {!isValidating && isValidToken && <ResetPasswordForm token={resetToken} />})
        </Stack>
      ) : (
        <Stack spacing={1}>
          <H2>Profile</H2>
          <Text fontSize="sm" color="text.light">
            You can update your profile from here.
          </Text>
          <AccountProfileForm />
        </Stack>
      )}
    </BoxCard>
  )
}

ProfilePage.getLayout = function getLayout(page: ReactNode) {
  return <AccountLayout>{page}</AccountLayout>
}
export default ProfilePage
