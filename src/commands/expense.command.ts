import { Context, Markup } from "telegraf"

export const expenseCommand = (ctx: Context) => {
    ctx.reply('Что вы хотите сделать?', Markup.keyboard([
        [
            Markup.button.callback('Сделать покупку', 'make_expense'),
            Markup.button.callback('Посмотреть покупки за текущий месяц', 'get_expenses'),
        ],
        [
            Markup.button.callback('Очистить все мои покупки за текущий месяц', 'clear_expenses'),
        ]
    ]).resize())
}