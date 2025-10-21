import { AnyAction } from 'redux'
import { User } from '@quickbot.io/schemas'

export type AccountState = {
  user?: User
}

const initialState: AccountState = {
  user: undefined,
}

export const SET_ACCOUNT = 'SET_ACCOUNT'

export const setAccount = (payload: User | undefined) => ({
  type: SET_ACCOUNT,
  payload,
})

const accountReducer = (state = initialState, action: AnyAction): AccountState => {
  switch (action.type) {
    case SET_ACCOUNT:
      return { ...state, user: action.payload }
    default:
      return state
  }
}

export default accountReducer