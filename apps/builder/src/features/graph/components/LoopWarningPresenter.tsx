import React from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  IconButton,
  Portal,
  VStack,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react'
import { CloseIcon, AlertIcon } from '@urbiport/icons'
import { BoxCard, H4, MoreInfoTooltip } from '@urbiport/ui'
import { Loop, LoopWarning } from '../utils/loopDetector'

/**
 * View model for loop warnings - pure presentation data
 */
export interface LoopWarningViewModel {
  loopId: string
  message: string
  recommendation: string
  groupCount: number
  groupNames: string
  type: string
  severityColor: string
  groupIds: string[]
  severity: 'critical' | 'warning' | 'info'
}

interface LoopWarningPresenterProps {
  warnings: LoopWarningViewModel[]
  totalCount: number
  highestSeverityColor: string
  isOpen: boolean
  onWarningClick: (warning: LoopWarningViewModel) => void
  onClose: () => void
  onOpen: () => void
}

const getSeverityColor = (severity: 'critical' | 'warning' | 'info'): string => {
  switch (severity) {
    case 'critical':
      return 'red'
    case 'warning':
      return 'orange'
    case 'info':
      return 'blue'
  }
}

/**
 * Pure presentational component - only UI, no business logic
 */
export const LoopWarningPresenter = ({
  warnings,
  totalCount,
  highestSeverityColor,
  isOpen,
  onWarningClick,
  onClose,
  onOpen,
}: LoopWarningPresenterProps) => {
  if (warnings.length === 0) return null

  return (
    <Popover
      isLazy
      placement="top-start"
      closeOnBlur={false}
      closeOnEsc={true}
      isOpen={isOpen}
      onClose={onClose}
    >
      <PopoverTrigger>
        <IconButton
          icon={<AlertIcon />}
          aria-label="Loop warnings"
          size="sm"
          variant="squared:secondary"
          position="relative"
          bg={`red.200`}
          color={`red.800`}
          onClick={onOpen}
        />
      </PopoverTrigger>
      <Portal>
        <PopoverContent maxW="420px" p={3}>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="bold">
                  Warnings
                </Text>
                <Badge
                  height="5"
                  width="5"
                  justifyContent="center"
                  alignItems="center"
                  display="flex"
                  colorScheme={highestSeverityColor}
                  fontSize="xs"
                >
                  {totalCount}
                </Badge>
              </HStack>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Close warnings"
                icon={<CloseIcon />}
                onClick={onClose}
              />
            </HStack>

            <VStack
              align="stretch"
              spacing={2}
              maxH="400px"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              {warnings.map((warning) => (
                <BoxCard
                  key={warning.loopId}
                  bg="gray.50"
                  p={3}
                  borderRadius={2}
                  cursor="pointer"
                  transition="background 0.2s"
                  onClick={() => onWarningClick(warning)}
                  borderLeft="2px solid"
                  borderLeftColor={`${warning.severityColor}.400`}
                  _hover={{ bg: 'gray.100' }}
                >
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Badge
                        colorScheme={warning.severityColor}
                        fontSize="10px"
                        textTransform="uppercase"
                      >
                        {warning.type}
                      </Badge>
                      <Text fontSize="xs" color="gray.600">
                        {warning.groupCount} groups
                      </Text>
                    </HStack>
                    <HStack>
                      <MoreInfoTooltip>{warning.groupNames}</MoreInfoTooltip>
                      <H4>{warning.message}</H4>
                    </HStack>
                    <Text fontSize="xs" fontWeight="medium" color="gray.800">
                      {warning.recommendation}
                    </Text>
                  </VStack>
                </BoxCard>
              ))}
            </VStack>
          </VStack>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

/**
 * Transforms domain data into view models
 */
export const toWarningViewModel = (
  warning: LoopWarning,
  loop: Loop
): LoopWarningViewModel => ({
  loopId: warning.loopId,
  message: warning.message,
  recommendation: warning.recommendation,
  groupCount: loop.path.length,
  groupNames: warning.groupNames,
  type: loop.type,
  severityColor: getSeverityColor(loop.severity),
  groupIds: warning.groupIds,
  severity: loop.severity,
})
