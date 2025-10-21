import React from 'react'
import { TabList, TabPanel, TabPanels, Tabs, Tab } from '../../atoms'
import { ColorPicker } from '../color-picker'

type ColorPickerProps = {
  color: string | undefined
  setColor: (color: string) => void
}

export const BackgroundPicker = ({ color, setColor }: ColorPickerProps) => {
  return (
    <Tabs colorScheme="green" w="full" isFitted>
      <TabList mb={4}>
        <Tab>Solid</Tab>
        <Tab isDisabled={true}>Gradient</Tab>
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          <ColorPicker color={color} setColor={setColor} outputFormat="auto" />
        </TabPanel>
        <TabPanel p={0}>Gradient</TabPanel>
      </TabPanels>
    </Tabs>
  )
}
