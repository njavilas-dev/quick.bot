import {
  InputNumberWithVariables,
  InputTextWithVariables,
  TextareaWithVariables,
} from '@/components/inputs'
import { z } from '@quickbot.io/forge/zod'
import { ZodLayoutMetadata } from '@quickbot.io/forge/zod'
import { evaluateIsHidden } from '@quickbot.io/forge/zod/helpers/evaluateIsHidden'
import Markdown, { Components } from 'react-markdown'
import { ZodTypeAny } from 'zod'
import { ForgeSelectInput } from '../ForgeSelectInput'
import { ZodObjectLayout } from './ZodObjectLayout'
import { TableList } from '@/components/TableList'
import { ZodDiscriminatedUnionLayout } from './ZodDiscriminatedUnionLayout'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  FormLabel,
  Stack,
  Box,
} from '@chakra-ui/react'
import { ForgedBlockDefinition, ForgedBlock } from '@quickbot.io/forge-repository/types'
import { FormControl, Select, Switch } from '@urbiport/ui'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { getZodInnerSchema } from '../../helpers/getZodInnerSchema'
import { PrimitiveList } from '@/components/PrimitiveList'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { InputTags } from '@urbiport/ui'

const parseEnumItems = (schema: z.ZodTypeAny, layout?: ZodLayoutMetadata<ZodTypeAny>) => {
  const values = layout?.hiddenItems
    ? schema._def.values.filter((v: string) => !layout.hiddenItems?.includes(v))
    : schema._def.values
  if (layout?.toLabels)
    return values.map((v: string) => ({
      label: layout.toLabels!(v),
      value: v,
    }))
  return values
}

const mdComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="md-link">
      {children}
    </a>
  ),
} satisfies Components

