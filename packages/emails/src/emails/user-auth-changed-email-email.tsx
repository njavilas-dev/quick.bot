import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type UserAuthChangedEmailProps = {
  userName: string
  oldEmail: string
  newEmail: string
  changedAt: string
}

export const UserAuthChangedEmailEmail = ({
  userName,
  oldEmail,
  newEmail,
  changedAt,
}: UserAuthChangedEmailProps) => (
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
            Your email address has been successfully changed on QuickBot.
          </Text>
          <Text>
            <strong>Previous email:</strong> {oldEmail}
          </Text>
          <Text>
            <strong>New email:</strong> {newEmail}
          </Text>
          <Text>
            <strong>Changed on:</strong> {changedAt}
          </Text>
          <MjmlSpacer height="24px" />
          <Text fontSize="14px" color="#28a745">
            ✅ <strong>Success:</strong> Your account email has been updated successfully.
          </Text>
          <MjmlSpacer height="24px" />
          <Text fontSize="14px" color="#ff6b35">
            ⚠️ <strong>Important:</strong> If you did not make this change, please contact our support team immediately.
            Your account security may be compromised.
          </Text>
          <Text fontSize="12px" color="#888888">
            This is an automated notification for your security. If you made this change, you can safely ignore this email.
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendUserAuthChangedEmailEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof UserAuthChangedEmailEmail>) =>
  sendEmail({
    to,
    subject: "QuickBot - 📧 Email Successfully Updated",
    html: render(<UserAuthChangedEmailEmail {...props} />).html,
  })
