import { ExecuteIntegrationResponse } from '../../../types'
import { env } from '@quickbot.io/env'
import { isDefined } from '@quickbot.io/lib'
import { ChatwootBlock, SessionState } from '@quickbot.io/schemas'
import { extractVariablesFromText } from '@quickbot.io/variables/extractVariablesFromText'
import { parseGuessedValueType } from '@quickbot.io/variables/parseGuessedValueType'
import { parseVariables } from '@quickbot.io/variables/parseVariables'
import { defaultChatwootOptions } from '@quickbot.io/schemas/features/blocks/integrations/chatwoot/constants'

const parseSetUserCode = (user: NonNullable<ChatwootBlock['options']>['user'], resultId: string) =>
  user?.email || user?.id
    ? `
window.$chatwoot.setUser(${user?.id ?? user.email ?? `"${resultId}"`}, {
  email: ${user?.email ? user.email : 'undefined'},
  name: ${user?.name ? user.name : 'undefined'},
  avatar_url: ${user?.avatarUrl ? user.avatarUrl : 'undefined'},
  phone_number: ${user?.phoneNumber ? user.phoneNumber : 'undefined'},
});`
    : ''

const parseChatwootOpenCode = ({
  baseUrl,
  websiteToken,
  user,
  resultId,
  botId,
}: ChatwootBlock['options'] & { botId: string; resultId: string }) => {
  const openChatwoot = `${parseSetUserCode(user, resultId)}
  if(window.QuickBot?.unmount) window.QuickBot.unmount();
  window.$chatwoot.setCustomAttributes({
    bot_result_url: "${env.NEXTAUTH_URL}/analytics/${botId}/answers?id=${resultId}",
  });
  window.$chatwoot.toggle("open");
  `

  return `
  window.addEventListener("chatwoot:error", function (error) {
    console.log(error);
  });

  if (window.$chatwoot) {${openChatwoot}}
  else {
  (function (d, t) {
    var BASE_URL = "${baseUrl ?? defaultChatwootOptions.baseUrl}";
    var g = d.createElement(t),
      s = d.getElementsByTagName(t)[0];
    g.src = BASE_URL + "/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g, s);
    g.onload = function () {
      window.chatwootSDK.run({
        websiteToken: "${websiteToken}",
        baseUrl: BASE_URL,
      });
      window.addEventListener("chatwoot:ready", function () {${openChatwoot}});
    };
  })(document, "script");
}`
}

const chatwootCloseCode = `
if (window.$chatwoot) {
  window.$chatwoot.toggle("close");
  window.$chatwoot.toggleBubbleVisibility("hide");
}
`

export const executeChatwootBlock = (
  state: SessionState,
  block: ChatwootBlock,
): ExecuteIntegrationResponse => {
  if (state.whatsApp) return { outgoingEdgeId: block.outgoingEdgeId }
  const { bot, resultId } = state.botsQueue[0]
  const chatwootCode =
    block.options?.task === 'Close widget'
      ? chatwootCloseCode
      : isDefined(resultId)
        ? parseChatwootOpenCode({
          ...block.options,
          botId: bot.id,
          resultId,
        })
        : ''

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'chatwoot',
        chatwoot: {
          scriptToExecute: {
            content: parseVariables(bot.variables, { fieldToParse: 'id' })(chatwootCode),
            args: extractVariablesFromText(bot.variables)(chatwootCode).map((variable) => ({
              id: variable.id,
              value: parseGuessedValueType(variable.value),
            })),
          },
        },
      },
    ],
    logs:
      chatwootCode === ''
        ? [
          {
            status: 'info',
            description: 'Chatwoot block is not supported in preview',
            details: null,
          },
        ]
        : undefined,
  }
}
