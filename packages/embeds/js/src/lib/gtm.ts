export const gtmBodyElement = (googleTagManagerId: string) => {
  if (document.getElementById('gtm-noscript')) return ''
  const noScriptElement = document.createElement('noscript')
  noScriptElement.id = 'gtm-noscript'
  const iframeElement = document.createElement('iframe')
  iframeElement.src = `https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`
  iframeElement.height = '0'
  iframeElement.width = '0'
  iframeElement.style.display = 'none'
  iframeElement.style.visibility = 'hidden'
  noScriptElement.appendChild(iframeElement)
  return noScriptElement
}