/* eslint-disable @typescript-eslint/no-explicit-any */
export const ZodFieldLayout = ({
  data,
  schema,
  isInAccordion,
  blockDef,
  blockOptions,
  width,
  onDataChange,
}: {
  data: any
  schema: z.ZodTypeAny
  isInAccordion?: boolean
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  width?: 'full'
  propName?: string
  onDataChange: (val: any) => void
}) => {
  const innerSchema = getZodInnerSchema(schema)
  const layout = innerSchema._def.layout

  if (evaluateIsHidden(layout?.isHidden, blockOptions)) return null

  switch (innerSchema._def.typeName) {
    case 'ZodObject':
      return (
        <ZodObjectLayout
          schema={innerSchema as z.ZodObject<any>}
          data={data}
          onDataChange={onDataChange}
          isInAccordion={isInAccordion}
          blockDef={blockDef}
          blockOptions={blockOptions}
        />
      )
    case 'ZodDiscriminatedUnion': {
      return (
        <ZodDiscriminatedUnionLayout
          discriminant={innerSchema._def.discriminator}
          data={data}
          schema={innerSchema as z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]>}
          dropdownPlaceholder={`Select a ${innerSchema._def.discriminator}`}
          onDataChange={onDataChange}
        />
      )
    }
    case 'ZodArray': {
      if (layout?.accordion)
        return (
          <Accordion allowToggle mb={'-16px'} borderBottomWidth="1px">
            <AccordionItem>
              <AccordionButton>
                {layout?.accordion}
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <ZodArrayContent
                  data={data}
                  schema={innerSchema}
                  blockDef={blockDef}
                  blockOptions={blockOptions}
                  layout={layout}
                  onDataChange={onDataChange}
                  isInAccordion
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )
      return (
        <ZodArrayContent
          data={data}
          schema={innerSchema}
          blockDef={blockDef}
          blockOptions={blockOptions}
          layout={layout}
          onDataChange={onDataChange}
        />
      )
    }
    case 'ZodEnum': {
      return (
        <FormControl
          direction={layout?.direction}
          label={layout?.label}
          isRequired={layout?.isRequired}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          moreInfoTooltip={layout?.moreInfoTooltip}
        >
          <Select
            selectedItem={data ?? layout?.defaultValue}
            onSelect={onDataChange}
            items={parseEnumItems(innerSchema, layout)}
            placeholder={layout?.placeholder}
          />
        </FormControl>
      )
    }
    case 'ZodNumber':
    case 'ZodUnion': {
      return (
        <FormControl
          direction={layout?.direction}
          label={layout?.label}
          isRequired={layout?.isRequired}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          moreInfoTooltip={layout?.moreInfoTooltip}
          width={width}
        >
          <></>
          <InputNumberWithVariables
            withVariableButton={!!layout.withVariableButton}
            defaultValue={data ?? layout?.defaultValue}
            placeholder={layout?.placeholder}
            isRequired={layout?.isRequired}
            onChange={onDataChange}
            debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
          />
        </FormControl>
      )
    }
    case 'ZodBoolean': {
      return (
        <FormControl
          direction={layout?.direction}
          label={layout?.label}
          isRequired={layout?.isRequired}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          moreInfoTooltip={layout?.moreInfoTooltip}
          width={width}
        >
          <Switch defaultValue={data ?? layout?.defaultValue} onChange={onDataChange} />
        </FormControl>
      )
    }
    case 'ZodString': {
      if (layout?.fetcher) {
        if (!blockDef) return null
        return (
          <FormControl
            direction={layout?.direction}
            label={layout?.label}
            isRequired={layout?.isRequired}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>{layout.helperText}</Markdown>
              ) : undefined
            }
            moreInfoTooltip={layout?.moreInfoTooltip}
            width={width}
          >
            <ForgeSelectInput
              defaultValue={data ?? layout.defaultValue}
              placeholder={layout.placeholder}
              fetcherId={layout.fetcher}
              options={blockOptions}
              blockDef={blockDef}
              onChange={onDataChange}
              withVariableButton={!!layout.withVariableButton}
            />
          </FormControl>
        )
      }
      if (layout?.inputType === 'variableDropdown') {
        return (
          <FormControl
            direction={layout?.direction}
            label={layout?.label}
            isRequired={layout?.isRequired}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>{layout.helperText}</Markdown>
              ) : undefined
            }
            moreInfoTooltip={layout?.moreInfoTooltip}
            width={width}
          >
            <VariablesDropdown
              initialVariableId={data}
              onSelect={(variable) => onDataChange(variable?.id)}
              placeholder={layout?.placeholder}
            />
          </FormControl>
        )
      }
      if (layout?.inputType === 'textarea') {
        return (
          <FormControl
            direction={layout?.direction}
            label={layout?.label}
            isRequired={layout?.isRequired}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>{layout.helperText}</Markdown>
              ) : undefined
            }
            moreInfoTooltip={layout?.moreInfoTooltip}
            width={width}
          >
            <TextareaWithVariables
              defaultValue={data ?? layout?.defaultValue}
              placeholder={layout?.placeholder}
              withVariableButton={!!layout?.withVariableButton}
              onChange={onDataChange}
              debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
            />
          </FormControl>
        )
      }

      if (layout?.inputType === 'code')
        return (
          <FormControl
            direction={layout?.direction}
            label={layout?.label}
            isRequired={layout?.isRequired}
            helperText={
              layout?.helperText ? (
                <Markdown components={mdComponents}>{layout.helperText}</Markdown>
              ) : undefined
            }
            moreInfoTooltip={layout?.moreInfoTooltip}
            width={width}
          >
            <CodeEditorWithVariables
              defaultValue={data ?? layout?.defaultValue}
              lang={layout.lang ?? 'javascript'}
              placeholder={layout?.placeholder}
              withVariableButton={!!layout?.withVariableButton}
              onChange={onDataChange}
              debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
            />
          </FormControl>
        )
      return (
        <FormControl
          direction={layout?.direction}
          label={layout?.label}
          isRequired={layout?.isRequired}
          helperText={
            layout?.helperText ? (
              <Markdown components={mdComponents}>{layout.helperText}</Markdown>
            ) : undefined
          }
          moreInfoTooltip={layout?.moreInfoTooltip}
          width={width}
        >
          <InputTextWithVariables
            withVariableButton={!!layout?.withVariableButton}
            debounceTimeout={layout?.isDebounceDisabled ? 0 : undefined}
            defaultValue={data ?? layout?.defaultValue}
            placeholder={layout?.placeholder}
            type={layout?.inputType === 'password' ? 'password' : undefined}
            isRequired={layout?.isRequired}
            onChange={onDataChange}
          />
        </FormControl>
      )
    }
  }
}

