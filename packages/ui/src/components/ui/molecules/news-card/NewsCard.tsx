import { Button, Divider, Stack, Text, Image } from '@chakra-ui/react'
import React from 'react'

export type ItemNewsCard = {
  id: string | number
  image: string
  title: string
  content: string
  btnText: string
}

type Props = {
  item: ItemNewsCard
}

export const NewsCard = (props: Props) => {
  return (
    <Stack
      key={props.item.id}
      spacing={2}
      alignItems="center"
      borderWidth="1px"
      borderColor="divider.light"
      borderRadius="sm"
      pb={2}
      overflow="hidden"
    >
      <Image src={props.item.image} alt={props.item.title} loading="lazy" width="100%" />
      <Text color="text.light" px={2} textAlign="center" fontWeight="medium">
        {props.item.content}
      </Text>
      <Divider width="100%" color="divider.lighter" />
      <Button
        as="a"
        href="#"
        variant="ghost"
        size="sm"
        color="brand.primary"
        textTransform="uppercase"
        sx={{
          height: '30px',
        }}
      >
        {props.item.btnText}
      </Button>
    </Stack>
  )
}
