import React, { ComponentProps } from 'react'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn } from '@faire/mjml-react'
import { render } from '@faire/mjml-react/utils/render'
import { Head, HeroImage, Text } from '../components'
import { parseNumberWithCommas } from '@quickbot.io/lib'
import { SendMailOptions } from 'nodemailer'
import { sendEmail } from '../sendEmail'
import { env } from '@quickbot.io/env'

type AlmostReachedChatsLimitEmailProps = {
  workspaceName: string
  usagePercent: number
  chatsLimit: number
}

const now = new Date()
const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
const readableResetDate = firstDayOfNextMonth.toDateString().split(' ').slice(1, 4).join(' ')

export const WorkspaceBillingPlanUsageLimitEmail = ({
  workspaceName,
  usagePercent,
  chatsLimit,
}: AlmostReachedChatsLimitEmailProps) => {
  const readableChatsLimit = parseNumberWithCommas(chatsLimit)

  return (
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
            <Text>Your bots are chatting a lot. That&apos;s amazing. 💙</Text>
            <Text>
              Your workspace <strong>{workspaceName}</strong> has used {usagePercent}% of the
              included conversations this month. Once you hit {readableChatsLimit} conversations, you will pay as
              you go for additional conversations.
            </Text>
            <Text>Your progress can be monitored on your workspace dashboard settings.</Text>
            <Text>
              Check out the <a href="https://quick.bot/pricing">pricing page</a> for information
              about the pay as you go tiers.
            </Text>
            <Text>As a reminder, your billing cycle ends on {readableResetDate}.</Text>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  )
}

export const sendWorkspaceBillingPlanUsageLimitEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, 'to'> & ComponentProps<typeof WorkspaceBillingPlanUsageLimitEmail>) =>
  sendEmail({
    to,
    subject: "QuickBot - You're close to your workspace plan conversations limit",
    html: render(<WorkspaceBillingPlanUsageLimitEmail {...props} />).html,
  })
