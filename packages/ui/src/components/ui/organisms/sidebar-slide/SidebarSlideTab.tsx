import React from 'react'

interface SidebarTabProps {
  label: string
  children: React.ReactNode
}

export const SidebarSlideTab: React.FC<SidebarTabProps> = ({ children }) => {
  return <>{children}</>
}
