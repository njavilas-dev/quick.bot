import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { HeroImage, Text, Button, Head } from '../components'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type GuestInvitationEmailProps = {
  workspaceName: string
  botName: string
  url: string
  hostEmail: string
  guestEmail: string
}

export const BotCollaboratorInvitationEmail = ({
  workspaceName,
  botName,
  url,
  hostEmail,
  guestEmail,
}: GuestInvitationEmailProps) => (
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
            You have been invited by {hostEmail} to collaborate on his bot{' '}
            <strong>{botName}</strong>.
          </Text>
          <Text>
            From now on you will see this bot in your dashboard under his workspace &quot;
            {workspaceName}&quot; 👍
          </Text>
          <Text>
            Make sure to log in as <i>{guestEmail}</i>.
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={url}>Go to bot</Button>
          <Text fontSize="12px" color="#888888">
            If the button doesn’t work, you can access the bot using this link:{' '}
            <a href={url} style={{ color: '#007bff', textDecoration: 'underline' }}>
              {url}
            </a>
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)

export const sendBotCollaboratorInvitationEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof BotCollaboratorInvitationEmail>) =>
  sendEmail({
    to,
    subject: "QuickBot - You've been invited to collaborate on a bot",
    html: render(<BotCollaboratorInvitationEmail {...props} />).html,
  })
