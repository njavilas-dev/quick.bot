import { Button, Text, Link, VStack } from '@chakra-ui/react'
import React from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SignInError } from './SignInError'
import { EmailIcon } from '@urbiport/icons'
import { useTranslate } from '@tolgee/react'
import { FormControl, InputText, InputPassword } from '@urbiport/ui'

export const SignInForm = () => {
  const { t } = useTranslate()
  const router = useRouter()

  const handleSubmitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const { email, password } = Object.fromEntries(formData.entries())

    await signIn('credentials', {
      redirect: true,
      username: email,
      password,
    })
  }
  return (
    <form onSubmit={handleSubmitLogin}>
      <VStack w="full" spacing={8}>
        <VStack w="full" spacing={6}>
          <FormControl>
            <InputText
              type="email"
              name="email"
              placeholder="Email"
              size="lg"
              leftIcon={<EmailIcon color="text.light" />}
            />
          </FormControl>
          <FormControl>
            <InputPassword
              isRequired
              size="lg"
              name="password"
              placeholder={t('auth.password.input')}
              title={t('auth.password.invalid')}
            />
            <Link href="/forgot-password">
              <Text fontSize="xs" color="text.light" mt={1}>
                {t('auth.signin.forgetPassword.link')}
              </Text>
            </Link>
          </FormControl>
        </VStack>
        {router.query.error && <SignInError error={router.query.error.toString()} />}
        <Button
          type={'submit'}
          colorScheme="green"
          size="lg"
          width="100%"
          textTransform="uppercase"
          height="42px"
        >
          {t('auth.signin.login.button')}
        </Button>
      </VStack>
    </form>
  )
}
