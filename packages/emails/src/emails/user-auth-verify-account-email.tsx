import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Button, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type ForgetMyPasswordEmailProps = {
  name: string
  url: string
}

export const UserAuthVerifyAccountEmail = ({ name, url }: ForgetMyPasswordEmailProps) => (
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
          <Text>Hi {name},</Text>
          <Text>Welcome to Quickbot! We&apos;re thrilled to have you on board.</Text>
          <Text>
            To complete your account setup, please verify your email address by clicking the link
            below:
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={url}>Verify my email</Button>
          <MjmlSpacer height="24px" />
          <Text>If you didn&apos;t create this account, you can safely ignore this message.</Text>
          <MjmlSpacer height="12px" />
          <Text>Thanks for joining us,</Text>
          <Text>Quickbot Team</Text>
          <Text fontSize="12px" color="#888888">
            If the button doesn’t work, you can verify your email using this link:{' '}
            <a href={url} style={{ color: '#007bff', textDecoration: 'underline' }}>
              {url}
            </a>
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendUserAuthVerifyAccountEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof UserAuthVerifyAccountEmail>) => {
  return await sendEmail({
    to,
    subject: 'Quickbot - Verify your email',
    html: render(<UserAuthVerifyAccountEmail {...props} />).html,
  })
}
