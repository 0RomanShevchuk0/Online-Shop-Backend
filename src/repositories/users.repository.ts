import { UserUpdateType } from "./../types/user/user-update"
import { UserCreateType } from "./../types/user/user-create"
import { IUser, UserModel } from "../models/user.model"

export const usersRepository = {
  async findUsers(): Promise<IUser[]> {
    return UserModel.find({}).exec()
  },

  async findUserById(id: string): Promise<IUser | null> {
    return UserModel.findOne({ id })
  },

  async createUser(newUser: UserCreateType): Promise<IUser> {
    return UserModel.create(newUser)
  },

  async updateUser(id: string, updatedUser: UserUpdateType): Promise<IUser | null> {
    return UserModel.findOneAndUpdate({ id  }, {$set: updatedUser}, {new: true})
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ id })
    return result.deletedCount === 1
  },
}
