import { Budget } from "../models/Budget"

export const setBudget = async (userId: number, month: number, year: number, amount: number) => {
    let budget = await Budget.findOne({ userId, month, year })
    
    if (budget) {
        throw new Error('Бюджет на этот месяц уже установлен')
    }
    
    budget = new Budget({ userId, month, amount, year })
    return budget.save()
}

export const changeBudget = async (userId: number, month: number, year: number, amount: number) => {
    const budget = await Budget.findOne({ userId, month, year })
    
    if (!budget) {
        throw new Error('Бюджета на текущий месяц нет')
    }
    
    budget.amount = amount
     
    return budget.save()
}
  
export const getBudget = async (userId: number, month: number, year: number) => {
    return Budget.findOne({ userId, month, year })
}

export const BudgetService = {
    setBudget,
    getBudget,
    changeBudget,
}