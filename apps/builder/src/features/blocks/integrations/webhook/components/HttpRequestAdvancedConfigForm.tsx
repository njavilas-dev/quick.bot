import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { Select, Switch } from '@urbiport/ui'
import { TableList, TableListItemProps } from '@/components/TableList'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useToast } from '@urbiport/ui'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Button,
} from '@chakra-ui/react'
import {
  KeyValue,
  VariableForTest,
  ResponseVariableMapping,
  HttpRequest,
  HttpRequestBlock,
} from '@quickbot.io/schemas'
import { useState, useMemo } from 'react'
import { executeWebhook } from '../queries/executeWebhookQuery'
import { convertVariablesForTestToVariables } from '../helpers/convertVariablesForTestToVariables'
import { getDeepKeys } from '../helpers/getDeepKeys'
import { QueryParamsInputs, HeadersInputs } from './KeyValueInputs'
import { VariableForTestInputs } from './VariableForTestInputs'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import {
  HttpMethod,
  defaultTimeout,
  defaultWebhookAttributes,
  defaultWebhookBlockOptions,
  maxTimeout,
} from '@quickbot.io/schemas/features/blocks/integrations/webhook/constants'
import { InputNumberWithVariables } from '@/components/inputs'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { ResponseMappingInputs } from './ResponseMappingInputs'

type Props = {
  blockId: string
  webhook: HttpRequest | undefined
  options: HttpRequestBlock['options']
  onWebhookChange: (webhook: HttpRequest) => void
  onOptionsChange: (options: HttpRequestBlock['options']) => void
}

