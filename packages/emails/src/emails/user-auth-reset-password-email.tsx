import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Button, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type AuthResetPasswordEmailProps = {
  url: string
}

export const UserAuthResetPasswordEmail = ({ url }: AuthResetPasswordEmailProps) => (
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
            To reset your password, click the link below or copy and paste it into your browser:
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={url}>Change my password</Button>
          <MjmlSpacer height="24px" />
          <Text>If you encounter any issues or need assistance, feel free to reach out to us.</Text>
          <MjmlSpacer height="12px" />
          <Text>Thank you,</Text>
          <Text>Quickbot Team</Text>
          <Text fontSize="12px" color="#888888">
            If the button doesn’t work, you can change your password using this link:{' '}
            <a href={url} style={{ color: '#007bff', textDecoration: 'underline' }}>
              {url}
            </a>
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendUserAuthResetPasswordEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof UserAuthResetPasswordEmail>) =>
  sendEmail({
    to,
    subject: 'Quickbot - Reset your password',
    html: render(<UserAuthResetPasswordEmail {...props} />).html,
  })
