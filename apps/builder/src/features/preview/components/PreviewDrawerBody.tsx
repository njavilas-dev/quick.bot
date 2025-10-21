import { runtimes } from '../data'
import { PreviewWeb } from './PreviewWeb'
import { PreviewWhatsApp } from './PreviewWhatsApp'

type Props = {
  runtime: (typeof runtimes)[number]['name']
}

export const PreviewDrawerBody = ({ runtime }: Props): JSX.Element => {
  switch (runtime) {
    case 'Web': {
      return <PreviewWeb />
    }
    case 'WhatsApp': {
      return <PreviewWhatsApp />
    }
  }
}
