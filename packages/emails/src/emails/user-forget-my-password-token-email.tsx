import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type UserForgetMyPasswordTokenEmailProps = {
  token: string
}

export const UserForgetMyPasswordTokenEmail = ({ token }: UserForgetMyPasswordTokenEmailProps) => (
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
          <Text>
            We received a request to reset your password. If you did not make this request, you can
            safely ignore this message.
          </Text>
          <Text>
            Copy the verification token below and enter it to proceed with resetting your password.
          </Text>
          <MjmlSpacer height="24px" />
          <Text>{token}</Text>
          <MjmlSpacer height="24px" />
          <Text>If you encounter any issues or need assistance, feel free to reach out to us.</Text>
          <MjmlSpacer height="12px" />
          <Text>Thank you,</Text>
          <Text>Quickbot Team</Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendUserForgetMyPasswordTokenEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof UserForgetMyPasswordTokenEmail>) =>
  sendEmail({
    to,
    subject: 'Quickbot - Reset your password',
    html: render(<UserForgetMyPasswordTokenEmail {...props} />).html,
  })
