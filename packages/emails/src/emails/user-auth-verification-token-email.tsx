import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Head, Button } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type UserAuthVerificationTokenEmailProps = {
  name: string
  token: string
  url: string
}

export const UserAuthVerificationTokenEmail = (props: UserAuthVerificationTokenEmailProps) => (
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
          <Text>Hi {props.name},</Text>
          <Text>Welcome to Quickbot! We&apos;re thrilled to have you on board.</Text>
          <Text>
            To continue verifying your account, click the button below:
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={props.url} align="center">
            Complete Registration
          </Button>
          <MjmlSpacer height="24px" />
          <Text fontSize="12px" color="#888888">
            Or paste this token in the plugin: {props.token}
          </Text>
          <MjmlSpacer height="24px" />
          <Text>If you didn&apos;t create this account, you can safely ignore this message.</Text>
          <MjmlSpacer height="12px" />
          <Text>Thanks for joining us,</Text>
          <Text>Quickbot Team</Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
);

export const sendUserAuthVerificationTokenEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof UserAuthVerificationTokenEmail>) =>
  sendEmail({
    to,
    subject: 'Quickbot - Verification Token',
    html: render(<UserAuthVerificationTokenEmail {...props} />).html,
  })
