import { sendUserAuthMagicLinkEmail } from '@quickbot.io/emails'

type Props = {
  identifier: string
  url: string
}

export const sendVerificationRequest = async ({ identifier, url }: Props) => {
  await sendUserAuthMagicLinkEmail({ url, to: identifier })
}
