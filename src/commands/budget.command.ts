import { Context, Markup } from "telegraf"

export const budgetCommand = (ctx: Context) => {
    ctx.reply('Что вы хотите сделать с вашим бюджетом на текущий месяц', Markup.keyboard([
        [
            Markup.button.callback('Установить Бюджет', 'budget'),
            Markup.button.callback('Изменить Бюджет', 'change_budget'),
        ],
        [
            Markup.button.callback('Бюджет с учетом покупок', 'buget-with-expenses'),
        ],
        [
            Markup.button.callback('Очистить бюджет с покупками', 'delete-budget'),
        ]
    ]).resize())
}