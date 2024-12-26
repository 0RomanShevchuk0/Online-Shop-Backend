import { UserCreateType } from "./../types/user/user-create"
import { IUser, UserModel } from "../models/user.model"

export const usersRepository = {
  async findUsers(): Promise<IUser[]> {
    return UserModel.find({}).exec()
  },

  async createUser(newUser: UserCreateType): Promise<IUser> {
    return UserModel.create(newUser)
  },
}
