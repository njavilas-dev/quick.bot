import { ReactNode } from 'react'

type MinimalLayoutProps = {
  children: ReactNode
}

export const MinimalLayout = ({ children }: MinimalLayoutProps) => {
  return <>{children}</>
}
