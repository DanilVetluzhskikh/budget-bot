import moment from 'moment'
import { Expense } from '../models/Expense'

export const getUserExpensesForCurrentMonth = async (userId: number) => {
    const startOfMonth = moment().startOf('month').toDate()
    const endOfMonth = moment().endOf('month').toDate()

    return await Expense.find({
        userId: userId,
        date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    })
}

export const ExpenseService = {
    getUserExpensesForCurrentMonth
}