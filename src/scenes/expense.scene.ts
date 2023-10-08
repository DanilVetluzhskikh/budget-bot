import { Markup, Scenes } from "telegraf"
import { Expense, IExpense } from "../models/Expense"
import { Budget } from '../models/Budget'
import { ExpenseService } from "../services/expense.service"
import moment from 'moment'
import { MyWizardContext } from "../context/context"

const availableTypes = ['🍎 Продукты', '🏠 Бытовая', '🖥 Техника', '📃 Подписки/Пассивы', '👔 Одежда', '❓ Непредвиденные']

export const makeExpenseCommand = new Scenes.WizardScene<MyWizardContext>(
    'make-expense',
    (ctx) => {
        ctx.reply('Выберите тип покупки', Markup.keyboard([
            ['🍎 Продукты', '🏠 Бытовая'],
            ['🖥 Техника', '📃 Подписки/Пассивы'],
            ['👔 Одежда', '❓ Непредвиденные'],
            ['Выйти'],
        ]).resize())
        return ctx.wizard.next()
    },
    (ctx) => {
        const selectedType = ctx.message?.text || ''

        if (selectedType === 'Выйти') {
            ctx.reply('Выход из режима ввода трат.', {
                reply_markup: {
                    remove_keyboard: true,
                },
            })
            return ctx.scene.leave()
        }

        if (!availableTypes.includes(selectedType)) {
            ctx.reply('Такой категории не существует. Пожалуйста, выберите категорию из предложенного списка.')
            return ctx.wizard.selectStep(ctx.wizard.cursor)
        }

        ctx.wizard.state.selectedType = selectedType
        ctx.reply('Введите сумму, которую вы потратили:', {
            reply_markup: {
                remove_keyboard: true,
            },
        })
        return ctx.wizard.next()
    },
    async (ctx) => {
        const amountText = ctx.message?.text || ''
        const amount = parseFloat(amountText)

        if (isNaN(amount)) {
            ctx.reply('Пожалуйста, введите действительное число.')
            return
        }

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

        if (amount > remainingBudget) {
            ctx.reply(`Ваши траты превышают оставшийся бюджет на ${amount - remainingBudget}₽. Пожалуйста, проверьте свои расходы или установите новый бюджет.`)
            return
        }

        const expense = new Expense({
            userId: ctx.from?.id,
            amount: amount,
            description: ctx.wizard.state.selectedType,
            date: new Date(),
        })

        // Добавляем новую покупку в бюджет пользователя
        budget.expenses.push(expense)
        
        await expense.save()
        await budget.save()

        ctx.reply('Ваши траты были сохранены.', {
            reply_markup: {
                remove_keyboard: true,
            },
        })
        return ctx.scene.leave()
    }
)

export const getExpensesScene = new Scenes.WizardScene<MyWizardContext>(
    'get-expenses',
    async (ctx) => {
        const expenses = await ExpenseService.getUserExpensesForCurrentMonth(ctx.from?.id || 0)

        if (!expenses.length) {
            ctx.reply('У вас нет трат в этом месяце.')
            return ctx.scene.leave()
        }

        ctx.wizard.state.expenses = expenses  // сохраняем траты в состояние визарда

        ctx.reply('Хотите видеть свои траты с группировкой или в плоском виде?', Markup.keyboard([
            Markup.button.callback('Сделать группировку', 'grouped'),
            Markup.button.callback('В плоском виде', 'flat'),
        ]).resize())

        return ctx.wizard.next()
    },
    (ctx) => {
        const choice = ctx.message?.text || ''
        const expenses: IExpense[] = ctx.wizard.state.expenses || []

        if (choice === 'В плоском виде') {
            let message = 'Ваши траты:\n'
            expenses.forEach(exp => {
                message += `📅 ${moment(exp.date).format('DD.MM.YYYY')} - ${exp.description} - ${exp.amount}₽\n`
            })
            ctx.reply(message, {
                reply_markup: {
                    remove_keyboard: true,
                },
            })
        } else if (choice === 'Сделать группировку') {
            const groupedExpenses: { [key: string]: number } = {}

            expenses.forEach(exp => {
                if (!groupedExpenses[exp.description]) {
                    groupedExpenses[exp.description] = 0
                }
                groupedExpenses[exp.description] += exp.amount
            })

            let message = 'Ваши траты (группированные):\n'
            for (const [desc, amount] of Object.entries(groupedExpenses)) {
                message += `${desc}: ${amount}₽\n`
            }
            ctx.reply(message, {
                reply_markup: {
                    remove_keyboard: true,
                },
            })
        } else {
            ctx.reply('Нет такого варианта ответа')
        }

        return ctx.scene.leave()
    }
)