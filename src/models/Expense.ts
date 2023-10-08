import mongoose, { Schema, Document } from 'mongoose'

interface IExpense extends Document {
  userId: number;
  amount: number;
  description: string;
  date: Date;
}

const ExpenseSchema: Schema = new Schema({
    userId: { type: Number, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now }
})

const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema)

export { Expense, IExpense, ExpenseSchema }