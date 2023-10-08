import { Scenes, Telegraf } from 'telegraf'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import LocalSession from 'telegraf-session-local'
import { helpMessage, startMessage } from './messages/start_message'
import { initCommands } from './commands/init'
import { initHears } from './hears/init'
import { budgetScene, changeBudgetScene } from './scenes/budget.scene'
import { getExpensesScene, makeExpenseCommand } from './scenes/expense.scene'
import { User } from './models/User'
import { morningNotification, nightNotification } from './schedule/notifications'

dotenv.config()

const localSession = new LocalSession({ database: 'sessions.json' })
const botToken = process.env.TELEGRAM_TOKEN || ''

const bot = new Telegraf(botToken)

bot.use(localSession.middleware())
bot.use(new Scenes.Stage([budgetScene, changeBudgetScene, makeExpenseCommand, getExpensesScene]))

bot.telegram.setMyCommands([
    { command: '/start', description: 'Начать использование бота' },
    { command: '/help', description: 'Показать список команд' },
    { command: '/budget', description: 'Установить или изменить бюджет' },
    { command: '/expense', description: 'Работа с покупками' }
])

const mongoUri = process.env.MONGODB_URI || ''

mongoose.connect(mongoUri)
    .then(() => console.log('Успешное подключение к базе данных'))
    .catch(err => console.error('Не удалось подключиться к базе данных', err))

bot.start(async (ctx) => {
    const id = ctx.from.id

    ctx.reply(startMessage)
    
    const existingUser = await User.findOne({ userId: ctx.from.id })

    if (!existingUser) {
        const newUser = new User({
            userId: id,
        })

        await newUser.save()
    }
})

bot.help((ctx) => ctx.reply(helpMessage))

initCommands(bot)
initHears(bot)
morningNotification(bot)
nightNotification(bot)

bot.launch()
    .then(() => console.log('Бот запущен'))
    .catch(err => console.error('Не удалось запустить бота', err))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))