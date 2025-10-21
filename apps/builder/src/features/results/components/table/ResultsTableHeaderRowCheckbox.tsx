import React, { forwardRef } from 'react'
import { Checkbox, Flex } from '@chakra-ui/react'

export const ResultsTableHeaderRowCheckbox = forwardRef((
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { indeterminate, checked, ...rest }: any,
  ref: React.LegacyRef<HTMLInputElement>,
) => {
  const defaultRef = React.useRef()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedRef: any = ref || defaultRef

  return (
    <Flex justify="center" data-testid="checkbox">
      <Checkbox ref={resolvedRef} {...rest} isIndeterminate={indeterminate} isChecked={checked} />
    </Flex>
  )
})

ResultsTableHeaderRowCheckbox.displayName = 'ResultsTableHeaderRowCheckbox'