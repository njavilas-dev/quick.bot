import React from 'react'
import { Heading, Text, Link } from '@chakra-ui/react'
import { Box, Button } from '../../atoms'

type PageNotFoundProps = {
  withButton?: boolean
  t: (key: string) => string
}

export const PageNotFound = ({ withButton = false, t }: PageNotFoundProps) => {

  return (
    <Box
      display={'flex'}
      h={'100vh'}
      w={'100vw'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <Heading as="h1" size="2xl" mb={6}>
        <Text as="span">quick</Text>
        <Text as="span" color="brand.primary">.bot</Text>
      </Heading>

      <Text color="gray.400" fontSize="xl" fontWeight="light" mb={2}>
        {t('error.404')}
      </Text>

      <Text color="gray.300" fontSize="lg" fontWeight="light" mb={6}>
        {t('error.404.title')}
      </Text>

      {withButton && <Button
        as={Link} // Usar Link de Chakra UI
        href="/dashboard"
        px={6}
        py={2}
      >
        {t('error.404.button')}
      </Button>}
    </Box>
  )
}
