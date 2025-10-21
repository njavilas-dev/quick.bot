import React from 'react'
import { Text, Avatar, MenuItem, MenuDivider } from '@chakra-ui/react'
import Link from 'next/link'
import { DropdownMenu } from '@urbiport/ui'
import { useRouter } from 'next/router'
import { useUser } from '@/hooks/useUser'

export const AccountDropdown = () => {
  const { user, signOutUser } = useUser()
  const router = useRouter()
  const currentPage = router.pathname

  const handleLogOut = async () => {
    await signOutUser()
  }

  return (
    <DropdownMenu
      placement="bottom-end"
      matchWidth={false}
      menuButton={
        <Avatar name={user?.name || ''} src={user?.image || undefined} h="40px" w="40px" borderRadius="full" />
      }
      menuButtonProps={{
        'aria-label': 'User Account Menu',
        variant: 'unstyled',
        bg: 'transparent',
        sx: {
          span: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }
      }}
    >
      <MenuItem display="flex" flexDirection="column" alignItems="flex-start" aria-selected={false}>
        <Text>{user?.name}</Text>
        <Text>{user?.email}</Text>
      </MenuItem>
      <MenuDivider />
      <MenuItem
        as={Link}
        href="/account/profile"
        aria-selected={currentPage === '/account/profile' ? 'true' : 'false'}
      >
        Profile
      </MenuItem>
      <MenuItem
        as={Link}
        href="/account/preferences"
        aria-selected={currentPage === '/account/preferences' ? 'true' : 'false'}
      >
        Preferences
      </MenuItem>
      <MenuItem
        as={Link}
        href="/account/notifications"
        aria-selected={currentPage === '/account/notifications' ? 'true' : 'false'}
      >
        Notifications
      </MenuItem>
      <MenuDivider />
      <MenuItem onClick={handleLogOut} aria-selected="false">
        Logout
      </MenuItem>
    </DropdownMenu >
  )
}
