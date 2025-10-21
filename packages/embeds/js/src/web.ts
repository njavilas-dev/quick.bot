import { registerWebComponents } from './register'
import { parseBot, injectBotInWindow } from './window'

registerWebComponents()

const bot = parseBot()

injectBotInWindow(bot)
