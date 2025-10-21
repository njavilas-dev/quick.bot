import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Text,
  Button,
  ModalFooter,
  Flex,
  Alert,
  List,
  ListItem,
  ListIcon,
  VStack
} from '@chakra-ui/react'
import { useWorkspace } from '@/hooks/useWorkspace'
import Link from 'next/link'
import React from 'react'
import { CheckCircleIcon, GoogleLogo } from '@urbiport/icons'
import { getGoogleSheetsConsentScreenUrlQuery } from '../queries/getGoogleSheetsConsentScreenUrlQuery'

type Props = {
  isOpen: boolean
  botId?: string
  blockId?: string
  onClose: () => void
}

export const GoogleSheetConnectModal = ({ botId, blockId, isOpen, onClose }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      blockScrollOnMount={true}
    >
      <ModalOverlay />
      <GoogleSheetConnectModalContent botId={botId} blockId={blockId} />
    </Modal>
  )
}

export const GoogleSheetConnectModalContent = ({
  botId,
  blockId,
}: {
  botId?: string
  blockId?: string
}) => {
  const { workspace } = useWorkspace()

  return (
    <ModalContent>
      <ModalHeader>Connect Spreadsheets</ModalHeader>
      <ModalCloseButton />
      <ModalBody as={Stack} spacing="6">
        <Text>
          Make sure to check all the permissions so that the integration works as expected:
        </Text>
        <Alert status="info">
          <VStack align="start" spacing={2} w="100%">
            <Text fontWeight="semibold">Requested permissions:</Text>
            <List spacing={1} fontSize="sm">
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="blue.500" />
                Read and write to your spreadsheets
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="blue.500" />
                Create new sheets when necessary
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="blue.500" />
                Access file metadata
              </ListItem>
            </List>
          </VStack>
        </Alert>

        <Flex>
          {workspace?.id && (
            <Button
              as={Link}
              leftIcon={<GoogleLogo />}
              data-testid="google"
              isLoading={['loading', 'authenticated'].includes(status)}
              variant="outline"
              href={getGoogleSheetsConsentScreenUrlQuery(
                window.location.href,
                workspace.id,
                blockId,
                botId,
              )}
              mx="auto"
              w="full"
            >
              Continue with Google
            </Button>
          )}
        </Flex>
      </ModalBody>
      <ModalFooter />
    </ModalContent>
  )
}
