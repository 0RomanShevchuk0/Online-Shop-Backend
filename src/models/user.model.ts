import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  id: string
  email: string
  password: string

  firstName?: string
  lastName?: string

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  firstName: { type: String },
  lastName: { type: String },

  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
})

UserSchema.pre<IUser>("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export const UserModel = mongoose.model<IUser>("User", UserSchema)
