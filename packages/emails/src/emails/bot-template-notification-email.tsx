import { Head, Text, Button, HeroImage } from '../components'
import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlSpacer } from '@faire/mjml-react'
import React from 'react'
import { env } from '@quickbot.io/env'

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

type BotTemplateNotificationEmailProps = {
  resultsUrl: string
  answers: { [key: string]: string }
}

export const BotTemplateNotificationEmail = ({
  resultsUrl,
  answers,
}: BotTemplateNotificationEmailProps) => (
  <Mjml>
    <Head />
    <MjmlBody width={600}>
      <MjmlSection padding="0">
        <MjmlColumn>
          <HeroImage src={`${env.NEXTAUTH_URL}/images/email-banner.png`} />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection padding="32px" cssClass="smooth" border="1px solid #e2e8f0">
        <MjmlColumn>
          {Object.keys(answers).map((key, index) => {
            const isEmail = emailRegex.test(answers[key])

            return (
              <Text key={key} paddingTop={index === 0 ? 0 : undefined}>
                <b>{key}</b>:{' '}
                {isEmail ? (
                  <a href={`mailto:${answers[key]}`}>{answers[key]}</a>
                ) : answers[key].includes('\n') ? (
                  answers[key].split('\n').map((line) => (
                    <>
                      {line}
                      <br />
                    </>
                  ))
                ) : (
                  answers[key]
                )}
              </Text>
            )
          })}
          <MjmlSpacer height="24px" />
          <Button link={resultsUrl}>Go to results</Button>
          <Text fontSize="12px" color="#888888">
            If the button doesn’t work, you can see the result using this link:{' '}
            <a href={resultsUrl} style={{ color: '#007bff', textDecoration: 'underline' }}>
              {resultsUrl}
            </a>
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
)
