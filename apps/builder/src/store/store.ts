import { combineReducers, legacy_createStore as createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null)
  },
  setItem(_key: string, value: string) {
    return Promise.resolve(value)
  },
  removeItem() {
    return Promise.resolve()
  },
})

import { composeWithDevTools } from '@redux-devtools/extension'
import accountReducer from './account/accountReducer'
import workspaceReducer from './workspace/workspaceReducer'
import storageReducer from './storage/storageReducer'

const rootReducer = combineReducers({
  account: accountReducer,
  workspace: workspaceReducer,
  storage: storageReducer,
})

const persistConfig = {
  key: 'quickbot_root_store',
  storage: typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage(),
  whitelist: ['workspace', 'storage'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer, composeWithDevTools())
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
