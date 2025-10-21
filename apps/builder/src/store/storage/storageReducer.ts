import { AnyAction } from 'redux'

export type StorageState = {
  recentIconNames: string[]
  defaultIconColor: string
  preferredRuntime: string
  recentEmojis: string[]
  whatsappPhone: string
}

const initialState: StorageState = {
  recentIconNames: [],
  defaultIconColor: 'bg',
  preferredRuntime: '',
  recentEmojis: [],
  whatsappPhone: '',
}

export const SET_RECENT_ICON_NAMES = 'SET_RECENT_ICON_NAMES'
export const SET_DEFAULT_ICON_COLOR = 'SET_DEFAULT_ICON_COLOR'
export const SET_PREFERRED_RUNTIME = 'SET_PREFERRED_RUNTIME'
export const SET_RECENT_EMOJIS = 'SET_RECENT_EMOJIS'
export const SET_WHATSAPP_PHONE = 'SET_WHATSAPP_PHONE'

export const setRecentIconNames = (payload: string[]) => ({
  type: SET_RECENT_ICON_NAMES,
  payload,
})

export const setDefaultIconColor = (payload: string) => ({
  type: SET_DEFAULT_ICON_COLOR,
  payload,
})

export const setPreferredRuntime = (payload: string) => ({
  type: SET_PREFERRED_RUNTIME,
  payload,
})

export const setRecentEmojis = (payload: string[]) => ({
  type: SET_RECENT_EMOJIS,
  payload,
})

export const setWhatsappPhone = (payload: string) => ({
  type: SET_WHATSAPP_PHONE,
  payload,
})

const storageReducer = (state = initialState, action: AnyAction): StorageState => {
  switch (action.type) {
    case SET_RECENT_ICON_NAMES:
      return { ...state, recentIconNames: action.payload }
    case SET_DEFAULT_ICON_COLOR:
      return { ...state, defaultIconColor: action.payload }
    case SET_PREFERRED_RUNTIME:
      return { ...state, preferredRuntime: action.payload }
    case SET_RECENT_EMOJIS:
      return { ...state, recentEmojis: action.payload }
    case SET_WHATSAPP_PHONE:
      return { ...state, whatsappPhone: action.payload }
    default:
      return state
  }
}

export default storageReducer
