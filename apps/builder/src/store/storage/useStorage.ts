import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  setRecentIconNames,
  setDefaultIconColor,
  setPreferredRuntime,
  setRecentEmojis,
  setWhatsappPhone,
} from './storageReducer'

export const useStorage = () => {
  const dispatch = useDispatch()
  const storageState = useSelector((state: RootState) => state.storage)

  // IconPicker storage
  const getRecentIconNames = (): string[] => {
    return storageState.recentIconNames
  }

  const updateRecentIconNames = (iconNames: string[]) => {
    dispatch(setRecentIconNames(iconNames))
  }

  const getDefaultIconColor = (): string => {
    return storageState.defaultIconColor
  }

  const updateDefaultIconColor = (color: string) => {
    dispatch(setDefaultIconColor(color))
  }

  // PreviewDrawer storage
  const getPreferredRuntime = (): string => {
    return storageState.preferredRuntime
  }

  const updatePreferredRuntime = (runtime: string) => {
    dispatch(setPreferredRuntime(runtime))
  }

  // EmojiSearchableList storage
  const getRecentEmojis = (): string[] => {
    return storageState.recentEmojis
  }

  const updateRecentEmojis = (emojis: string[]) => {
    dispatch(setRecentEmojis(emojis))
  }

  // WhatsApp phone storage
  const getWhatsappPhone = (): string => {
    return storageState.whatsappPhone
  }

  const updateWhatsappPhone = (phone: string) => {
    dispatch(setWhatsappPhone(phone))
  }

  return {
    getRecentIconNames,
    updateRecentIconNames,
    getDefaultIconColor,
    updateDefaultIconColor,
    getPreferredRuntime,
    updatePreferredRuntime,
    getRecentEmojis,
    updateRecentEmojis,
    getWhatsappPhone,
    updateWhatsappPhone,
  }
}