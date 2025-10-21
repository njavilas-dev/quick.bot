import { setupDatabase } from './databaseSetup'
import { cleanFolder } from './cleanFolder'

export const globalSetup = async () => {
  await cleanFolder()
  await setupDatabase()
}
