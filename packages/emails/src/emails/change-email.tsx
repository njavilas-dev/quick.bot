import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Button, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type ChangeEmailConfirmationProps = {
  userName: string
  currentEmail: string
  newEmail: string
  confirmationUrl: string
}

export const ChangeEmailConfirmationEmail = ({
  userName,
  currentEmail,
  newEmail,
  confirmationUrl,
}: ChangeEmailConfirmationProps) => (
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
            Hello <strong>{userName}</strong>,
          </Text>
          <Text>
            You have requested to change your email address on QuickBot.
          </Text>
          <Text>
            <strong>Current email:</strong> {currentEmail}
          </Text>
          <Text>
            <strong>New email:</strong> {newEmail}
          </Text>
          <Text>
            To confirm this change, please click the button below:
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={confirmationUrl}>Confirm email change</Button>
          <MjmlSpacer height="24px" />
          <Text fontSize="14px" color="#ff6b35">
            ⚠️ <strong>Important:</strong> If you did not request this change, please ignore this email.
            Your current email address will remain unchanged.
          </Text>
          <Text fontSize="12px" color="#888888">
            {"If the button doesn't work, you can confirm the change using this link:"}{' '}
            <a href={confirmationUrl} style={{ color: '#007bff', textDecoration: 'underline' }}>
              {confirmationUrl}
            </a>
          </Text>
          <Text fontSize="12px" color="#888888">
            This link will expire in 24 hours for security reasons.
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendChangeEmailConfirmationEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof ChangeEmailConfirmationEmail>) =>
  sendEmail({
    to,
    subject: "QuickBot - Confirm your email change",
    html: render(<ChangeEmailConfirmationEmail {...props} />).html,
  })
