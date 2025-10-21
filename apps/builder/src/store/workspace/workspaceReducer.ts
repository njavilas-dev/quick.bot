import { AnyAction } from 'redux'

export type WorkspaceState = {
  workspaceId?: string
}

const initialState: WorkspaceState = {
  workspaceId: undefined,
}

export const SET_WORKSPACE_ID = 'SET_WORKSPACE_ID'

export const setWorkspaceId = (payload: string | undefined) => ({
  type: SET_WORKSPACE_ID,
  payload,
})

const workspaceReducer = (state = initialState, action: AnyAction): WorkspaceState => {
  switch (action.type) {
    case SET_WORKSPACE_ID:
      return { ...state, workspaceId: action.payload }
    default:
      return state
  }
}

export default workspaceReducer