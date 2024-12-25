import { env } from "../config/env"
import mongoose from "mongoose"

const mongoUri = env.MONGO_URI
const dbName = env.DB_NAME

if (!mongoUri || !dbName) {
  throw new Error("MongoDB URI or database name is missing in environment variables")
}

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoUri, { dbName })
    console.log(`Connected successfully to the database: ${dbName}`)
  } catch (error) {
    console.log(`Can't connect to database. Error: ${error}`)
    process.exit(1)
  }
}
