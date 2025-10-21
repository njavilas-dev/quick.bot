import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react'

export type IReactElement =
  | ReactElement<unknown, string | JSXElementConstructor<unknown>>
  | string
  | number
  | ReactNode[]
  | ReactPortal
  | boolean
  | undefined
  | null