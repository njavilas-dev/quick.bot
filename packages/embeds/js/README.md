# QuickBot JS library

Frontend library to embed bots from [QuickBot](https://quick.bot/).

## Installation

### Using npm

To install, simply run:

```bash
npm install @urbiport/js
```

### Directly in your HTML

```
<script type="module">
  import QuickBot from 'https://cdn.jsdelivr.net/npm/@urbiport/js@0.3/dist/web.js'

  QuickBot.initStandard({
    bot: 'my-bot',
  })
</script>

<quickbot-standard style="width: 100%; height: 600px; "></quickbot-standard>
```

## Standard

You can get the standard HTML and Javascript code by clicking on the "Javascript" button in the
"Deploy" tab of your bot.

There, you can change the container dimensions. Here is a code example:

```html
<script type="module">
  import QuickBot from 'https://cdn.jsdelivr.net/npm/@urbiport/js@0.3/dist/web.js'

  QuickBot.initStandard({
    bot: 'my-bot',
  })
</script>

<quickbot-standard style="width: 100%; height: 600px; "></quickbot-standard>
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

## Popup

You can get the popup HTML and Javascript code by clicking on the "Javascript" button in the
"Deploy" tab of your bot.

Here is an example:

```html
<script type="module">
  import QuickBot from 'https://cdn.jsdelivr.net/npm/@urbiport/js@0.3/dist/web.js'

  QuickBot.initPopup({
    bot: 'my-bot',
    apiHost: 'http://localhost:3001',
    autoShowDelay: 3000,
  })
</script>
```

This code will automatically trigger the popup window after 3 seconds.

### Open or Close a popup

You can use these commands:

```js
QuickBot.open()
```

```js
QuickBot.close()
```

```js
QuickBot.toggle()
```

You can bind these commands on a button element, for example:

```html
<button onclick="QuickBot.open()">Contact us</button>
```

## Bubble

You can get the bubble HTML and Javascript code by clicking on the "Javascript" button in the
"Deploy" tab of your bot.

Here is an example:

```html
<script type="module">
  import QuickBot from 'https://cdn.jsdelivr.net/npm/@urbiport/js@0.3/dist/web.js'

  QuickBot.initBubble({
    bot: 'my-bot',
    previewMessage: {
      message: 'I have a question for you!',
      autoShowDelay: 5000,
      avatarUrl: 'https://avatars.githubusercontent.com/u/6652831?v=4',
    },
    theme: {
      button: { backgroundColor: '#01a952', iconColor: '#FFFFFF' },
      previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
      chatWindow: { backgroundColor: '#ffffff' },
    },
  })
</script>
```

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
QuickBot.showPreviewMessage()
```

```js
QuickBot.hidePreviewMessage()
```

### Open or close the bot

You can use these commands:

```js
QuickBot.open()
```

```js
QuickBot.close()
```

```js
QuickBot.toggle()
```

You can bind these commands on a button element, for example:

```html
<button onclick="QuickBot.open()">Contact us</button>
```

## Additional configuration

You can prefill the bot variable values in your embed code by adding the `prefilledVariables`
option. Here is an example:

```js
QuickBot.initStandard({
  bot: 'my-bot',
  prefilledVariables: {
    'Current URL': 'https://my-site.com/account',
    'User name': 'Francisco',
  },
})
```

It will prefill the `Current URL` variable with "https://my-site.com/account" and the `User name`
variable with "Francisco". More info about variables: [here](/editor/variables).

Note that if your site URL contains query params (i.e. https://quick.bot?User%20name=John%20Doe),
the variables will automatically be injected to the bot. So you don't need to manually transfer
query params to the bot embed configuration.
