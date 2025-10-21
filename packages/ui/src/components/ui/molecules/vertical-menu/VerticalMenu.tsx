import React, { useState, useRef } from 'react'
import {
  Box,
  Flex,
  IconButton,
  Text,
  Tooltip,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
  PopoverBody,
  useOutsideClick,
} from '@chakra-ui/react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  IconComponentType,
  LogoIcon,
  MoonIcon,
  SunIcon,
  QuestionnaireIcon,
} from '@urbiport/icons'
import { Button, H3 } from '../../index'

export type SubMenuItem = {
  name: string
  href: string
  icon: IconComponentType
  isActive?: () => boolean
}

export type MenuItem = {
  name: string
  path: string
  href: string
  icon: IconComponentType
  location: string
  subMenu: SubMenuItem[] | []
  isActive?: () => boolean
}

type Props = {
  supportBotId?: string
  defaultAppearance: string
  onChangeAppearance: (value: string) => void
  menuSections: MenuItem[]
  redirect: (href: string) => void
  upgradeButton?: React.ReactElement
  searchComponent?: React.ReactElement
}

enum AppearanceMode {
  light = 'light',
  dark = 'dark',
}

const appearanceData = {
  light: 'Light',
  dark: 'Dark',
}

export const VerticalMenu = ({
  supportBotId,
  defaultAppearance,
  onChangeAppearance,
  menuSections,
  redirect,
  upgradeButton,
  searchComponent,
}: Props) => {
  const [showSubMenu, setShowSubMenu] = useState(true)
  const [appearance, setAppearance] = useState<AppearanceMode>(defaultAppearance as AppearanceMode)
  const popoverRef = useRef<HTMLDivElement>(null)

  const changeAppearance = () => {
    if (appearance === AppearanceMode.light) {
      setAppearance(AppearanceMode.dark)
      onChangeAppearance(AppearanceMode.dark)
    } else {
      setAppearance(AppearanceMode.light)
      onChangeAppearance(AppearanceMode.light)
    }
  }

  // Rutas que tienen parámetros dinámicos (/:param/page)
  const DYNAMIC_ROUTES = ['analytics', 'bots']

  const languagePrefixes = new Set(['es', 'en', 'fr'])

  const pathSegments = window?.location?.pathname.split('/').filter(Boolean) || []

  const pathSegmentsClean = languagePrefixes?.has(pathSegments[0])
    ? pathSegments?.slice(1)
    : pathSegments

  // Determinar el currentMenuPath de forma inteligente
  const getCurrentMenuPath = (): string => {
    if (pathSegmentsClean.length === 0) return ''

    // Si es una ruta dinámica, usar el primer segmento
    if (DYNAMIC_ROUTES.includes(pathSegmentsClean[0])) {
      return pathSegmentsClean[0]
    }

    // Para el resto, usar lógica tradicional
    const cleanPath = pathSegmentsClean.length > 2 ? pathSegmentsClean.slice(1) : pathSegmentsClean
    return cleanPath[0] || ''
  }

  const currentMenuPath = getCurrentMenuPath()
  const currentMenu = menuSections?.find((section) => section?.path === currentMenuPath)
  const currentSubMenu = currentMenu?.subMenu

  const redirectHandler = (href: string) => {
    redirect(href)
  }

  const toggleSubMenu = () => {
    setShowSubMenu(!showSubMenu)
  }

  const { onOpen, onClose, isOpen } = useDisclosure()

  useOutsideClick({
    ref: popoverRef,
    handler: () => {
      if (isOpen) {
        onClose()
      }
    },
  })

  return (
    <>
      <Flex
        bg="bg.normal"
        width="64px"
        minW="64px"
        direction="column"
        align="center"
        justify="space-between"
        borderRight="1px solid"
        borderColor="divider.light"
        py={3}
      >
        <Flex direction="column" gap="4">
          <IconButton
            icon={<LogoIcon width="9" height="9" />}
            variant={'link'}
            aria-label={appearanceData[appearance]}
            borderRadius="full"
            h="48px"
            w="48px"
          />
          {menuSections
            .filter((section) => section.location === 'up')
            .map((section, index) => {
              const isActive = section?.isActive?.()
              const Icon = section.icon

              return (
                <Tooltip
                  key={index}
                  label={section.name}
                  aria-label={section.name}
                  placement="right"
                  hasArrow
                >
                  <Button
                    as={Link}
                    href={section?.href}
                    variant="ghost"
                    borderRadius="full"
                    h="48px"
                    w="48px"
                    padding={0}
                    backgroundColor={isActive ? 'green.50' : 'transparent'}
                    color={isActive ? 'brand.dark' : 'text.light'}
                    aria-label={section.name}
                  >
                    <Icon />
                  </Button>
                </Tooltip>
              )
            })}
        </Flex>
        <Flex direction="column" gap={5}>
          <Tooltip label={appearanceData[appearance]} placement="right" hasArrow>
            <Button
              aria-label={appearanceData[appearance]}
              variant="ghost"
              borderRadius="full"
              h="48px"
              w="48px"
              padding={0}
              backgroundColor={'transparent'}
              color="text.light"
              onClick={changeAppearance}
            >
              {appearanceData[appearance] === 'Light' ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Tooltip>
          {menuSections
            .filter((section) => section.location === 'down')
            .map((section, index) => {
              const isActive = section?.isActive?.()
              const Icon = section.icon

              return (
                <Tooltip
                  key={index}
                  label={section.name}
                  aria-label={section.name}
                  placement="right"
                  hasArrow
                >
                  <Button
                    as={Link}
                    href={section?.href}
                    key={index}
                    variant="ghost"
                    borderRadius="full"
                    h="48px"
                    w="48px"
                    padding={0}
                    backgroundColor={isActive ? 'green.50' : 'transparent'}
                    color={isActive ? 'brand.dark' : 'text.light'}
                    aria-label={section.name}
                  >
                    <Icon />
                  </Button>
                </Tooltip>
              )
            })}
          <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            placement="top-end"
            closeOnBlur={false}
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [16, 0]
                },
              },
            ]}
          >
            <PopoverTrigger>
              <div>
                <Tooltip label="Support" placement="right" hasArrow>
                  <Button
                    aria-label="Support"
                    variant="ghost"
                    borderRadius="full"
                    h="48px"
                    w="48px"
                    backgroundColor={isOpen ? 'green.50' : 'transparent'}
                    color={isOpen ? 'brand.dark' : 'text.light'}
                    padding={0}
                  >
                    <QuestionnaireIcon />
                  </Button>
                </Tooltip>
              </div>
            </PopoverTrigger>

            <PopoverContent w="400px" h="650px" ml="24px" p={0} ref={popoverRef}>
              <PopoverBody p={1} w="100%" h="100%">
                <iframe
                  src={supportBotId}
                  style={{ border: 'none', width: '100%', height: '100%' }}
                ></iframe>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
      </Flex>
      {currentSubMenu && currentSubMenu?.length > 0 && showSubMenu && (
        <Flex
          py={3}
          bg="bg.normal"
          direction="column"
          width="300px"
          borderRight="1px solid"
          borderColor="divider.light"
          gap={6}
        >
          {searchComponent && (
            <Flex mt={0} align="center" h="48px" px={4}>
              {searchComponent}
            </Flex>
          )}
          <Flex mt={0} align="center" h="48px" px={4}>
            <H3>{currentMenu?.name}</H3>
          </Flex>
          <Flex direction="column" gap={2} p={2}>
            {currentSubMenu.map((section, index) => {
              const isActive = section?.isActive?.()
              const Icon = section.icon
              return (
                <Button
                  key={index}
                  variant="ghost"
                  backgroundColor={isActive ? 'green.50' : 'transparent'}
                  color={isActive ? 'brand.dark' : 'text.light'}
                  aria-label={section.name}
                  onClick={() => redirectHandler(section?.href)}
                  h="48px"
                  justifyContent={'flex-start'}
                  gap={2}
                  width="full"
                  leftIcon={<Icon />}
                >
                  <Text color="text.normal">{section.name}</Text>
                </Button>
              )
            })}
          </Flex>
          {upgradeButton && (
            <Flex
              borderTop="1px solid"
              borderColor="divider.light"
              alignContent="center"
              alignItems="center"
              mt="auto"
              pt={4}
              pb={2}
              px={6}
            >
              {upgradeButton}
            </Flex>
          )}
        </Flex>
      )}
      {currentSubMenu && currentSubMenu?.length > 0 && (
        <Box w="0px">
          <IconButton
            onClick={toggleSubMenu}
            zIndex={1}
            size="xs"
            bgColor="bg.dark"
            border="1px solid"
            borderColor="divider.light"
            variant="bordered"
            position="relative"
            top={5}
            left={'-12px'}
            borderRadius="full"
            aria-label={'Close'}
            icon={
              showSubMenu ? (
                <ChevronLeftIcon color="text.normal" />
              ) : (
                <ChevronRightIcon color="text.normal" />
              )
            }
          />
        </Box>
      )}
    </>
  )
}
