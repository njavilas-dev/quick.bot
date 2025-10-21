import React from 'react'
import {
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks'
import { createPlugins } from '@udecode/plate-core'
import { createLinkPlugin, ELEMENT_LINK } from '@udecode/plate-link'
import { LinkFloatingToolbar } from './plate/LinkFloatingInput'

export const plugins = createPlugins(
  [
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createLinkPlugin({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderAfterEditable: LinkFloatingToolbar as any,
      options: {
        isUrl: (url: string) =>
          url.startsWith('http:') ||
          url.startsWith('https:') ||
          url.startsWith('mailto:') ||
          url.startsWith('tel:') ||
          url.startsWith('sms:'),
        forceSubmit: true,
      },
    }),
  ],
  {
    components: {
      [ELEMENT_LINK]: (props) => (
        <a href={props.element.url} target="_blank" rel="noreferrer" className={props.className}>
          {props.children}
        </a>
      ),
    },
  },
)
