import { test as setup } from '@playwright/test'
import { globalSetup } from '@quickbot.io/playwright/globalSetup'

setup('setup db', async () => {
  try {
    await globalSetup()
    console.log('Database setup complete')
  } catch (error) {
    console.error('Error during database setup:', error)
  }
})
