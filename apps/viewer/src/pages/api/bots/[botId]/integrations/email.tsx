/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicBot, ResultValues, SendEmailBlock, SmtpCredentials } from '@quickbot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { createTransport, getTestMessageUrl } from 'nodemailer'
import { isDefined, isEmpty, isNotDefined, omit } from '@quickbot.io/lib'
import { parseAnswers } from '@quickbot.io/results/parseAnswers'
import { methodNotAllowed, initMiddleware } from '@quickbot.io/lib/api'
import { decrypt } from '@quickbot.io/lib/api/encryption/decrypt'

import Cors from 'cors'
import Mail from 'nodemailer/lib/mailer'
import { BotTemplateNotificationEmail } from '@quickbot.io/emails'
import { render } from '@faire/mjml-react/utils/render'
import prisma from '@quickbot.io/lib/prisma'
import { env } from '@quickbot.io/env'
import { saveErrorLog } from '@quickbot.io/bot-engine/logs/saveErrorLog'
import { saveSuccessLog } from '@quickbot.io/bot-engine/logs/saveSuccessLog'

const cors = initMiddleware(Cors())

const defaultTransportOptions = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
}

const defaultFrom = {
  name: env.NEXT_PUBLIC_SMTP_FROM?.split(' <')[0].replace(/"/g, ''),
  email: env.NEXT_PUBLIC_SMTP_FROM?.match(/<(.*)>/)?.pop(),
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const botId = req.query.botId as string
    const resultId = req.query.resultId as string | undefined
    const {
      credentialsId,
      recipients,
      body,
      subject,
      cc,
      bcc,
      replyTo,
      isBodyCode,
      isCustomBody,
      resultValues,
      fileUrls,
    } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as SendEmailBlock['options'] & {
      resultValues: ResultValues
      fileUrls?: string
    }
    const { name: replyToName } = parseEmailRecipient(replyTo)

    if (!credentialsId) return res.status(404).send({ message: "Couldn't find credentials" })

    const { host, port, isTlsEnabled, username, password, from } =
      (await getEmailInfo(credentialsId)) ?? {}
    if (!from) return res.status(404).send({ message: "Couldn't find credentials" })

    const transportConfig = {
      host,
      port,
      secure: isTlsEnabled ?? undefined,
      auth: {
        user: username,
        pass: password,
      },
    }

    const emailBody = await getEmailBody({
      body,
      isCustomBody,
      isBodyCode,
      botId,
      resultValues,
    })

    if (!emailBody) {
      await saveErrorLog({
        resultId,
        message: 'Email not sent',
        details: {
          transportConfig,
          recipients,
          subject,
          cc,
          bcc,
          replyTo,
          emailBody,
        },
      })
      return res.status(404).send({ message: "Couldn't find email body" })
    }
    const transporter = createTransport(transportConfig)
    const fromName = isEmpty(replyToName) ? from.name : replyToName
    const email: Mail.Options = {
      from: fromName ? `"${fromName}" <${from.email}>` : from.email,
      cc,
      bcc,
      to: recipients,
      replyTo,
      subject,
      attachments: fileUrls
        ?.split(', ')
        .map((url) => (url.startsWith('http') ? { path: url } : undefined))
        .filter(isDefined),
      ...emailBody,
    }
    try {
      const info = await transporter.sendMail(email)
      await saveSuccessLog({
        resultId,
        message: 'Email successfully sent',
        details: {
          transportConfig: {
            ...transportConfig,
            auth: { user: transportConfig.auth.user, pass: '******' },
          },
          email,
        },
      })
      return res.status(200).send({
        message: 'Email sent!',
        info,
        previewUrl: getTestMessageUrl(info),
      })
    } catch (err) {
      await saveErrorLog({
        resultId,
        message: 'Email not sent',
        details: {
          transportConfig: {
            ...transportConfig,
            auth: { user: transportConfig.auth.user, pass: '******' },
          },
          email,
          error: err,
        },
      })
      return res.status(500).send({
        message: `Email not sent. Error: ${err}`,
      })
    }
  }
  return methodNotAllowed(res)
}

const getEmailInfo = async (
  credentialsId: string,
): Promise<SmtpCredentials['data'] | undefined> => {
  if (credentialsId === 'default')
    return {
      host: defaultTransportOptions.host,
      port: defaultTransportOptions.port as number,
      username: defaultTransportOptions.auth.user,
      password: defaultTransportOptions.auth.pass,
      isTlsEnabled: undefined,
      from: defaultFrom,
    }
  const credentials = await prisma.workspaceCredential.findUnique({
    where: { id: credentialsId },
  })
  if (!credentials) return
  return (await decrypt(credentials.data, credentials.iv)) as SmtpCredentials['data']
}

const getEmailBody = async ({
  body,
  isCustomBody,
  isBodyCode,
  botId,
  resultValues,
}: {
  botId: string
  resultValues: ResultValues
} & Pick<NonNullable<SendEmailBlock['options']>, 'isCustomBody' | 'isBodyCode' | 'body'>): Promise<
  { html?: string; text?: string } | undefined
> => {
  if (isCustomBody || (isNotDefined(isCustomBody) && !isEmpty(body)))
    return {
      html: isBodyCode ? body : undefined,
      text: !isBodyCode ? body : undefined,
    }
  const bot = (await prisma.botPublic.findUnique({
    where: { botId: botId },
  })) as unknown as PublicBot
  if (!bot) return
  const answers = parseAnswers({
    answers: (resultValues as any).answers.map((answer: any) => ({
      key:
        (answer.variableId
          ? bot.variables.find((variable) => variable.id === answer.variableId)?.name
          : bot.groups.find((group) => group.blocks.find((block) => block.id === answer.blockId))
            ?.title) ?? '',
      value: answer.content,
    })),
    variables: resultValues.variables,
  })
  return {
    html: render(
      <BotTemplateNotificationEmail
        resultsUrl={`${env.NEXTAUTH_URL}/analytics/${bot.id}/answers`}
        answers={omit(answers, 'submittedAt')}
      />,
    ).html,
  }
}

const parseEmailRecipient = (recipient?: string): { email?: string; name?: string } => {
  if (!recipient) return {}
  if (recipient.includes('<')) {
    const [name, email] = recipient.split('<')
    return {
      name: name.replace(/>/g, '').trim().replace(/"/g, ''),
      email: email.replace('>', '').trim(),
    }
  }
  return {
    email: recipient,
  }
}

export default handler
