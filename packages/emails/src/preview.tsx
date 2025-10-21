import { render } from '@faire/mjml-react/utils/render'
import fs from 'fs'
import path from 'path'
import {
  WorkspaceBillingPlanUsageLimitEmail,
  BotTemplateNotificationEmail,
  BotCollaboratorInvitationEmail,
  WorkspaceMemberInvitationEmail,
} from './emails'
import { UserAuthMagicLinkEmail } from './emails/user-auth-magic-link-email'

const createDistFolder = () => {
  const dist = path.resolve(__dirname, 'dist')
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist)
  }
}

const createHtmlFile = () => {
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'guestInvitation.html'),
    render(
      <BotCollaboratorInvitationEmail
        workspaceName={'Bot'}
        botName={'Lead Generation'}
        url={'https://app.quick.bot'}
        hostEmail={'host@example.com'}
        guestEmail={'guest@example.com'}
      />,
    ).html,
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'workspaceMemberInvitation.html'),
    render(
      <WorkspaceMemberInvitationEmail
        workspaceName={'Bot'}
        url={'https://app.quick.bot'}
        hostEmail={'host@example.com'}
        guestEmail={'guest@example.com'}
      />,
    ).html,
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'almostReachedChatsLimit.html'),
    render(
      <WorkspaceBillingPlanUsageLimitEmail
        usagePercent={86}
        chatsLimit={2000}
        workspaceName="My Workspace"
      />,
    ).html,
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'defaultBotNotification.html'),
    render(
      <BotTemplateNotificationEmail
        resultsUrl={'https://app.quick.bot'}
        answers={{
          'Group #1': 'Answer #1',
          Name: 'QuickBot',
          Email: 'contact@quick.bot',
        }}
      />,
    ).html,
  )
  fs.writeFileSync(
    path.resolve(__dirname, 'dist', 'magicLink.html'),
    render(<UserAuthMagicLinkEmail url={'https://app.quick.bot'} />).html,
  )
}

createDistFolder()
createHtmlFile()
