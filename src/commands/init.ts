import { Telegraf } from "telegraf"
import { budgetCommand } from "./budget.command"
import { expenseCommand } from "./expense.command"

export const initCommands = (bot: Telegraf) => {
    bot.command('budget', budgetCommand)

    bot.command('expense', expenseCommand)
}