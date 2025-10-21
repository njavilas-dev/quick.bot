import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

const editorContext = createContext<{
  showPreviewDrawer: boolean
  setShowPreviewDrawer: Dispatch<SetStateAction<boolean>>
  startPreviewAtGroup: string | undefined
  setStartPreviewAtGroup: Dispatch<SetStateAction<string | undefined>>
  startPreviewAtEvent: string | undefined
  setStartPreviewAtEvent: Dispatch<SetStateAction<string | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [showPreviewDrawer, setShowPreviewDrawer] = useState<boolean>(false)
  const [startPreviewAtGroup, setStartPreviewAtGroup] = useState<string>()
  const [startPreviewAtEvent, setStartPreviewAtEvent] = useState<string>()

  return (
    <editorContext.Provider
      value={{
        showPreviewDrawer,
        setShowPreviewDrawer,
        startPreviewAtGroup,
        setStartPreviewAtGroup,
        startPreviewAtEvent,
        setStartPreviewAtEvent,
      }}
    >
      {children}
    </editorContext.Provider>
  )
}

export const useEditor = () => useContext(editorContext)
