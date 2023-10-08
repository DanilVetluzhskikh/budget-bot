import { Telegraf } from "telegraf"
import moment from 'moment'
import { BudgetService } from "../services/budget.service"
import { SceneContext } from "../context/context"
import { Expense } from "../models/Expense"
import { Budget } from "../models/Budget"

export const initHears = (bot: Telegraf) => {
    bot.hears(/Установить Бюджет/, async (ctx: SceneContext) => {
        const fromId = ctx.from?.id ?? 0
        const currentMonth = moment().month() + 1
        const year = moment().year()
        
        const budget = await BudgetService.getBudget(fromId, currentMonth, year)

        moment.locale('ru')

        const monthName = moment.months(currentMonth - 1)

        if(budget) {
            await ctx.reply(`Ваш бюджет на ${monthName} уже установлен и составляет ${budget.amount}.`)
        } else {
            if(ctx.scene) {
                ctx.scene.enter('set-budget')
            }
        }
    })

    bot.hears(/Изменить Бюджет/, (ctx: SceneContext) => {
        if(ctx.scene) {
            ctx.scene.enter('change-budget')
        }
    })

    bot.hears(/Сделать покупку/, (ctx: SceneContext) => {
        if(ctx.scene) {
            ctx.scene.enter('make-expense')
        }
    })

    bot.hears(/Посмотреть покупки за текущий месяц/, (ctx: SceneContext) => {
        if(ctx.scene) {
            ctx.scene.enter('get-expenses')
        }
    })

    bot.hears(/Очистить все мои покупки за текущий месяц/, async (ctx) => {
        const startOfMonth = moment().startOf('month').toDate()
        const endOfMonth = moment().endOf('month').toDate()
    
        const result = await Expense.deleteMany({
            userId: ctx.from?.id,
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        })
    
        if (result.deletedCount && result.deletedCount > 0) {
            ctx.reply(`Ваши покупки за текущий месяц были удалены.`)
        } else {
            ctx.reply(`У вас не было покупок в этом месяце.`)
        }
    })

    bot.hears(/Бюджет с учетом покупок/, async (ctx) => {
        const currentMonth = moment().month() + 1
        const currentYear = moment().year()
    
        const budget = await Budget.findOne({
            userId: ctx.from?.id,
            month: currentMonth,
            year: currentYear
        })
    
        if (!budget) {
            ctx.reply("Вы еще не установили бюджет на этот месяц.")
            return
        }
    
        const totalExpenses = budget.expenses.reduce((acc, expense) => acc + expense.amount, 0)
        const remainingBudget = budget.amount - totalExpenses
    
        ctx.reply(`
            Ваш бюджет на этот месяц: ${budget.amount}₽.
            Вы потратили: ${totalExpenses}₽.
            Осталось: ${remainingBudget}₽.
        `)
    })

    bot.hears(/Очистить бюджет с покупками/, async (ctx) => {
        const currentMonth = moment().month() + 1  // `month()` возвращает месяцы от 0 до 11
        const currentYear = moment().year()

        ctx.message.text

        const budget = await Budget.findOne({
            userId: ctx.from?.id,
            month: currentMonth,
            year: currentYear
        })

        const expensesIds = budget?.expenses.map((el) => el.id)
    
        if (!budget) {
            ctx.reply("Вы еще не установили бюджет на этот месяц.")
            return
        }

        if (expensesIds && expensesIds.length) {
            await Expense.deleteMany({ _id: { $in: expensesIds } })
        }
        
        await budget.remove()

        ctx.reply('Бюджет успешно удален', {
            reply_markup: {
                remove_keyboard: true,
            }
        })
    })
}