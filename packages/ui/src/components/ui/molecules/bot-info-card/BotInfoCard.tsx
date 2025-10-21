import React from 'react'
import {
  Box,
  IconButton,
  Stack,
  Text,
  Tag,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react'
import { CopyIcon, LockIcon, PenOutlineIcon, TrashIcon } from '@urbiport/icons'

type Bot = {
  icon: string | null
  name: string
  title: string | React.JSX.Element
  id: string
  publishedBotId?: string
  totalViews?: number
  totalStarts?: number
  totalCompleted?: number
}

type Props = {
  bot: Bot
  workspaceChatsLimit: number | 'inf'
  translate: (s: string) => string
  onDelete: (id: string) => void
  onUnpublish: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
}

const parseNumberWithCommas = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const BotInfoCard = ({
  bot,
  workspaceChatsLimit,
  translate: t,
  onDelete,
  onUnpublish,
  onDuplicate,
  onEdit,
}: Props) => {
  const { id, title, publishedBotId, totalStarts } = bot
  const chatsPercentage =
    workspaceChatsLimit === 'inf' || workspaceChatsLimit === 0
      ? 0
      : Math.round(((totalStarts || 0) / workspaceChatsLimit) * 100)

  return (
    <Box p={6} border="1px solid" borderColor="divider.lighter" borderRadius="md">
      <Stack direction="row" spacing={2} alignItems="center">
        <Stack flexBasis="55%">
          <Text color="text.normal" fontWeight="medium" display="flex">
            {title}
          </Text>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexBasis="15%">
          <Tag variant={'BotInfo'}>{publishedBotId ? t('folders.botButton.live') : 'Draft'}</Tag>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexBasis="15%">
          <CircularProgress
            value={chatsPercentage}
            color="brand.primary"
            trackColor="green.100"
            size="60px"
            display="flex"
            justifyContent="center"
          >
            <CircularProgressLabel fontSize="10px">
              {parseNumberWithCommas(totalStarts || 0)} /{' '}
              {workspaceChatsLimit === 'inf'
                ? t('billing.usage.unlimited')
                : parseNumberWithCommas(workspaceChatsLimit)}
            </CircularProgressLabel>
          </CircularProgress>
        </Stack>

        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          justifyContent="flex-end"
          flexBasis="15%"
        >
          {!!publishedBotId && (
            <Tooltip
              placement="top"
              rounded="md"
              p="3"
              label={<Text>{t('folders.botButton.unpublish')}</Text>}
            >
              <IconButton
                icon={<LockIcon color="green" />}
                aria-label={t('folders.botButton.unpublish')}
                variant="ghost"
                onClick={() => onUnpublish(id)}
              />
            </Tooltip>
          )}

          <Tooltip
            placement="top"
            rounded="md"
            p="3"
            label={<Text>{t('folders.botButton.duplicate')}</Text>}
          >
            <IconButton
              icon={<CopyIcon />}
              aria-label={t('folders.botButton.duplicate')}
              variant="ghost"
              onClick={() => onDuplicate(id)}
            />
          </Tooltip>

          <Tooltip placement="top" rounded="md" p="3" label={<Text>Edit</Text>}>
            <IconButton
              icon={<PenOutlineIcon color="green" />}
              aria-label="Edit"
              variant="ghost"
              onClick={() => onEdit(id)}
            />
          </Tooltip>

          <Tooltip
            placement="top"
            rounded="md"
            p="3"
            label={<Text>{t('folders.botButton.delete')}</Text>}
          >
            <IconButton
              icon={<TrashIcon />}
              aria-label={t('folders.botButton.delete')}
              variant="ghost"
              onClick={() => onDelete(id)}
            />
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  )
}
