import mongoose, { Schema, Document } from 'mongoose'

interface IUser extends Document {
  userId: number;
}

const UserSchema: Schema = new Schema({
    userId: { type: Number, required: true, unique: true },
})

const User = mongoose.model<IUser>('User', UserSchema)

export { User, IUser }