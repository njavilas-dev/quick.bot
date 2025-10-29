import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { FileIcon } from '@urbiport/icons'
import { isImageUrl } from '../../utils/videoEmbedUtils'
import { ImageContent } from './ImageContent'
import { BubbleBox } from '../MessageBubble/BubbleContainer'

interface AttachmentListProps {
  attachments: string[]
  maxW?: string
}

const getFileExtension = (url: string): string => {
  const parts = url.split('.')
  return parts[parts.length - 1]?.toUpperCase() || 'FILE'
}

const getFileName = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const fileName = pathname.split('/').pop() || 'file'
    return decodeURIComponent(fileName)
  } catch {
    return url.split('/').pop() || 'file'
  }
}

const FileIconBox: React.FC = () => (
  <Box
    bg="pink.400"
    borderRadius="lg"
    p={3}
    display="flex"
    alignItems="center"
    justifyContent="center"
    minW="60px"
    minH="60px"
  >
    <FileIcon boxSize={6} color="white" />
  </Box>
)

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  maxW = '400px',
}) => {
  if (!attachments || attachments.length === 0) return null

  // Filter duplicates and clean spaces
  const uniqueAttachments = Array.from(
    new Set(attachments.map((url) => url.trim()).filter((url) => url.length > 0))
  )

  return (
    <VStack spacing={2} align="flex-end" w="full">
      {uniqueAttachments.map((url, index) => {
        if (isImageUrl(url)) {
          return (
            <ImageContent
              key={url}
              url={url}
              alt={`Attachment ${index + 1}`}
              maxW="100%"
              maxH="300px"
            />
          )
        }

        const fileName = getFileName(url)
        const fileExtension = getFileExtension(url)

        return (
          <BubbleBox
            key={url}
            as="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            alignItems="center"
            gap={3}
            p={3}
            maxW={maxW}
            w="full"
            border="1px solid"
            borderColor="divider.light"
            _hover={{
              bg: 'divider.lighter',
              transform: 'translateY(-2px)',
              shadow: 'md',
              transition: 'all 0.2s',
            }}
            cursor="pointer"
            textDecoration="none"
          >
            <FileIconBox />
            <VStack align="flex-start" spacing={0}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                noOfLines={1}
                w="full"
              >
                {fileName}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {fileExtension}
              </Text>
            </VStack>
          </BubbleBox>
        )
      })}
    </VStack>
  )
}
