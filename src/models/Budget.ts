import mongoose, { Schema, Document } from 'mongoose'
import { ExpenseSchema, IExpense } from './Expense'

interface IBudget extends Document {
  userId: number;
  month: number;
  year: number;
  amount: number;
  expenses: [IExpense];
}

const BudgetSchema: Schema = new Schema({
    userId: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    expenses: { type: [ExpenseSchema], default: [] }
})

const Budget = mongoose.model<IBudget>('Budget', BudgetSchema)

export { Budget, IBudget, BudgetSchema }