import cron from 'node-cron'
import { getUsersIds } from '../utils/getUsers'
import { Telegraf } from 'telegraf'
import { daysInMonth, getSpentToday } from '../utils/month'
import { Budget } from '../models/Budget'

export const morningNotification = (bot: Telegraf) => {
    cron.schedule('00 9 * * *', async () => {
        const userIds = await getUsersIds()  // Ваша функция для получения всех пользователей
        const currentDay = new Date().getDate()
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()
        const daysInCurrentMonth = daysInMonth(currentMonth, currentYear) - (currentDay - 1)
    
        for (const userId of userIds) {
            const budget = await Budget.findOne({
                userId: userId,
                month: currentMonth,
                year: currentYear
            })
    
            if (budget) {
                const remainingAmount = budget.amount - budget.expenses.reduce((sum, exp) => sum + exp.amount, 0)
                const dailyAmountConsideringRemaining = remainingAmount / daysInCurrentMonth
    
                bot.telegram.sendMessage(userId, `Сегодня вы можете потратить ${dailyAmountConsideringRemaining.toFixed(2)}₽. Это ваш дневной лимит, учитывая оставшийся бюджет.`)
            }
        }
    }, {
        timezone: "Asia/Yekaterinburg"
    })
}

export const nightNotification = (bot: Telegraf) => {
    cron.schedule('00 22 * * *', async () => {
        const userIds = await getUsersIds()
        const currentDay = new Date().getDate()
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()
        const daysInCurrentMonth = daysInMonth(currentMonth, currentYear) - (currentDay - 1)
    
        for (const userId of userIds) {
            const budget = await Budget.findOne({
                userId: userId,
                month: currentMonth,
                year: currentYear
            })
    
            if (budget) {
                const sumFilterExpenses = budget.expenses.filter((item) => item.date.getDate() < new Date().getDate()).reduce((sum, exp) => sum + exp.amount, 0)

                const spentToday = await getSpentToday(userId)
                const dailyLimit = (budget.amount - sumFilterExpenses) / daysInCurrentMonth
                const overLimit = spentToday - dailyLimit
                const message = overLimit > 0
                    ? `Сегодня вы потратили ${spentToday}₽ и превысили ваш дневной лимит на ${overLimit.toFixed(2)}₽. Старайтесь экономить!`
                    : `Сегодня вы потратили ${spentToday}₽. Отлично, вы уложились в свой дневной лимит!`
    
                bot.telegram.sendMessage(userId, message)
            }
        }
    }, {
        timezone: "Asia/Yekaterinburg"
    })
}