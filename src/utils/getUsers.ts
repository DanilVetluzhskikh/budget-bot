import { User } from "../models/User"

export const getUsersIds = async () => {
    const users = await User.find()

    return users.map((i) => i.userId)
}