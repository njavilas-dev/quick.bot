import { Button, MenuItem, Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { BubbleProps } from '@urbiport/nextjs'
import { BubbleTheme, ButtonTheme } from '@urbiport/nextjs'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu, FormControl, H4, InputColor } from '@urbiport/ui'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useBot } from '@/features/editor/providers/BotProvider'

type Props = {
  isPreviewMessageEnabled: boolean
  theme: BubbleProps['theme']
  onChange: (newBubbleTheme: BubbleProps['theme']) => void
}

export const ThemeSettings = ({ isPreviewMessageEnabled, theme, onChange }: Props) => {
  const { t } = useTranslate()

  const { workspace } = useWorkspace()
  const { bot } = useBot()

  const handleChangePlacement = (placement: BubbleTheme['placement']) => {
    onChange({
      ...theme,
      placement,
    })
  }

  const handleChangeButtonBackground = (backgroundColor: string) => {
    onChange({
      ...theme,
      button: {
        ...theme?.button,
        backgroundColor,
      },
    })
  }

  const handleChangeButtonIcon = (customIconSrc: string) => {
    onChange({
      ...theme,
      button: {
        ...theme?.button,
        customIconSrc,
      },
    })
  }

  const handleChangeButtonSize = (size: ButtonTheme['size']) =>
    onChange({
      ...theme,
      button: {
        ...theme?.button,
        size,
      },
    })

  const handleChangePreviewBackground = (backgroundColor: string) => {
    onChange({
      ...theme,
      previewMessage: {
        ...theme?.previewMessage,
        backgroundColor,
      },
    })
  }

  const handleChangePreviewText = (textColor: string) => {
    onChange({
      ...theme,
      previewMessage: {
        ...theme?.previewMessage,
        textColor,
      },
    })
  }

  const handleChangePreviewCloseBackground = (closeButtonBackgroundColor: string) => {
    onChange({
      ...theme,
      previewMessage: {
        ...theme?.previewMessage,
        closeButtonBackgroundColor,
      },
    })
  }

  const handleChangePreviewCloseColor = (closeButtonIconColor: string) => {
    onChange({
      ...theme,
      previewMessage: {
        ...theme?.previewMessage,
        closeButtonIconColor,
      },
    })
  }

  return (
    <>
      <FormControl direction="row" label="Placement">
        <DropdownMenu
          menuButton={theme?.placement ?? 'right'}
          menuButtonProps={{
            as: Button,
            size: 'sm',
            rightIcon: <ChevronDownIcon />,
          }}
        >
          <MenuItem onClick={() => handleChangePlacement('right')}>right</MenuItem>
          <MenuItem onClick={() => handleChangePlacement('left')}>left</MenuItem>
        </DropdownMenu>
      </FormControl>
      <H4>Button</H4>
      <FormControl direction="row" label="Size">
        <DropdownMenu
          menuButton={theme?.button?.size ?? 'medium'}
          menuButtonProps={{
            as: Button,
            size: 'sm',
            rightIcon: <ChevronDownIcon />,
          }}
        >
          <MenuItem onClick={() => handleChangeButtonSize('medium')}>medium</MenuItem>
          <MenuItem onClick={() => handleChangeButtonSize('large')}>large</MenuItem>
        </DropdownMenu>
      </FormControl>
      <FormControl direction="row" label="Color">
        <InputColor
          defaultValue={theme?.button?.backgroundColor}
          onChange={handleChangeButtonBackground}
        />
      </FormControl>
      <FormControl direction="row" label="Custom icon">
        <Popover isLazy>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button size="sm">Pick an image</Button>
              </PopoverTrigger>
              <PopoverContent p="4" w="500px">
                {workspace?.id && bot?.id && (
                  <ImageUploadContent
                    onChange={(url) => {
                      handleChangeButtonIcon(url)
                      onClose()
                    }}
                    uploadFileProps={{
                      workspaceId: workspace.id,
                      botId: bot.id,
                      fileName: 'bubble-icon',
                    }}
                  />
                )}
              </PopoverContent>
            </>
          )}
        </Popover>
      </FormControl>
      {isPreviewMessageEnabled ? (
        <>
          <H4>Preview message</H4>
          <FormControl direction="row" label="Background color">
            <InputColor
              defaultValue={theme?.previewMessage?.backgroundColor}
              onChange={handleChangePreviewBackground}
            />
          </FormControl>
          <FormControl direction="row" label={t('theme.sideMenu.chat.theme.text')}>
            <InputColor
              defaultValue={theme?.previewMessage?.textColor}
              onChange={handleChangePreviewText}
            />
          </FormControl>
          <FormControl direction="row" label="Close button background">
            <InputColor
              defaultValue={theme?.previewMessage?.closeButtonBackgroundColor}
              onChange={handleChangePreviewCloseBackground}
            />
          </FormControl>
          <FormControl direction="row" label="Close icon color">
            <InputColor
              defaultValue={theme?.previewMessage?.closeButtonIconColor}
              onChange={handleChangePreviewCloseColor}
            />
          </FormControl>
        </>
      ) : null}
    </>
  )
}