export const HttpRequestAdvancedConfigForm = ({
  blockId,
  webhook,
  options,
  onWebhookChange,
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate()
  const { bot, save } = useBot()
  const [isTestResponseLoading, setIsTestResponseLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<string>()
  const [responseKeys, setResponseKeys] = useState<string[]>([])
  const { showToast } = useToast()

  const updateMethod = (method: HttpMethod) => onWebhookChange({ ...webhook, method })

  const updateQueryParams = (queryParams: KeyValue[]) =>
    onWebhookChange({ ...webhook, queryParams })

  const updateHeaders = (headers: KeyValue[]) => onWebhookChange({ ...webhook, headers })

  const updateBody = (body: string) => onWebhookChange({ ...webhook, body })

  const updateVariablesForTest = (variablesForTest: VariableForTest[]) =>
    onOptionsChange({ ...options, variablesForTest })

  const updateResponseVariableMapping = (responseVariableMapping: ResponseVariableMapping[]) =>
    onOptionsChange({ ...options, responseVariableMapping })

  const updateAdvancedConfig = (isAdvancedConfig: boolean) =>
    onOptionsChange({ ...options, isAdvancedConfig })

  const updateIsCustomBody = (isCustomBody: boolean) =>
    onOptionsChange({ ...options, isCustomBody })

  const updateTimeout = (timeout: number | undefined) => onOptionsChange({ ...options, timeout })

  const executeTestRequest = async () => {
    if (!bot) return
    setIsTestResponseLoading(true)
    if (!options?.webhook) await save()
    else await save()
    const { data, error } = await executeWebhook(
      bot.id,
      convertVariablesForTestToVariables(options?.variablesForTest ?? [], bot.variables),
      { blockId },
    )
    if (error)
      return showToast({
        detailsTitle: t('toast.details'),
        title: error.name,
        description: error.message,
      })
    setTestResponse(JSON.stringify(data, undefined, 2))
    setResponseKeys(getDeepKeys(data))
    setIsTestResponseLoading(false)
  }

  const updateIsExecutedOnClient = (isExecutedOnClient: boolean) =>
    onOptionsChange({ ...options, isExecutedOnClient })

  const ResponseMappingInputsMemo = useMemo(
    () =>
      function Component(props: TableListItemProps<ResponseVariableMapping>) {
        return <ResponseMappingInputs {...props} dataItems={responseKeys} />
      },
    [responseKeys],
  )

  const isCustomBody = options?.isCustomBody ?? defaultWebhookBlockOptions.isCustomBody

  return (
    <>
      <SwitchWithRelatedSettings
        label={t('blocks.integrations.httpRequestAdvancedConfigForm.advancedConfiguration.label')}
        defaultValue={options?.isAdvancedConfig ?? defaultWebhookBlockOptions.isAdvancedConfig}
        onChange={updateAdvancedConfig}
      >
        <FormControl
          direction="row"
          label={t('blocks.integrations.httpRequestAdvancedConfigForm.executeOnClient.label')}
          moreInfoTooltip={t(
            'blocks.integrations.httpRequestAdvancedConfigForm.executeOnClient.moreInfo',
          )}
        >
          <Switch
            defaultValue={
              options?.isExecutedOnClient ?? defaultWebhookBlockOptions.isExecutedOnClient
            }
            onChange={updateIsExecutedOnClient}
          />
        </FormControl>
        <FormControl label={t('blocks.integrations.httpRequestAdvancedConfigForm.method.label')}>
          <Select
            selectedItem={(webhook?.method ?? defaultWebhookAttributes.method) as HttpMethod}
            onSelect={updateMethod}
            items={Object.values(HttpMethod)}
          />
        </FormControl>
        <Accordion allowMultiple w={'100%'}>
          <AccordionItem>
            <AccordionButton>
              {t('blocks.integrations.httpRequestAdvancedConfigForm.queryParams.label')}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <TableList<KeyValue>
                initialItems={webhook?.queryParams}
                onItemsChange={updateQueryParams}
                addLabel={t('blocks.integrations.httpRequestAdvancedConfigForm.addParam.label')}
              >
                {(props) => <QueryParamsInputs {...props} />}
              </TableList>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              {t('blocks.integrations.httpRequestAdvancedConfigForm.headers.label')}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <TableList<KeyValue>
                initialItems={webhook?.headers}
                onItemsChange={updateHeaders}
                addLabel={t('blocks.integrations.httpRequestAdvancedConfigForm.addHeader.label')}
              >
                {(props) => <HeadersInputs {...props} />}
              </TableList>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              {t('blocks.integrations.httpRequestAdvancedConfigForm.body.label')}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <FormControl
                label={t('blocks.integrations.httpRequestAdvancedConfigForm.customBody.label')}
              >
                <Switch defaultValue={isCustomBody} onChange={updateIsCustomBody} />
              </FormControl>
              {isCustomBody && (
                <FormControl mt={'10px'}>
                  <CodeEditorWithVariables
                    withVariableButton={true}
                    lang="json"
                    w="100%"
                    defaultValue={webhook?.body}
                    onChange={updateBody}

                  />
                </FormControl>
              )}
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              {t('blocks.integrations.httpRequestAdvancedConfigForm.advancedParameters.label')}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <FormControl
                label={t('blocks.integrations.httpRequestAdvancedConfigForm.timeout.label')}
              >
                <InputNumberWithVariables
                  defaultValue={options?.timeout ?? defaultTimeout}
                  min={1}
                  max={maxTimeout}
                  onChange={updateTimeout}
                />
              </FormControl>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              {t('blocks.integrations.httpRequestAdvancedConfigForm.variableValuesForTest.label')}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <TableList<VariableForTest>
                initialItems={options?.variablesForTest}
                onItemsChange={updateVariablesForTest}
                addLabel={t('blocks.integrations.httpRequestAdvancedConfigForm.addEntry.label')}
              >
                {(props) => <VariableForTestInputs {...props} />}
              </TableList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </SwitchWithRelatedSettings>
      {webhook?.url && (
        <Button onClick={executeTestRequest} colorScheme="blue" isLoading={isTestResponseLoading}>
          {t('blocks.integrations.httpRequestAdvancedConfigForm.testRequest.buttonLabel')}
        </Button>
      )}
      {testResponse && (
        <FormControl>
          <CodeEditorWithVariables
            withVariableButton={true}
            lang="json"
            isReadOnly
            defaultValue={testResponse}
          />
        </FormControl>
      )}
      {(testResponse ||
        (options?.responseVariableMapping && options.responseVariableMapping.length > 0)) && (
          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton>
                {t('blocks.integrations.httpRequestAdvancedConfigForm.saveInVariables.label')}
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <TableList<ResponseVariableMapping>
                  initialItems={options?.responseVariableMapping}
                  onItemsChange={updateResponseVariableMapping}
                  addLabel={t('blocks.integrations.httpRequestAdvancedConfigForm.addEntry.label')}
                >
                  {(props) => <ResponseMappingInputsMemo {...props} />}
                </TableList>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
    </>
  )
}
