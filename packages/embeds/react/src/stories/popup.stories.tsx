import { Popup } from '../Popup'
import { open, toggle } from '@urbiport/js'
import { leadGenerationBot } from './assets/leadGenerationBot'

export const Default = () => {
  return (
    <>
      <button onClick={open}>Open modal</button>
      <button onClick={toggle}>Toggle modal</button>
      <Popup
        bot={leadGenerationBot}
        apiHost="http://localhost:3001"
        autoShowDelay={3000}
        theme={{
          width: '800px',
        }}
        isPreview
      />
    </>
  )
}
