import { StartChatResponse } from '@quickbot.io/schemas'

export const setPaymentInProgressInStorage = (
  state: Pick<StartChatResponse, 'bot' | 'sessionId' | 'resultId'>,
) => {
  sessionStorage.setItem('botPaymentInProgress', JSON.stringify(state))
}

export const getPaymentInProgressInStorage = () => sessionStorage.getItem('botPaymentInProgress')

export const removePaymentInProgressFromStorage = () => {
  sessionStorage.removeItem('botPaymentInProgress')
}
