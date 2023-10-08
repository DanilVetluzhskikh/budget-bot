import { Scenes } from "telegraf"
import { BudgetService } from "../services/budget.service"
import { MyWizardContext } from "../context/context"
import moment from 'moment'

export const budgetScene = new Scenes.WizardScene<MyWizardContext>(
    'set-budget',
    (ctx) => {
        ctx.reply('Введите сумму вашего бюджета на этот месяц:', {
            reply_markup: {
                remove_keyboard: true,
            },
        })
        ctx.wizard.next()
    },
    async (ctx) => {
        const amount = parseFloat(ctx.message.text || '')
        
        if (isNaN(amount) || amount < 0) {
            await ctx.reply('Пожалуйста, введите положительное число.')
            ctx.wizard.back()
            return
        }

        const fromId = ctx.from?.id ?? 0
        const currentMonth = moment().month() + 1
        const year = moment().year()

        moment.locale('ru')

        const monthName = moment.months(currentMonth - 1)

        await BudgetService.setBudget(fromId, currentMonth, year, amount)

        await ctx.reply(`Ваш бюджет на ${monthName} установлен и составляет ${amount}.`)
        ctx.scene.leave()
    }
)

export const changeBudgetScene = new Scenes.WizardScene<MyWizardContext>(
    'change-budget',
    (ctx) => {
        ctx.reply('Введите сумму вашего бюджета на этот месяц:', {
            reply_markup: {
                remove_keyboard: true,
            },
        })
        return ctx.wizard.next()
    },
    async (ctx) => {
        const amount = parseFloat(ctx.message?.text || '')
        
        if (isNaN(amount) || amount < 0) {
            await ctx.reply('Пожалуйста, введите положительное число.')
            return ctx.wizard.back()
        }

        const fromId = ctx.from?.id ?? 0
        const currentMonth = moment().month() + 1
        const year = moment().year()

        moment.locale('ru')

        const monthName = moment.months(currentMonth - 1)

        await BudgetService.changeBudget(fromId, currentMonth, year, amount)

        await ctx.reply(`Ваш бюджет на ${monthName} установлен и составляет ${amount}.`)
        return ctx.scene.leave()
    }
)