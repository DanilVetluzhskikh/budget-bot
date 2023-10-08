import { Expense } from "../models/Expense"
import moment from 'moment'

export function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate()
}

export async function getSpentToday(userId: number) {
    const startOfDay = moment().startOf('day')
    const endOfDay = moment().endOf('day')

    const expenses = await Expense.find({
        userId: userId,
        date: { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() }
    })

    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
}