import { FileIcon } from '@urbiport/icons'
import { trpc } from '@/lib/trpc'
import { Button, IconButton, InputGroup } from '@chakra-ui/react'
import { env } from '@quickbot.io/env'
import React, { useEffect, useState } from 'react'
import { GoogleSheetsLogo } from './GoogleSheetsLogo'
import { isDefined } from '@quickbot.io/lib'
import { InputText, FormControl } from '@urbiport/ui'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any

type Props = {
  spreadsheetId?: string
  credentialsId: string
  workspaceId: string
  onSpreadsheetIdSelect: (spreadsheetId: string) => void
}

export const GoogleSpreadsheetPicker = ({
  spreadsheetId,
  workspaceId,
  credentialsId,
  onSpreadsheetIdSelect,
}: Props) => {
  const [isPickerInitialized, setIsPickerInitialized] = useState(false)

  const { data } = trpc.googleSheets.getAccessToken.useQuery({
    workspaceId,
    credentialsId,
  })
  const { data: spreadsheetData, status } = trpc.googleSheets.getSpreadsheetName.useQuery(
    {
      workspaceId,
      credentialsId,
      spreadsheetId: spreadsheetId as string,
    },
    {
      enabled: !!spreadsheetId,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  useEffect(() => {
    loadScript('gapi', 'https://apis.google.com/js/api.js', () => {
      window.gapi.load('picker', () => {
        setIsPickerInitialized(true)
      })
    })
  }, [])

  const loadScript = (id: string, src: string, callback: { (): void; (): void; (): void }) => {
    const existingScript = document.getElementById(id)
    if (existingScript) {
      callback()
      return
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'

    script.onload = function () {
      callback()
    }

    script.src = src
    document.head.appendChild(script)
  }

  const createPicker = () => {
    if (!data) return
    if (!isPickerInitialized) throw new Error('Google Picker not inited')

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(data.accessToken)
      .setDeveloperKey(env.NEXT_PUBLIC_GOOGLE_API_KEY)
      .setCallback(pickerCallback)
      .build()

    picker.setVisible(true)
  }

  const pickerCallback = (data: { action: string; docs: { id: string }[] }) => {
    if (data.action !== 'picked') return
    const spreadsheetId = data.docs[0]?.id
    if (!spreadsheetId) return
    onSpreadsheetIdSelect(spreadsheetId)
  }

  return (
    <FormControl
      helperText="Make sure your spreadsheet contains at least one sheet with a header row and no duplicate column names."
    >
      {spreadsheetData && spreadsheetData.name !== '' ? (
        <InputGroup flex={1} gap={1}>
          <InputText
            isReadOnly
            value={spreadsheetData.name}
            leftIcon={<GoogleSheetsLogo />}
            sx={{ pointerEvents: 'none' }}
          />
          <IconButton
            icon={<FileIcon />}
            onClick={createPicker}
            isLoading={!isPickerInitialized}
            aria-label={'Pick another spreadsheet'}
            title="Pick another spreadsheet"
          />
        </InputGroup>
      ) : (
        <Button
          onClick={createPicker}
          isLoading={!isPickerInitialized || (isDefined(spreadsheetId) && status === 'loading')}
        >
          Pick a spreadsheet
        </Button>
      )}
    </FormControl>
  )
}