const ZodArrayContent = ({
  schema,
  data,
  blockDef,
  blockOptions,
  layout,
  isInAccordion,
  onDataChange,
}: {
  schema: z.ZodTypeAny
  data: any
  blockDef?: ForgedBlockDefinition
  blockOptions?: ForgedBlock['options']
  layout: ZodLayoutMetadata<ZodTypeAny> | undefined
  isInAccordion?: boolean
  onDataChange: (val: any) => void
}) => {
  const type = schema._def.type._def.innerType?._def.typeName

  if (type === 'ZodString' || type === 'ZodNumber' || type === 'ZodEnum')
    return (
      <Stack spacing={0} marginTop={layout?.mergeWithLastField ? '-3' : undefined}>
        {layout?.label && <FormLabel>{layout.label}</FormLabel>}
        <Stack
          p="4"
          borderRadius="md"
          flex="1"
          borderWidth="1px"
          borderTopWidth={layout?.mergeWithLastField ? '0' : undefined}
          borderTopRadius={layout?.mergeWithLastField ? '0' : undefined}
          pt={layout?.mergeWithLastField ? '5' : undefined}
        >
          {type === 'ZodString' ? (
            <InputTags items={data} onChange={onDataChange} />
          ) : (
            <PrimitiveList
              onItemsChange={(items) => {
                onDataChange(items)
              }}
              initialItems={data}
              addLabel={`Add ${layout?.itemLabel ?? ''}`}
            >
              {({ item, onItemChange }) => (
                <ZodFieldLayout
                  schema={schema._def.type}
                  data={item}
                  blockDef={blockDef}
                  blockOptions={blockOptions}
                  isInAccordion={isInAccordion}
                  onDataChange={onItemChange}
                  width="full"
                />
              )}
            </PrimitiveList>
          )}
        </Stack>
      </Stack>
    )
  return (
    <FormControl
      direction={layout?.direction}
      label={layout?.label}
      isRequired={layout?.isRequired}
      helperText={
        layout?.helperText ? (
          <Markdown components={mdComponents}>{layout.helperText}</Markdown>
        ) : undefined
      }
      moreInfoTooltip={layout?.moreInfoTooltip}
      width={layout?.mergeWithLastField ? 'full' : undefined}
      marginTop={layout?.mergeWithLastField ? '-3' : undefined}
    >
      <Box mt="25px">
        <TableList
          onItemsChange={(items) => {
            onDataChange(items)
          }}
          initialItems={data}
          addLabel={`Add ${layout?.itemLabel ?? ''}`}
          isOrdered={layout?.isOrdered}
        >
          {({ item, onItemChange }) => (
            <Stack
              p="4"
              borderRadius="md"
              flex="1"
              borderWidth="1px"
              borderColor="divider.light"
              maxW="100%"
            >
              <ZodFieldLayout
                schema={schema._def.type}
                blockDef={blockDef}
                blockOptions={blockOptions}
                data={item}
                isInAccordion={isInAccordion}
                onDataChange={onItemChange}
              />
            </Stack>
          )}
        </TableList>
      </Box>
    </FormControl>
  )
}
