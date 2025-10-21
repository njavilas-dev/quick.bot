## Install

```bash
npm install @urbiport/js @urbiport/nextjs
```

## Standard

```tsx
import { Standard } from '@urbiport/nextjs'

const App = () => {
  return <Standard bot="lead-generation-copy-3luzm6b" style={{ width: '100%', height: '600px' }} />
}
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

## Popup

```tsx
import { Popup } from '@urbiport/nextjs'

const App = () => {
  return <Popup bot="lead-generation-copy-3luzm6b" autoShowDelay={3000} />
}
```

This code will automatically trigger the popup window after 3 seconds.

### Open or Close a popup

You can use these commands:

```js
import { open } from '@urbiport/nextjs'

open()
```

```js
import { close } from '@urbiport/nextjs'

close()
```

```js
import { toggle } from '@urbiport/nextjs'

toggle()
```

## Bubble

```tsx
import { Bubble } from '@urbiport/nextjs'

const App = () => {
  return (
    <Bubble
      bot="lead-generation-copy-3luzm6b"
      previewMessage={{
        message: 'I have a question for you!',
        autoShowDelay: 5000,
        avatarUrl: 'https://avatars.githubusercontent.com/u/6652831?v=4',
      }}
      theme={{
        button: { backgroundColor: '#01a952', iconColor: '#FFFFFF' },
        previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
      }}
    />
  )
}
```

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
import { showPreviewMessage } from '@urbiport/nextjs'

QuickBot.showPreviewMessage()
```

```js
import { hidePreviewMessage } from '@urbiport/nextjs'

QuickBot.hidePreviewMessage()
```

### Open or close the chat window

You can use these commands:

```js
import { open } from '@urbiport/nextjs'

open()
```

```js
import { close } from '@urbiport/nextjs'

close()
```

```js
import { toggle } from '@urbiport/nextjs'

toggle()
```

## Additional configuration

You can prefill the bot variable values in your embed code by adding the `prefilledVariables`
option. Here is an example:

```tsx
import { Standard } from '@urbiport/nextjs'

const App = () => {
  return (
    <Standard
      bot="lead-generation-copy-3luzm6b"
      style={{ width: '100%', height: '600px' }}
      prefilledVariables={{
        'Current URL': 'https://my-site.com/account',
        'User name': 'Francisco',
      }}
    />
  )
}
```

It will prefill the `Current URL` variable with "https://my-site.com/account" and the `User name`
variable with "Francisco". More info about variables: [here](/editor/variables).

Note that if your site URL contains query params (i.e. https://quick.bot?User%20name=John%20Doe),
the variables will automatically be injected to the bot. So you don't need to manually transfer
query params to the bot embed configuration.
