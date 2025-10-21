import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Button, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type Props = {
  url: string
}

export const UserAuthMagicLinkEmail = ({ url }: Props) => (
  <Mjml>
    <Head />
    <MjmlBody width={600}>
      <MjmlSection padding="0">
        <MjmlColumn>
          <HeroImage src={`${env.NEXTAUTH_URL}/images/email-banner.png`} />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection padding="0 24px" cssClass="smooth">
        <MjmlColumn>
          <Text>Here is your magic link 👇</Text>
          <MjmlSpacer />
          <Button link={url} align="center">
            Click here to sign in
          </Button>
          <Text>If you didn&apos;t request this, please ignore this email.</Text>
          <Text>
            Best,
            <br />- QuickBot Team.
          </Text>
          <Text fontSize="12px" color="#888888">
            If the button doesn’t work, you can sign in using this link:{' '}
            <a href={url} style={{ color: '#007bff', textDecoration: 'underline' }}>
              {url}
            </a>
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendUserAuthMagicLinkEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof UserAuthMagicLinkEmail>) => {
  return await sendEmail({
    to,
    subject: 'QuickBot - Sign in',
    html: render(<UserAuthMagicLinkEmail {...props} />).html,
  })
}
