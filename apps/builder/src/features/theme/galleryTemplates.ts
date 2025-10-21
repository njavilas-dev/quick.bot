import { ThemeTemplate } from '@quickbot.io/schemas'
import {
  BackgroundType,
  defaultHostBubblesBackgroundColor,
  defaultGuestBubblesBackgroundColor,
  defaultGuestBubblesColor,
  defaultButtonsBackgroundColor,
  defaultButtonsColor,
  defaultBackgroundColor,
  defaultLightTextColor,
  defaultRoundness,
  defaultInputsShadow
} from '@quickbot.io/schemas/features/bot/theme/constants'

export const lightColors = {
  primary: defaultGuestBubblesBackgroundColor,
  secondary: defaultHostBubblesBackgroundColor,
  background: defaultBackgroundColor,
  primary_text: defaultGuestBubblesColor,
  secondary_text: defaultLightTextColor,
  button_bg: defaultButtonsBackgroundColor,
  button_text: defaultButtonsColor,
  roundeness: defaultRoundness,
  defaultInputsShadow: defaultInputsShadow,
}

export const darkColors = {
  ...lightColors
}

export const galleryTemplates: Pick<ThemeTemplate, 'id' | 'name' | 'theme'>[] = [
  {
    id: 'bot-light',
    name: 'Default',
    theme: {
      chat: {
        hostBubbles: {
          color: lightColors.secondary_text,
          backgroundColor: lightColors.secondary,
          border: {
            roundeness: lightColors.roundeness,
          },
        },
        guestBubbles: {
          color: lightColors.primary_text,
          backgroundColor: lightColors.primary,
          border: {
            roundeness: lightColors.roundeness,
          },
        },
        buttons: {
          backgroundColor: lightColors.button_bg,
          color: lightColors.button_text,
          border: {
            roundeness: lightColors.roundeness,
          },
        },
        inputs: {
          backgroundColor: lightColors.background,
          shadow: 'none',
          border: {
            roundeness: lightColors.roundeness,
          },
        },
      },
      general: {
        background: { type: BackgroundType.COLOR, content: lightColors.background },
      },
    },
  },
  {
    id: 'bot-minimalist',
    name: 'Minimalist',
    theme: {
      chat: {
        hostAvatar: { isEnabled: false },
        hostBubbles: {
          color: lightColors.secondary_text,
          backgroundColor: lightColors.secondary,
          border: {
            roundeness: lightColors.roundeness,
          },
        },
        guestBubbles: {
          color: lightColors.primary_text,
          backgroundColor: lightColors.primary,
          border: {
            roundeness: lightColors.roundeness,
          },
        },
        buttons: {
          backgroundColor: 'transparent',
          color: lightColors.primary_text,
          border: {
            color: lightColors.secondary,
            thickness: 1,
            roundeness: lightColors.roundeness,
          },
        },
        inputs: {
          backgroundColor: lightColors.background,
          border: {
            roundeness: lightColors.roundeness,
          },
        },
      },
      general: {
        background: { type: BackgroundType.COLOR, content: lightColors.background },
      },
    },
  },
]
