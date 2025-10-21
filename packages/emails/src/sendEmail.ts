import { createTransport, SendMailOptions } from 'nodemailer'
import { env } from '@quickbot.io/env'

export class EmailSendError extends Error {
  originalError: unknown

  constructor(message: string, originalError: unknown) {
    super(message)
    this.name = 'EmailSendError'
    this.originalError = originalError
  }
}

export const sendEmail = async (props: Pick<SendMailOptions, 'to' | 'html' | 'subject'>) => {
  if (env.TEST_ENV) {
    return {
      messageId: 'test-message-id',
      accepted: [props.to],
      rejected: [],
      pending: [],
      response: 'Test environment - email not sent'
    }
  }
  const transporter = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD,
    },
  })

  try {
    return await transporter.sendMail({
      from: env.NEXT_PUBLIC_SMTP_FROM,
      ...props,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new EmailSendError('Failed to send email. Please try again later.', error)
  }
}
