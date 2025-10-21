import { ReactNode } from 'react'

export const parseValue = (item: string | { value: string; label: ReactNode }) =>
  typeof item === 'string' ? item : item.value

export const parseLabel = (item: string | { value: string; label: ReactNode }) =>
  typeof item === 'string' ? item : item.label
