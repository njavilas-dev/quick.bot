import { store } from '@/store/store'
import { setWhatsappPhone as setWhatsappPhoneAction } from '@/store/storage/storageReducer'

export const getPhoneNumberFromLocalStorage = () => {
  return store.getState().storage.whatsappPhone
}

export const setPhoneNumberInLocalStorage = (phoneNumber: string) => {
  store.dispatch(setWhatsappPhoneAction(phoneNumber))
}