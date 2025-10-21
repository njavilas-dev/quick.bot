import { Provider } from 'react-redux'
import { ReactNode } from 'react'
import { persistor, store } from './store'
import { PersistGate } from 'redux-persist/integration/react'

const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ReduxProvider
