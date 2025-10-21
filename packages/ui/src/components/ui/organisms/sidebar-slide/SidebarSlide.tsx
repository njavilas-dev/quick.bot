import React, { ReactNode } from 'react'
import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Tooltip,
  IconButton,
  Fade,
} from '@chakra-ui/react'
import { LockedIcon, UnlockedIcon } from '@urbiport/icons'
import { useSidebarSlide } from './SidebarSlideProvider'
import { SidebarSlideTab } from './SidebarSlideTab'
import { H3 } from '../../atoms'

interface SidebarSlideLabels {
  lockTooltip: string
  unlockTooltip: string
  lockIconAriaLabel: string
  unlockIconAriaLabel: string
}

interface SidebarSlideProps {
  children: ReactNode
  title: string
  labels: SidebarSlideLabels
  isFitted?: boolean
}

export const SidebarSlide: React.FC<SidebarSlideProps> = ({
  title,
  labels,
  children,
  isFitted = false,
}) => {
  const {
    isExtended,
    isLocked,
    setIsLocked,
    openSidebar,
    cancelOpenSidebar,
    closeSidebar,
    cancelCloseSidebar,
  } = useSidebarSlide()

  const handleMouseLeave = () => {
    if (!isLocked) {
      cancelOpenSidebar()
      closeSidebar()
    }
  }

  const handleDockBarEnter = () => {
    if (!isLocked) {
      cancelCloseSidebar()
      openSidebar()
    }
  }

  const handleLockClick = () => {
    setIsLocked((prev) => !prev)
  }

  const childrenArray = React.Children.toArray(children)
  const isTabs = childrenArray.every(
    (child) => React.isValidElement(child) && child.type === SidebarSlideTab,
  )

  return (
    <Flex
      py={3}
      bg="bg.normal"
      direction="column"
      width="300px"
      borderRight="1px solid"
      borderColor="divider.light"
      gap={6}
      zIndex="2"
      pos="absolute"
      left={0}
      onMouseLeave={handleMouseLeave}
      transform={isExtended ? 'translateX(0)' : 'translateX(-300px)'}
      transition="transform 350ms cubic-bezier(0.075, 0.82, 0.165, 1) 0s"
      h="full"
    >
      <Flex py={3} direction="column" userSelect="none" overflowY="auto" gap={6} px={4}>
        <Flex w="full" mt={0} justify="space-between" h="48px">
          <H3>{title}</H3>
          <Tooltip
            label={
              isLocked
                ? labels.unlockTooltip ?? labels.unlockIconAriaLabel
                : labels.lockTooltip ?? labels.lockIconAriaLabel
            }
          >
            <IconButton
              variant="outline"
              icon={isLocked ? <LockedIcon /> : <UnlockedIcon />}
              aria-label={isLocked ? labels.unlockIconAriaLabel : labels.lockIconAriaLabel}
              size="sm"
              onClick={handleLockClick}
            />
          </Tooltip>
        </Flex>
        {isTabs ? (
          <Tabs isLazy isFitted={isFitted} colorScheme="green">
            <TabList mb={4}>
              {childrenArray.map((child, index) => (
                <Tab key={index}>{(child as React.ReactElement).props.label}</Tab>
              ))}
            </TabList>
            <TabPanels>
              {childrenArray.map((child, index) => (
                <TabPanel p={0} key={index}>
                  {(child as React.ReactElement).props.children}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        ) : (
          <>{children}</>
        )}
      </Flex>
      <Fade in={!isLocked} unmountOnExit>
        <Flex
          pos="absolute"
          h="100%"
          right="-70px"
          w="450px"
          top="0"
          justify="flex-end"
          pr="10"
          align="center"
          onMouseEnter={handleDockBarEnter}
          zIndex={-1}
        >
          <Flex w="5px" h="20px" bgColor="gray.400" rounded="md" />
        </Flex>
      </Fade>
    </Flex>
  )
}
